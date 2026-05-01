import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MessageList, type MessageListItemData } from './MessageList';

const messages: MessageListItemData[] = [
  {
    id: 'msg-1',
    content: 'Buenísimo, cierro la API de notificaciones.',
    senderId: 'user-1',
    senderName: 'Mica',
    createdAt: '2026-04-30T11:30:00.000Z',
    direction: 'inbound',
    status: 'delivered',
  },
  {
    id: 'msg-2',
    content: 'Dale, yo conecto el socket event router.',
    senderId: 'user-2',
    createdAt: '2026-04-30T11:31:00.000Z',
    direction: 'outbound',
    status: 'pending',
  },
];

describe('MessageList', () => {
  it('renders sequence of messages', () => {
    render(<MessageList messages={messages} />);

    expect(screen.getByText('Buenísimo, cierro la API de notificaciones.')).toBeInTheDocument();
    expect(screen.getByText('Dale, yo conecto el socket event router.')).toBeInTheDocument();
  });

  it('renders bubbles with inbound and outbound variants', () => {
    render(<MessageList messages={messages} />);

    expect(screen.getByTestId('message-bubble-msg-1')).toHaveAttribute('data-direction', 'inbound');
    expect(screen.getByTestId('message-bubble-msg-2')).toHaveAttribute('data-direction', 'outbound');
    expect(screen.getByTestId('message-bubble-msg-1')).toHaveAttribute('role', 'article');
  });

  it('applies log semantics for screen readers', () => {
    render(<MessageList messages={messages} />);

    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders empty state when there are no messages', () => {
    render(<MessageList messages={[]} emptyStateLabel="No hay mensajes todavía" />);

    expect(screen.getByText('No hay mensajes todavía')).toBeInTheDocument();
  });

  it('wires retry callback for failed retryable messages', () => {
    const onRetry = vi.fn();
    render(
      <MessageList
        messages={[
          {
            id: 'msg-failed',
            content: 'fallo',
            senderId: 'u-2',
            createdAt: '2026-04-30T11:32:00.000Z',
            direction: 'outbound',
            status: 'failed',
            retryable: true
          }
        ]}
        onRetry={onRetry}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry send' }));
    expect(onRetry).toHaveBeenCalledWith('msg-failed');
  });
});
