import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageComposer } from '@/features/messages/components/MessageComposer';
import { sendMessage } from '@/features/messages/api/messages';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
import { useSocketGateway } from '@/features/chat/realtime/socketGateway';

type MessageItem = {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  createdAt: string;
  status: 'pending' | 'delivered' | 'failed';
  retryable?: boolean;
};

type MessagesCache = {
  items: MessageItem[];
};

const patchMessage = (
  current: MessagesCache | undefined,
  patcher: (items: MessageItem[]) => MessageItem[]
): MessagesCache => ({
  items: patcher(current?.items ?? [])
});

export function MessageComposerContainer() {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const socketGateway = useSocketGateway();

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (response: { id?: string; createdAt?: string }, variables: { chatId: string; content: string }) => {
      const optimisticId = `tmp:${variables.chatId}:${variables.content}`;

      queryClient.setQueryData<MessagesCache>(['messages', variables.chatId], (current) =>
        patchMessage(current, (items) =>
          items.map((item) => {
            if (item.id !== optimisticId) {
              return item;
            }

            return {
              ...item,
              id: response.id ?? item.id,
              createdAt: response.createdAt ?? item.createdAt,
              status: 'delivered',
              retryable: false
            };
          })
        )
      );
      setContent('');
    },
    onError: (_error, variables) => {
      if (!variables) {
        return;
      }

      const optimisticId = `tmp:${variables.chatId}:${variables.content}`;

      queryClient.setQueryData<MessagesCache>(['messages', variables.chatId], (current) =>
        patchMessage(current, (items) =>
          items.map((item) => {
            if (item.id !== optimisticId) {
              return item;
            }

            return {
              ...item,
              status: 'failed',
              retryable: true
            };
          })
        )
      );
    }
  });

  const handleSend = () => {
    const normalizedContent = content.trim();

    if (!selectedChatId || normalizedContent.length === 0 || mutation.isPending) {
      return;
    }

    const optimisticId = `tmp:${selectedChatId}:${normalizedContent}`;

    queryClient.setQueryData<MessagesCache>(['messages', selectedChatId], (current) =>
      patchMessage(current, (items) => [
        ...items,
        {
          id: optimisticId,
          chatId: selectedChatId,
          content: normalizedContent,
          senderId: 'self',
          createdAt: new Date().toISOString(),
          status: 'pending',
          retryable: false
        }
      ])
    );

    mutation.mutate({
      chatId: selectedChatId,
      content: normalizedContent
    });
  };

  const handleChange = (nextContent: string) => {
    setContent(nextContent);

    if (!selectedChatId) {
      return;
    }

    socketGateway.emitTyping({
      chatId: selectedChatId,
      isTyping: nextContent.trim().length > 0
    });
  };

  return (
    <MessageComposer
      value={content}
      onChange={handleChange}
      onSend={handleSend}
      disabled={!selectedChatId}
      isSubmitting={mutation.isPending}
      placeholder={selectedChatId ? 'Escribí un mensaje…' : 'Seleccioná un chat para escribir'}
    />
  );
}
