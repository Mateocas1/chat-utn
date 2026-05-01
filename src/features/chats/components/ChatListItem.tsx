import type { KeyboardEventHandler } from 'react';

export type ChatListItemData = {
  id: string;
  title: string;
  preview: string;
  unreadCount?: number;
  metadata?: string;
  isTyping?: boolean;
};

type ChatListItemProps = {
  item: ChatListItemData;
  selected: boolean;
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  onFocus?: () => void;
  onClick: (chatId: string) => void;
};

export function ChatListItem({ item, selected, tabIndex = -1, onKeyDown, onFocus, onClick }: ChatListItemProps) {
  const unreadCount = item.unreadCount ?? 0;

  return (
    <li>
      <button
        type="button"
        id={`chat-list-item-${item.id}`}
        data-selected={selected}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onClick={() => onClick(item.id)}
        className={[
          'w-full border-l-2 border-transparent px-4 py-3 text-left transition-colors',
          'hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
          selected ? 'border-l-accent bg-surface-2' : 'bg-panel',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="truncate text-sm font-semibold text-text">{item.title}</span>
          {item.metadata ? (
            <span className="shrink-0 text-xs text-muted">{item.metadata}</span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="truncate text-sm text-muted">{item.preview}</span>
          {item.isTyping ? <span aria-label="chat typing" className="bg-accent inline-block size-2 animate-pulse motion-reduce:animate-none rounded-full" /> : null}
          {unreadCount > 0 ? (
            <span
              aria-label="Mensajes no leidos"
              className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-ink"
            >
              {unreadCount}
            </span>
          ) : null}
        </div>
      </button>
    </li>
  );
}
