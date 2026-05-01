import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[--radius-sm] px-4 py-2 text-sm font-medium transition-colors ' +
    'bg-[--color-surface] text-[--color-text] border border-[--color-border] ' +
    'hover:bg-[--color-surface-2] disabled:opacity-50 disabled:pointer-events-none ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--color-accent] focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        default: '',
        accent: 'bg-[--color-accent] text-[--color-accent-ink] border-[--color-accent] hover:bg-[--color-accent-2]',
        danger: 'bg-[--color-danger] text-[--color-bg] border-[--color-danger] hover:opacity-90',
        ghost: 'bg-transparent border-transparent text-[--color-text] hover:bg-[--color-surface]'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
  children: ReactNode;
};

export function Button({
  variant = 'default',
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [buttonVariants({ variant }), className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} data-variant={variant} className={classes} {...props}>
      {children}
    </button>
  );
}
