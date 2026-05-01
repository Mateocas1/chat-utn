import { useEffect, useRef } from 'react';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
import { useSocketGateway } from './socketGateway';

export const useChatRealtime = () => {
  const gateway = useSocketGateway();
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const clearChatTyping = useChatUIStore((state) => state.clearChatTyping);
  const previousChatRef = useRef<string | null>(null);

  useEffect(() => {
    gateway.connect();
    return () => {
      if (previousChatRef.current) {
        gateway.leaveChat(previousChatRef.current);
      }
      gateway.disconnect();
    };
  }, [gateway]);

  useEffect(() => {
    const previousChatId = previousChatRef.current;

    if (previousChatId && previousChatId !== selectedChatId) {
      gateway.leaveChat(previousChatId);
      clearChatTyping(previousChatId);
    }

    if (selectedChatId && selectedChatId !== previousChatId) {
      gateway.joinChat(selectedChatId);
    }

    previousChatRef.current = selectedChatId;
  }, [clearChatTyping, gateway, selectedChatId]);
};
