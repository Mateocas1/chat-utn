import { useMemo, useState, type KeyboardEvent } from 'react';
import { ChatListItem, type ChatListItemData } from './ChatListItem';

interface ChatListProps {
  chats?: ChatListItemData[];
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

export type { ChatListItemData } from './ChatListItem';

export const ChatList = ({ chats = [], onSelectChat, selectedChatId }: ChatListProps) => {
  const initialIndex = useMemo(() => {
    if (chats.length === 0) {
      return -1;
    }

    const selectedIndex = selectedChatId ? chats.findIndex((chat) => chat.id === selectedChatId) : -1;
    return selectedIndex >= 0 ? selectedIndex : 0;
  }, [chats, selectedChatId]);

  const [focusIndex, setFocusIndex] = useState(initialIndex);
  const resolvedFocusIndex = focusIndex >= 0 && focusIndex < chats.length ? focusIndex : initialIndex;

  const moveFocus = (nextIndex: number) => {
    if (chats.length === 0) {
      return;
    }

    const total = chats.length;
    const normalized = ((nextIndex % total) + total) % total;
    setFocusIndex(normalized);

    if (typeof document === 'undefined') {
      return;
    }

    const nextButton = document.getElementById(`chat-list-item-${chats[normalized].id}`);
    nextButton?.focus();
  };

  const handleItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(index + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(index - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      moveFocus(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      moveFocus(chats.length - 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      onSelectChat(chats[index].id);
    }
  };

  return (
    <>
      {chats.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted">No hay chats disponibles</div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {chats.map((chat, index) => (
            <ChatListItem
              key={chat.id}
              item={chat}
              selected={selectedChatId === chat.id}
              tabIndex={index === resolvedFocusIndex ? 0 : -1}
              onFocus={() => setFocusIndex(index)}
              onKeyDown={(event) => handleItemKeyDown(event, index)}
              onClick={onSelectChat}
            />
          ))}
        </ul>
      )}
    </>
  );
};
