import { ChatLayout } from '@/components/layout/ChatLayout';
import { ChatListContainer } from '@/features/chats/containers/ChatListContainer';
import { ChatThreadContainer } from '@/features/chats/containers/ChatThreadContainer';
import { NotificationTrayContainer } from '@/features/chats/containers/NotificationTrayContainer';
import { NotificationSettingsContainer } from '@/features/chats/containers/NotificationSettingsContainer';
import { MessageListContainer } from '@/features/messages/containers/MessageListContainer';
import { MessageComposerContainer } from '@/features/messages/containers/MessageComposerContainer';
import { TypingIndicator } from '@/features/messages/components/TypingIndicator';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
import useAuthStore from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useChatRealtime } from '@/features/chat/realtime/useChatRealtime';
import { useMemo } from 'react';

export const ChatPage = () => {
  useChatRealtime();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const typingByChatId = useChatUIStore((state) => state.typingByChatId);
  const typists = useMemo(() => {
    if (!selectedChatId) {
      return [];
    }

    const users = typingByChatId[selectedChatId] ?? {};
    return Object.entries(users).map(([id, name]) => ({ id, name }));
  }, [selectedChatId, typingByChatId]);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const sidebar = (
    <section className="flex h-full min-h-0 flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <h1 className="truncate text-sm font-semibold text-text">{user?.displayName ?? 'Chat App'}</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-[--radius-sm] border border-border bg-surface px-3 py-1 text-xs text-text transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          Salir
        </button>
      </header>
      <div className="min-h-0 flex-1">
        <ChatListContainer />
      </div>
    </section>
  );

  const main = (
    <section className="flex h-full min-h-0 flex-col">
      <ChatThreadContainer />
      <NotificationSettingsContainer />
      <NotificationTrayContainer />
      <MessageListContainer currentUserId={user?.id} />
      <TypingIndicator isVisible={typists.length > 0} typists={typists} />
      <MessageComposerContainer />
    </section>
  );

  return (
    <ChatLayout sidebar={sidebar} main={main} />
  );
};
