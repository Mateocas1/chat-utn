import type { ReactNode } from 'react';

type AppShellProps = {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function AppShell({ header, sidebar, footer, children }: AppShellProps) {
  const handleSkipToMain = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById('main-content');
    if (main instanceof HTMLElement) {
      main.focus();
    }
  };

  return (
    <div>
      <a
        href="#main-content"
        onClick={handleSkipToMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:text-text focus:shadow-md"
      >
        Skip to main content
      </a>
      {header ? <header>{header}</header> : null}
      {sidebar ? <aside>{sidebar}</aside> : null}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      {footer ? <footer>{footer}</footer> : null}
    </div>
  );
}
