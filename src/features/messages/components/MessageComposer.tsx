import type { KeyboardEvent } from 'react';

interface MessageComposerProps {
  value: string;
  onChange: (nextValue: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  placeholder?: string;
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  isSubmitting = false,
  placeholder = 'Write a message…',
}: MessageComposerProps) {
  const isDisabled = disabled || isSubmitting;
  const canSend = value.trim().length > 0 && !isDisabled;

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    onSend();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleSend();
  };

  return (
    <section className="border-t border-border bg-panel px-4 py-3">
      <label htmlFor="message-composer" className="sr-only">
        Message
      </label>

      <div className="flex items-end gap-2">
        <textarea
          id="message-composer"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={placeholder}
          rows={1}
          className="min-h-10 max-h-40 flex-1 resize-y rounded-[--radius-sm] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />

        <button
          type="button"
          aria-label="Send message"
          onClick={handleSend}
          disabled={!canSend}
          className="inline-flex h-10 items-center justify-center rounded-[--radius-sm] border border-accent bg-accent px-4 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </div>
    </section>
  );
}
