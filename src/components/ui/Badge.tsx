import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', {
  variants: {
    variant: {
      default: 'border-[--color-border] bg-[--color-surface] text-[--color-text]',
      accent: 'border-[--color-accent] bg-[--color-accent] text-[--color-accent-ink]',
      danger: 'border-[--color-danger] bg-[--color-danger] text-[--color-bg]',
      ghost: 'border-transparent bg-transparent text-[--color-muted]'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const classes = [badgeVariants({ variant }), className].filter(Boolean).join(' ');
  return (
    <span data-variant={variant} className={classes} {...props}>
      {children}
    </span>
  );
}
