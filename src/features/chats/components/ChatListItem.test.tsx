import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatListItem, type ChatListItemData } from './ChatListItem';

const item: ChatListItemData = {
  id: 'chat-1',
  title: 'Arquitectura Frontend',
  preview: 'Definimos el contrato del socket y cierro PR',
  unreadCount: 3,
  metadata: '11:42',
};

describe('ChatListItem', () => {
  it('renders title, preview and metadata', () => {
    render(
      <ChatListItem
        item={item}
        selected={false}
        onClick={() => {}}
      />,
    );

    expect(screen.getByText('Arquitectura Frontend')).toBeInTheDocument();
    expect(screen.getByText('Definimos el contrato del socket y cierro PR')).toBeInTheDocument();
    expect(screen.getByText('11:42')).toBeInTheDocument();
  });

  it('shows unread indicator when unreadCount is greater than zero', () => {
    render(
      <ChatListItem
        item={item}
        selected={false}
        onClick={() => {}}
      />,
    );

    expect(screen.getByLabelText('Mensajes no leidos')).toHaveTextContent('3');
  });

  it('does not show unread indicator when unreadCount is zero', () => {
    render(
      <ChatListItem
        item={{ ...item, unreadCount: 0 }}
        selected={false}
        onClick={() => {}}
      />,
    );

    expect(screen.queryByLabelText('Mensajes no leidos')).toBeNull();
  });

  it('applies selected state styling when selected', () => {
    render(
      <ChatListItem
        item={item}
        selected
        onClick={() => {}}
      />,
    );

    const button = screen.getByRole('button', { name: /Arquitectura Frontend/ });
    expect(button).toHaveAttribute('data-selected', 'true');
    expect(button.className).toContain('bg-surface-2');
    expect(button.className).toContain('border-l-2');
  });

  it('calls onClick with chat id', () => {
    const onClick = vi.fn();
    render(
      <ChatListItem
        item={item}
        selected={false}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Arquitectura Frontend/ }));
    expect(onClick).toHaveBeenCalledWith('chat-1');
  });

  it('uses reduced-motion-safe typing indicator animation class', () => {
    render(
      <ChatListItem
        item={{ ...item, isTyping: true }}
        selected={false}
        onClick={() => {}}
      />,
    );

    const typingDot = screen.getByLabelText('chat typing');
    expect(typingDot.className).toContain('motion-reduce:animate-none');
  });
});
