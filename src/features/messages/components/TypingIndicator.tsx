export type Typist = {
  id: string;
  name: string;
};

export type TypingIndicatorProps = {
  isVisible: boolean;
  typists: Typist[];
};

function getTypingMessage(typists: Typist[]): string {
  if (typists.length === 1) {
    return `${typists[0].name} is typing…`;
  }

  if (typists.length === 2) {
    return `${typists[0].name} and ${typists[1].name} are typing…`;
  }

  return 'Several people are typing…';
}

export function TypingIndicator({ isVisible, typists }: TypingIndicatorProps) {
  if (!isVisible || typists.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Typing indicator"
      aria-live="polite"
      className="border-border bg-surface text-muted flex items-center gap-2 border-t px-4 py-2 text-xs"
      role="status"
    >
      <span className="bg-muted/55 inline-block size-1.5 animate-pulse motion-reduce:animate-none rounded-full" aria-hidden="true" />
      <span>{getTypingMessage(typists)}</span>
    </div>
  );
}
