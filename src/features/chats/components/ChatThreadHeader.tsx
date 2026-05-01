import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

type ChatThreadHeaderProps = {
  title: string;
  subtitle?: string;
  status?: string;
  actions?: ReactNode;
};

export function ChatThreadHeader({ title, subtitle, status, actions }: ChatThreadHeaderProps) {
  return (
    <header className="border-border border-b bg-panel px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-1 items-start gap-2">
          <Avatar name={title} />
          <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-text">{title}</h2>
          {subtitle ? <p className="mt-1 truncate text-xs text-muted">{subtitle}</p> : null}
          {status ? (
            <Badge aria-label="Estado de presencia" variant="ghost" className="mt-1">
              {status}
            </Badge>
          ) : null}
          </div>
        </div>
        {actions ? <div data-testid="chat-thread-header-actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export type { ChatThreadHeaderProps };
