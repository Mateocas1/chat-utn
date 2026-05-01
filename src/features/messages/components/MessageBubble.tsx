export type MessageDirection = 'inbound' | 'outbound';
export type MessageDeliveryStatus = 'pending' | 'delivered' | 'failed';

export interface MessageBubbleData {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  createdAt: string;
  direction: MessageDirection;
  status?: MessageDeliveryStatus;
  retryable?: boolean;
}

interface MessageBubbleProps {
  message: MessageBubbleData;
  onRetry?: (messageId: string) => void;
}

const STATUS_LABELS: Record<MessageDeliveryStatus, string> = {
  pending: 'Pending',
  delivered: 'Delivered',
  failed: 'Failed',
};

const formatTime = (isoDate: string) => {
  return new Date(isoDate).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
};

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isInbound = message.direction === 'inbound';
  const statusLabel = message.status ? STATUS_LABELS[message.status] : null;

  return (
    <article
      role="article"
      data-testid={`message-bubble-${message.id}`}
      data-direction={message.direction}
      className={[
        'flex max-w-[80%] flex-col rounded-2xl px-3 py-2 text-sm',
        isInbound
          ? 'self-start rounded-bl-md bg-panel text-text ring-1 ring-border'
          : 'self-end rounded-br-md bg-accent text-accent-ink',
      ].join(' ')}
    >
      {isInbound && message.senderName ? (
        <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{message.senderName}</span>
      ) : null}

      <p className="whitespace-pre-wrap break-words">{message.content}</p>

      <footer className="mt-1 flex items-center justify-end gap-2 text-[11px]">
        {statusLabel ? (
          <span className={isInbound ? 'text-muted' : 'text-accent-ink/80'}>{statusLabel}</span>
        ) : null}
        {message.status === 'failed' && message.retryable && onRetry ? (
          <button
            type="button"
            onClick={() => onRetry(message.id)}
            className="rounded border border-border px-1 py-0.5 text-[10px] font-medium text-text hover:bg-surface"
          >
            Retry send
          </button>
        ) : null}
        <time dateTime={message.createdAt} className={isInbound ? 'text-muted' : 'text-accent-ink/80'}>
          {formatTime(message.createdAt)}
        </time>
      </footer>
    </article>
  );
}
