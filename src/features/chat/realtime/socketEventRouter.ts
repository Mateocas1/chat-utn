import type { QueryClient } from '@tanstack/react-query';
import queryClient from '@/lib/queryClient';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
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
}

export interface NotificationEventPayload {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
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
  getChatUIState: () => ChatUIStoreWrite;
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
  const deduplicated = safeCurrent.filter((notification) => notification.id !== incoming.id);
  return writeCollectionItems(current, [incoming, ...deduplicated]);
};

export const createSocketEventRouter = ({
  queryClient: queryClientWrite,
  getChatUIState
}: CreateSocketEventRouterOptions) => {
  const handleEvent = (event: SocketEvent) => {
    const chatUIStore = getChatUIState();

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
      chatUIStore.setUserTyping(typingPayload.chatId, typingPayload.userId, typingPayload.userId);
      return;
    }

    const notification = event.payload;

    queryClientWrite.setQueryData<CollectionCache<NotificationEventPayload> | NotificationEventPayload[]>(NOTIFICATIONS_QUERY_KEY, (current) =>
      patchNotifications(current, notification)
    );

    const metadata = notification.metadata as { chatId?: string } | undefined;
    const chatId = metadata?.chatId;
    const threadPushEnabled = chatId ? (chatUIStore.threadPushEnabled[chatId] ?? true) : true;
    const quietHoursAllowsToast = shouldDeliverPushNotification(chatUIStore.quietHours, event.now ?? new Date(notification.createdAt));

    if (threadPushEnabled && quietHoursAllowsToast) {
      chatUIStore.enqueueToast({
        id: notification.id,
        message: notification.message,
        variant: 'info'
      });
    }
  };

  return {
    handleEvent
  };
};

export const socketEventRouter = createSocketEventRouter({
  queryClient,
  getChatUIState: useChatUIStore.getState
});
