import type { ReactNode } from 'react';
import { Typography } from '@/components/ui/Typography';

type AuthLayoutProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[--color-bg] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] px-6 py-6 shadow-[--shadow-quiet]">
          <Typography variant="heading" className="text-center">
            {title}
          </Typography>
          <p className="mt-2 text-center text-sm text-[--color-muted]">
            Continuá con tu cuenta para acceder al chat premium.
          </p>
        </header>
        <section className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] px-6 py-6 shadow-[--shadow-quiet]">
          {children}
        </section>
        {footer ? (
          <footer className="text-center text-sm text-[--color-muted]">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}
