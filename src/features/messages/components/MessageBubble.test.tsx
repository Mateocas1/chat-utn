import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MessageBubble, type MessageBubbleData } from './MessageBubble';

const baseMessage: MessageBubbleData = {
  id: 'msg-1',
  content: 'Definimos el contrato del evento message.',
  senderId: 'user-1',
  senderName: 'Arquitecta',
  createdAt: '2026-04-30T13:45:00.000Z',
  direction: 'inbound',
  status: 'delivered',
};

describe('MessageBubble', () => {
  it('renders sender, content and timestamp for inbound message', () => {
    render(<MessageBubble message={baseMessage} />);

    expect(screen.getByText('Arquitecta')).toBeInTheDocument();
    expect(screen.getByText('Definimos el contrato del evento message.')).toBeInTheDocument();
    expect(screen.getByText('13:45')).toBeInTheDocument();
  });

  it('applies outbound visual variant and hides sender name', () => {
    render(
      <MessageBubble
        message={{
          ...baseMessage,
          direction: 'outbound',
          senderName: 'Yo',
        }}
      />,
    );

    const bubble = screen.getByTestId('message-bubble-msg-1');
    expect(bubble).toHaveAttribute('data-direction', 'outbound');
    expect(bubble.className).toContain('self-end');
    expect(screen.queryByText('Yo')).toBeNull();
  });

  it('renders minimal status label when provided', () => {
    render(
      <MessageBubble
        message={{
          ...baseMessage,
          status: 'failed',
        }}
      />,
    );

    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders retry affordance for failed outbound messages', () => {
    const onRetry = vi.fn();

    render(
      <MessageBubble
        message={{
          ...baseMessage,
          direction: 'outbound',
          status: 'failed',
          retryable: true
        }}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry send' }));
    expect(onRetry).toHaveBeenCalledWith('msg-1');
  });
});
