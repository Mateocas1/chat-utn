import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const toastVariants = cva('rounded-[--radius-sm] border px-3 py-2', {
  variants: {
    variant: {
      default: 'border-[--color-border] bg-[--color-surface] text-[--color-text]',
      accent: 'border-[--color-accent] bg-[--color-accent] text-[--color-accent-ink]',
      danger: 'border-[--color-danger] bg-[--color-danger] text-[--color-bg]',
      ghost: 'border-transparent bg-[--color-surface-2] text-[--color-muted]'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

type ToastProps = VariantProps<typeof toastVariants> & {
  title: string;
  description?: ReactNode;
};

export function Toast({ title, description, variant = 'default' }: ToastProps) {
  const isDanger = variant === 'danger';

  return (
    <article
      role={isDanger ? 'alert' : 'status'}
      aria-live={isDanger ? 'assertive' : 'polite'}
      data-variant={variant}
      className={toastVariants({ variant })}
    >
      <p className="text-xs font-medium">{title}</p>
      {description ? <p className="mt-1 text-xs opacity-90">{description}</p> : null}
    </article>
  );
}
