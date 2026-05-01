import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatList, type ChatListItemData } from './ChatList';

const chats: ChatListItemData[] = [
  {
    id: 'chat-1',
    title: 'Infra',
    preview: 'Quedo en verde el pipeline',
    unreadCount: 0,
    metadata: 'Ayer',
  },
  {
    id: 'chat-2',
    title: 'Producto',
    preview: 'Necesitamos validar copy final',
    unreadCount: 2,
    metadata: '09:12',
  },
];

describe('ChatList', () => {
  it('renders list of chat previews', () => {
    render(
      <ChatList
        chats={chats}
        selectedChatId={null}
        onSelectChat={() => {}}
      />,
    );

    expect(screen.getByText('Infra')).toBeInTheDocument();
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Quedo en verde el pipeline')).toBeInTheDocument();
    expect(screen.getByText('Necesitamos validar copy final')).toBeInTheDocument();
  });

  it('marks selected item by selectedChatId', () => {
    render(
      <ChatList
        chats={chats}
        selectedChatId="chat-2"
        onSelectChat={() => {}}
      />,
    );

    const selectedItem = screen.getByRole('button', { name: /Producto/ });
    const unselectedItem = screen.getByRole('button', { name: /Infra/ });

    expect(selectedItem).toHaveAttribute('data-selected', 'true');
    expect(unselectedItem).toHaveAttribute('data-selected', 'false');
  });

  it('calls onSelectChat when item is clicked', () => {
    const onSelectChat = vi.fn();

    render(
      <ChatList
        chats={chats}
        selectedChatId={null}
        onSelectChat={onSelectChat}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Producto/ }));
    expect(onSelectChat).toHaveBeenCalledWith('chat-2');
  });

  it('renders empty state when list is empty', () => {
    render(
      <ChatList
        chats={[]}
        selectedChatId={null}
        onSelectChat={() => {}}
      />,
    );

    expect(screen.getByText('No hay chats disponibles')).toBeInTheDocument();
  });

  it('implements roving tabindex and arrow/home/end navigation', () => {
    render(<ChatList chats={chats} selectedChatId="chat-1" onSelectChat={() => {}} />);

    const infra = screen.getByRole('button', { name: /Infra/ });
    const producto = screen.getByRole('button', { name: /Producto/ });

    expect(infra).toHaveAttribute('tabindex', '0');
    expect(producto).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(infra, { key: 'ArrowDown' });
    expect(producto).toHaveFocus();
    expect(producto).toHaveAttribute('tabindex', '0');
    expect(infra).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(producto, { key: 'ArrowDown' });
    expect(infra).toHaveFocus();

    fireEvent.keyDown(infra, { key: 'End' });
    expect(producto).toHaveFocus();

    fireEvent.keyDown(producto, { key: 'Home' });
    expect(infra).toHaveFocus();
  });

  it('activates focused chat with Enter', () => {
    const onSelectChat = vi.fn();
    render(<ChatList chats={chats} selectedChatId="chat-1" onSelectChat={onSelectChat} />);

    const infra = screen.getByRole('button', { name: /Infra/ });
    fireEvent.keyDown(infra, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('button', { name: /Producto/ }), { key: 'Enter' });

    expect(onSelectChat).toHaveBeenCalledWith('chat-2');
  });
});
