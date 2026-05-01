import type { HTMLAttributes, ReactNode } from 'react';

type TypographyVariant = 'heading' | 'body' | 'muted';

type TypographyProps = HTMLAttributes<HTMLElement> & {
  variant?: TypographyVariant;
  children: ReactNode;
};

const variantClasses: Record<TypographyVariant, string> = {
  heading: 'text-2xl font-semibold tracking-tight text-[--color-text]',
  body: 'text-sm leading-6 text-[--color-text]',
  muted: 'text-sm leading-6 text-[--color-muted]',
};

export function Typography({
  variant = 'body',
  className,
  children,
  ...props
}: TypographyProps) {
  const classes = [variantClasses[variant], className].filter(Boolean).join(' ');

  if (variant === 'heading') {
    return (
      <h2 data-variant={variant} className={classes} {...props}>
        {children}
      </h2>
    );
  }

  return (
    <p data-variant={variant} className={classes} {...props}>
      {children}
    </p>
  );
}
