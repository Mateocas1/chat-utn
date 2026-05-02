import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatList, type ChatListItemData } from '@/features/chats/components/ChatList';
import { createChat, getChats } from '@/features/chats/api/chats';
import type { ChatPreviewResponseItem, ChatsResponse } from '@/features/chats/api/chats';
import { Dialog } from '@/components/ui/Dialog';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
import { useUsers } from '@/features/users/hooks/useUsers';
import { ChatListEmpty } from '@/features/chats/components/ChatListEmpty';
import { ChatListError } from '@/features/chats/components/ChatListError';
import { ChatListSkeleton } from '@/features/chats/components/ChatListSkeleton';

const formatMetadata = (updatedAt?: string): string | undefined => {
  if (!updatedAt) {
    return undefined;
  }

  return new Date(updatedAt).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });
};

const toChatListItems = (
  items: ChatPreviewResponseItem[] | undefined,
  typingByChatId: Record<string, Record<string, string>>
): ChatListItemData[] => {
  if (!items) {
    return [];
  }

  return items.map((chat) => ({
    id: chat.id,
    title: chat.title ?? 'Chat sin título',
    preview: chat.lastMessage?.content ?? 'Sin mensajes aún',
    unreadCount: chat.unreadCount ?? 0,
    metadata: formatMetadata(chat.updatedAt),
    isTyping: Boolean(typingByChatId[chat.id] && Object.keys(typingByChatId[chat.id]).length > 0)
  }));
};

export function ChatListContainer() {
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const newChatTriggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const setSelectedChatId = useChatUIStore((state) => state.setSelectedChatId);
  const typingByChatId = useChatUIStore((state) => state.typingByChatId);
  const usersQuery = useUsers();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<ChatsResponse>({
    queryKey: ['chats'],
    queryFn: () => getChats({})
  });

  const createChatMutation = useMutation({
    mutationFn: (userId: string) => createChat(userId),
    onSuccess: (createdChat: { id?: string }) => {
      if (createdChat.id) {
        setSelectedChatId(createdChat.id);
      }
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
      setIsCreatingChat(false);
    }
  });

  const chats = toChatListItems(data, typingByChatId);
  const users = usersQuery.data?.items ?? [];

  const handleUserSelection = (userId: string) => {
    createChatMutation.mutate(userId);
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden border-border bg-panel md:border-r">
      <header className="flex items-center justify-between border-border border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-text">Mis Chats</h2>
        <button
          type="button"
          className="rounded-[--radius-sm] border border-border px-2 py-1 text-xs text-text hover:bg-surface-2"
          onClick={() => setIsCreatingChat((current) => !current)}
          ref={newChatTriggerRef}
        >
          Nuevo chat
        </button>
      </header>

      <Dialog
        open={isCreatingChat}
        onOpenChange={setIsCreatingChat}
        title="Crear nuevo chat"
        triggerRef={newChatTriggerRef}
      >
        {usersQuery.isLoading ? <p className="text-xs text-muted">Cargando usuarios…</p> : null}
        {usersQuery.isError ? <p className="text-xs text-danger">No pudimos cargar usuarios</p> : null}
        {!usersQuery.isLoading && !usersQuery.isError ? (
          <ul className="space-y-1" role="list">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className="w-full rounded-[--radius-sm] px-2 py-1 text-left text-sm text-text hover:bg-surface-2"
                  onClick={() => handleUserSelection(user.id)}
                  disabled={createChatMutation.isPending}
                >
                  {user.displayName}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Dialog>

      {isLoading ? <ChatListSkeleton /> : null}
      {isError ? <ChatListError onRetry={refetch} /> : null}
      {!isLoading && !isError && chats.length === 0 ? <ChatListEmpty /> : null}
      {!isLoading && !isError && chats.length > 0 ? (
        <ChatList chats={chats} selectedChatId={selectedChatId} onSelectChat={setSelectedChatId} />
      ) : null}
    </section>
  );
}
