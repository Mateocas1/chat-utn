import { useId, useRef, type ReactNode, type RefObject } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
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
  description?: string;
  children: ReactNode;
  onOpenChange: (nextOpen: boolean) => void;
  triggerRef?: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

export function Dialog({
  open,
  title,
  description,
  children,
  onOpenChange,
  variant = 'default',
  triggerRef,
  initialFocusRef,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(dialogRef, { active: open, initialFocusRef, triggerRef });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={panelVariants({ variant })}
        ref={dialogRef}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onOpenChange(false);
          }
        }}
      >
        <h3 id={titleId} className="text-sm font-semibold">
          {title}
        </h3>
        {description ? (
          <p id={descriptionId} className="mt-1 text-xs text-muted">
            {description}
          </p>
        ) : null}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
