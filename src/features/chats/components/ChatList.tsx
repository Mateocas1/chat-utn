import { useInfiniteQuery } from '@tanstack/react-query';
import { getChats } from '../api/chats';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

export const ChatList = ({ onSelectChat, selectedChatId }: ChatListProps) => {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor || undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === 'pending') return <div className="p-4 text-center text-gray-500">Cargando chats...</div>;
  if (status === 'error') return <div className="p-4 text-center text-red-500">Error al cargar chats</div>;

  const chats = data.pages.flatMap((page) => page.data || []);

  return (
    <div className="flex flex-col h-full overflow-y-auto border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
        Mis Chats
      </div>
      {chats.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No tienes chats aún</div>
      ) : (
        chats.map((chat: any) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedChatId === chat.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
            }`}
          >
            <div className="font-medium text-gray-900 truncate">
              {chat.participants.join(', ')}
            </div>
            <div className="text-sm text-gray-500 truncate mt-1">
              {chat.latestMessagePreview || 'Sin mensajes'}
            </div>
          </div>
        ))
      )}
      <div ref={ref} className="p-4 text-center text-sm text-gray-400">
        {isFetchingNextPage ? 'Cargando más...' : hasNextPage ? 'Cargar más' : 'No hay más chats'}
      </div>
    </div>
  );
};
