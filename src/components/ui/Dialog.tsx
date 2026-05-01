import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const panelVariants = cva('w-full max-w-md rounded-[--radius-md] border bg-[--color-surface] p-4 text-[--color-text]', {
  variants: {
    variant: {
      default: 'border-[--color-border]',
      accent: 'border-[--color-accent]',
      danger: 'border-[--color-danger]',
      ghost: 'border-transparent bg-[--color-surface-2]'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

type DialogProps = VariantProps<typeof panelVariants> & {
  open: boolean;
  title: string;
  children: ReactNode;
  onOpenChange: (nextOpen: boolean) => void;
};

export function Dialog({ open, title, children, onOpenChange, variant = 'default' }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={panelVariants({ variant })}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onOpenChange(false);
          }
        }}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
