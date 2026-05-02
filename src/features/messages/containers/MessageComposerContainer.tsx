import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageComposer } from '@/features/messages/components/MessageComposer';
import { sendMessage, sendTypingSignal } from '@/features/messages/api/messages';
import type { SendMessageResponse } from '@/features/messages/api/messages';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
import useAuthStore from '@/features/auth/store/authStore';

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
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingSentAtRef = useRef<number>(0);
  const selectedChatIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [selectedChatId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (response: SendMessageResponse, variables: { chatId: string; content: string }) => {
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

    if (!selectedChatId || !currentUserId) {
      return;
    }

    if (nextContent.trim().length === 0) {
      return;
    }

    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    const debounceMs = 400;
    const throttleMs = 1500;
    const chatIdAtSchedule = selectedChatId;
    typingTimeoutRef.current = window.setTimeout(() => {
      if (selectedChatIdRef.current !== chatIdAtSchedule) {
        return;
      }

      const now = Date.now();
      if (now - lastTypingSentAtRef.current < throttleMs) {
        return;
      }

      lastTypingSentAtRef.current = now;
      void sendTypingSignal({ chatId: chatIdAtSchedule, isTyping: true });
    }, debounceMs);

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
