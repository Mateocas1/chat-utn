import type { ImgHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const avatarVariants = cva('inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold', {
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

type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'children'> & VariantProps<typeof avatarVariants> & {
  name: string;
};

const initialsFromName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
};

export function Avatar({ name, src, alt, variant = 'default', className, ...props }: AvatarProps) {
  const accessibleLabel = `${name} avatar`;

  if (src) {
    return <img src={src} alt={alt ?? accessibleLabel} className={[avatarVariants({ variant }), className].filter(Boolean).join(' ')} {...props} />;
  }

  return (
    <span aria-label={accessibleLabel} data-variant={variant} className={[avatarVariants({ variant }), className].filter(Boolean).join(' ')}>
      {initialsFromName(name)}
    </span>
  );
}
