import { useQuery } from '@tanstack/react-query';
import { ChatList, type ChatListItemData } from '@/features/chats/components/ChatList';
import { getChats } from '@/features/chats/api/chats';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';

type ChatPreviewResponseItem = {
  id: string;
  title?: string;
  unreadCount?: number;
  updatedAt?: string;
  lastMessage?: {
    content?: string;
  } | null;
};

type ChatsResponse = {
  items?: ChatPreviewResponseItem[];
};

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
  const selectedChatId = useChatUIStore((state) => state.selectedChatId);
  const setSelectedChatId = useChatUIStore((state) => state.setSelectedChatId);
  const typingByChatId = useChatUIStore((state) => state.typingByChatId);

  const { data, isLoading, isError } = useQuery<ChatsResponse>({
    queryKey: ['chats'],
    queryFn: () => getChats({})
  });

  if (isLoading) {
    return <section className="px-4 py-6 text-sm text-muted">Cargando chats…</section>;
  }

  if (isError) {
    return <section className="px-4 py-6 text-sm text-danger">No pudimos cargar los chats</section>;
  }

  const chats = toChatListItems(data?.items, typingByChatId);

  return <ChatList chats={chats} selectedChatId={selectedChatId} onSelectChat={setSelectedChatId} />;
}
