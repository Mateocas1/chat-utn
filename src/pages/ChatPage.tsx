import { useState } from 'react';
import { ChatList } from '@/features/chats/components/ChatList';
import { MessageList } from '@/features/messages/components/MessageList';
import { MessageInput } from '@/features/messages/components/MessageInput';
import useAuthStore from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';

export const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 max-w-sm flex flex-col bg-white border-r border-gray-200">
        <div className="p-4 bg-primary-600 text-white flex justify-between items-center shadow-sm z-10">
          <div className="font-bold text-lg truncate">
            {user?.displayName || 'Chat App'}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded-md transition-colors"
          >
            Salir
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatList onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChatId ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-10 flex items-center">
              <div className="font-semibold text-gray-800">Chat Activo</div>
            </div>
            <MessageList chatId={selectedChatId} />
            <MessageInput chatId={selectedChatId} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg">Selecciona un chat para comenzar a enviar mensajes</p>
          </div>
        )}
      </div>
    </div>
  );
};
