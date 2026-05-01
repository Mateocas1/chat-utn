import type { ReactNode } from 'react';

type ChatLayoutProps = {
  sidebar: ReactNode;
  main: ReactNode;
  secondary?: ReactNode;
};

export function ChatLayout({ sidebar, main, secondary }: ChatLayoutProps) {
  return (
    <div
      data-testid="chat-layout"
      className="grid h-dvh w-full grid-cols-1 overflow-hidden bg-surface md:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_22rem]"
    >
      <aside className="min-h-0 border-border bg-panel md:border-r">{sidebar}</aside>
      <main className="min-h-0 min-w-0 bg-surface">{main}</main>
      {secondary ? (
        <section
          data-testid="chat-layout-secondary"
          className="hidden min-h-0 border-border bg-panel xl:block xl:border-l"
        >
          {secondary}
        </section>
      ) : null}
    </div>
  );
}
