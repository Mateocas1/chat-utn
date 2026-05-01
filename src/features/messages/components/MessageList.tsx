import { MessageBubble, type MessageBubbleData } from './MessageBubble';

export type MessageListItemData = MessageBubbleData;

interface MessageListProps {
  messages: MessageListItemData[];
  emptyStateLabel?: string;
  onRetry?: (messageId: string) => void;
}

export function MessageList({ messages, emptyStateLabel = 'No messages yet', onRetry }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-6 text-sm text-muted" aria-live="polite">
        {emptyStateLabel}
      </section>
    );
  }

  return (
    <section role="log" aria-live="polite" aria-relevant="additions text" className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface px-4 py-3">
      <ol className="flex flex-col gap-2" aria-label="Messages">
        {messages.map((message) => (
          <li key={message.id} className="flex">
            <MessageBubble message={message} onRetry={onRetry} />
          </li>
        ))}
      </ol>
    </section>
  );
}
