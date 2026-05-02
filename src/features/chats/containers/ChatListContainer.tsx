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
import useAuthStore from '@/features/auth/store/authStore';

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
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [createChatError, setCreateChatError] = useState<string | null>(null);
  const newChatTriggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const setSelectedChatId = useChatUIStore((state) => state.setSelectedChatId);
  const typingByChatId = useChatUIStore((state) => state.typingByChatId);
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const usersQuery = useUsers();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<ChatsResponse>({
    queryKey: ['chats'],
    queryFn: () => getChats({})
  });

  const createChatMutation = useMutation({
    mutationFn: (userId: string) => {
      const latestCurrentUserId = useAuthStore.getState().user?.id ?? null;

      if (userId === latestCurrentUserId) {
        setCreateChatError('No podés crear un chat con vos mismo.');
        return Promise.reject(new Error('self-chat-blocked'));
      }

      return createChat(userId);
    },
    onSuccess: (createdChat: { id?: string }) => {
      if (createdChat.id) {
        setSelectedChatId(createdChat.id);
      }
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
      setPendingUserId(null);
      setIsCreatingChat(false);
    },
    onError: () => {
      setCreateChatError('No pudimos crear el chat. Probá de nuevo.');
      setPendingUserId(null);
    }
  });

  const chats = toChatListItems(data, typingByChatId);
  const users = usersQuery.data?.items ?? [];
  const eligibleUsers = users.filter((user) => user.id !== currentUserId);

  const handleUserSelection = (userId: string) => {
    if (userId === currentUserId) {
      setCreateChatError('No podés crear un chat con vos mismo.');
      return;
    }

    setCreateChatError(null);
    setPendingUserId(userId);
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
        {usersQuery.isError ? (
          <div className="space-y-2">
            <p className="text-xs text-danger" role="alert">
              No pudimos cargar usuarios
            </p>
            {typeof usersQuery.refetch === 'function' ? (
              <button
                type="button"
                className="rounded-[--radius-sm] border border-border px-2 py-1 text-xs text-text hover:bg-surface-2"
                onClick={() => {
                  void usersQuery.refetch();
                }}
              >
                Reintentar usuarios
              </button>
            ) : null}
          </div>
        ) : null}
        {createChatError ? (
          <p className="text-xs text-danger" role="alert">
            {createChatError}
          </p>
        ) : null}
        {!usersQuery.isLoading && !usersQuery.isError && eligibleUsers.length === 0 ? (
          <p className="text-xs text-muted" role="status">
            No hay usuarios disponibles para crear un chat.
          </p>
        ) : null}
        {!usersQuery.isLoading && !usersQuery.isError && eligibleUsers.length > 0 ? (
          <ul className="space-y-1" role="list">
            {eligibleUsers.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className="w-full rounded-[--radius-sm] px-2 py-1 text-left text-sm text-text hover:bg-surface-2"
                  onClick={() => handleUserSelection(user.id)}
                  disabled={createChatMutation.isPending && pendingUserId === user.id}
                >
                  {createChatMutation.isPending && pendingUserId === user.id ? 'Creando chat…' : user.displayName}
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
