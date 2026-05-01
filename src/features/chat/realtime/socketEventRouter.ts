import type { QueryClient } from '@tanstack/react-query';
import queryClient from '@/lib/queryClient';
import { useChatUIStore, type ChatToast } from '@/features/chat/store/chatUIStore';
import { readCollectionItems, writeCollectionItems, type CollectionCache } from '@/features/chat/realtime/cacheContracts';
import { shouldDeliverPushNotification } from '@/features/notifications/push/pushNotifications';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatPreview {
  id: string;
  title: string;
  lastMessage: Message | null;
}

export interface TypingEventPayload {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface NotificationEventPayload {
  id: string;
  message: string;
  variant: ChatToast['variant'];
  createdAt: string;
  mode: 'append' | 'prepend';
  chatId?: string;
  kind?: 'message' | 'mention' | 'system';
}

export type SocketEvent =
  | { type: 'message'; payload: Message }
  | { type: 'typing'; payload: TypingEventPayload }
  | { type: 'notification'; payload: NotificationEventPayload; now?: Date };

type QueryClientWrite = Pick<QueryClient, 'setQueryData'>;

type ChatUIStoreWrite = Pick<
  ReturnType<typeof useChatUIStore.getState>,
  'setUserTyping' | 'clearUserTyping' | 'enqueueToast' | 'quietHours' | 'threadPushEnabled'
>;

interface CreateSocketEventRouterOptions {
  queryClient: QueryClientWrite;
  chatUIStore: ChatUIStoreWrite;
}

export const CHATS_QUERY_KEY = ['chats'] as const;
export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export const createMessageQueryKey = (chatId: string) => ['messages', chatId] as const;

const appendMessage = (
  current: CollectionCache<Message> | Message[] | undefined,
  incoming: Message
): CollectionCache<Message> => {
  const safeCurrent = readCollectionItems(current);
  return writeCollectionItems(current, [...safeCurrent, incoming]);
};

const patchChatPreviews = (
  current: CollectionCache<ChatPreview> | ChatPreview[] | undefined,
  incoming: Message
): CollectionCache<ChatPreview> => {
  const safeCurrent = readCollectionItems(current);

  const nextItems = safeCurrent.map((preview) => {
    if (preview.id !== incoming.chatId) {
      return preview;
    }

    return {
      ...preview,
      lastMessage: incoming
    };
  });

  return writeCollectionItems(current, nextItems);
};

const patchNotifications = (
  current: CollectionCache<NotificationEventPayload> | NotificationEventPayload[] | undefined,
  incoming: NotificationEventPayload
): CollectionCache<NotificationEventPayload> => {
  const safeCurrent = readCollectionItems(current);

  if (incoming.mode === 'prepend') {
    return writeCollectionItems(current, [incoming, ...safeCurrent]);
  }

  return writeCollectionItems(current, [...safeCurrent, incoming]);
};

export const createSocketEventRouter = ({
  queryClient: queryClientWrite,
  chatUIStore
}: CreateSocketEventRouterOptions) => {
  const handleEvent = (event: SocketEvent) => {
    if (event.type === 'message') {
      const message = event.payload;

      queryClientWrite.setQueryData<CollectionCache<Message> | Message[]>(createMessageQueryKey(message.chatId), (current) =>
        appendMessage(current, message)
      );

      queryClientWrite.setQueryData<CollectionCache<ChatPreview> | ChatPreview[]>(CHATS_QUERY_KEY, (current) =>
        patchChatPreviews(current, message)
      );

      return;
    }

    if (event.type === 'typing') {
      const typingPayload = event.payload;
      if (typingPayload.isTyping) {
        chatUIStore.setUserTyping(typingPayload.chatId, typingPayload.userId, typingPayload.userName);
      } else {
        chatUIStore.clearUserTyping(typingPayload.chatId, typingPayload.userId);
      }
      return;
    }

    const notification = event.payload;

    queryClientWrite.setQueryData<CollectionCache<NotificationEventPayload> | NotificationEventPayload[]>(NOTIFICATIONS_QUERY_KEY, (current) =>
      patchNotifications(current, notification)
    );

    const threadPushEnabled = notification.chatId ? (chatUIStore.threadPushEnabled[notification.chatId] ?? true) : true;
    const quietHoursAllowsToast = shouldDeliverPushNotification(chatUIStore.quietHours, event.now ?? new Date(notification.createdAt));

    if (threadPushEnabled && quietHoursAllowsToast) {
      chatUIStore.enqueueToast({
        id: notification.id,
        message: notification.message,
        variant: notification.variant
      });
    }
  };

  return {
    handleEvent
  };
};

export const socketEventRouter = createSocketEventRouter({
  queryClient,
  chatUIStore: useChatUIStore.getState()
});
