import { useInfiniteQuery } from '@tanstack/react-query';
import { getMessages } from '../api/messages';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import useAuthStore from '@/features/auth/store/authStore';

interface MessageListProps {
  chatId: string;
}

export const MessageList = ({ chatId }: MessageListProps) => {
  const { ref, inView } = useInView();
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((state: any) => state.user);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['messages', chatId],
    queryFn: ({ pageParam }) => getMessages({ chatId, pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!chatId,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (data?.pages.length === 1) {
      bottomRef.current?.scrollIntoView();
    }
  }, [data]);

  if (status === 'pending') return <div className="flex-1 flex items-center justify-center text-gray-500">Cargando mensajes...</div>;
  if (status === 'error') return <div className="flex-1 flex items-center justify-center text-red-500">Error al cargar mensajes</div>;

  // Flatten and reverse to show newest at bottom
  const messages = data.pages.flatMap((page) => page.items).reverse();

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
      <div ref={ref} className="text-center py-2 text-sm text-gray-400">
        {isFetchingNextPage ? 'Cargando anteriores...' : hasNextPage ? 'Cargar anteriores' : 'Inicio de la conversación'}
      </div>
      
      <div className="flex-1 flex flex-col justify-end">
        {messages.map((msg: any) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div
              key={msg.id}
              className={`max-w-[70%] rounded-lg p-3 mb-2 ${
                isMe 
                  ? 'bg-primary-500 text-white self-end rounded-br-none' 
                  : 'bg-white text-gray-800 self-start rounded-bl-none shadow-sm border border-gray-100'
              }`}
            >
              <div className="break-words">{msg.content}</div>
              <div className={`text-xs mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
