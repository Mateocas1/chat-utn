import type { ReactNode } from 'react';

type AppShellProps = {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function AppShell({ header, sidebar, footer, children }: AppShellProps) {
  return (
    <div>
      {header ? <header>{header}</header> : null}
      {sidebar ? <aside>{sidebar}</aside> : null}
      <main>{children}</main>
      {footer ? <footer>{footer}</footer> : null}
    </div>
  );
}
