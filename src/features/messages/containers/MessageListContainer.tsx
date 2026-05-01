import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageList, type MessageListItemData } from '@/features/messages/components/MessageList';
import { getMessages, sendMessage } from '@/features/messages/api/messages';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
import { readCollectionItems, writeCollectionItems, type CollectionCache } from '@/features/chat/realtime/cacheContracts';

type MessageResponseItem = {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  senderName?: string;
  createdAt: string;
  status?: 'pending' | 'delivered' | 'failed';
  retryable?: boolean;
};

type MessagesResponse = {
  items?: MessageResponseItem[];
};

type MessageListContainerProps = {
  currentUserId?: string;
};

type RetryMessageVariables = {
  chatId: string;
  messageId: string;
  content: string;
};

const toMessageListItems = (
  items: MessageResponseItem[] | undefined,
  currentUserId?: string
): MessageListItemData[] => {
  if (!items) {
    return [];
  }

  return items.map((message) => ({
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    senderName: message.senderName,
    createdAt: message.createdAt,
    direction: currentUserId && message.senderId === currentUserId ? 'outbound' : 'inbound',
    status: message.status,
    retryable: message.retryable
  }));
};

export function MessageListContainer({ currentUserId }: MessageListContainerProps) {
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const queryClient = useQueryClient();

  const retryMutation = useMutation({
    mutationFn: ({ chatId, content }: RetryMessageVariables) => sendMessage({ chatId, content }),
    onMutate: ({ chatId, messageId }: RetryMessageVariables) => {
      queryClient.setQueryData<CollectionCache<MessageResponseItem> | MessageResponseItem[]>(['messages', chatId], (current) => {
        const items = readCollectionItems(current);

        const nextItems = items.map((item) => {
          if (item.id !== messageId) {
            return item;
          }

          return {
            ...item,
            status: 'pending' as const,
            retryable: false
          };
        });

        return writeCollectionItems(current, nextItems);
      });
    },
    onSuccess: (
      response: { id?: string; createdAt?: string },
      { chatId, messageId }: RetryMessageVariables
    ) => {
      queryClient.setQueryData<CollectionCache<MessageResponseItem> | MessageResponseItem[]>(['messages', chatId], (current) => {
        const items = readCollectionItems(current);
        const nextItems = items.map((item) => {
          if (item.id !== messageId) {
            return item;
          }

          return {
            ...item,
            id: response.id ?? item.id,
            createdAt: response.createdAt ?? item.createdAt,
            status: 'delivered' as const,
            retryable: false
          };
        });

        return writeCollectionItems(current, nextItems);
      });
    },
    onError: (_error, { chatId, messageId }: RetryMessageVariables) => {
      queryClient.setQueryData<CollectionCache<MessageResponseItem> | MessageResponseItem[]>(['messages', chatId], (current) => {
        const items = readCollectionItems(current);
        const nextItems = items.map((item) => {
          if (item.id !== messageId) {
            return item;
          }

          return {
            ...item,
            status: 'failed' as const,
            retryable: true
          };
        });

        return writeCollectionItems(current, nextItems);
      });
    }
  });

  const { data, isLoading, isError } = useQuery<MessagesResponse>({
    queryKey: ['messages', selectedChatId],
    queryFn: () => getMessages({ chatId: selectedChatId ?? '' }),
    enabled: Boolean(selectedChatId)
  });

  if (!selectedChatId) {
    return <MessageList messages={[]} emptyStateLabel="Seleccioná un chat para ver mensajes" />;
  }

  if (isLoading) {
    return <MessageList messages={[]} emptyStateLabel="Cargando mensajes…" />;
  }

  if (isError) {
    return <MessageList messages={[]} emptyStateLabel="No pudimos cargar los mensajes" />;
  }

  const messages = toMessageListItems(data?.items, currentUserId);
  const handleRetry = (messageId: string) => {
    if (!selectedChatId || retryMutation.isPending) {
      return;
    }

    const targetMessage = data?.items?.find((item) => item.id === messageId);
    if (!targetMessage || !targetMessage.retryable) {
      return;
    }

    retryMutation.mutate({
      chatId: selectedChatId,
      messageId,
      content: targetMessage.content
    });
  };

  return <MessageList messages={messages} emptyStateLabel="No hay mensajes todavía" onRetry={handleRetry} />;
}
