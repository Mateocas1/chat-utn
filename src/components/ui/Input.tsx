import type { InputHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'mt-1 block w-full rounded-[--radius-sm] border border-[--color-border] ' +
    'bg-[--color-surface] px-3 py-2 text-sm text-[--color-text] ' +
    'placeholder:text-[--color-muted] ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--color-accent] focus-visible:outline-offset-2 ' +
    'disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: '',
        accent: 'border-[--color-accent]',
        danger: 'border-[--color-danger] text-[--color-danger]',
        ghost: 'bg-transparent border-transparent'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

type InputProps = InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof inputVariants> & {
  label: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
};

export function Input({
  label,
  helperText,
  error,
  id,
  className,
  disabled,
  variant,
  ...props
}: InputProps) {
  const helpTextId = id ? `${id}-help` : undefined;
  const errorId = id ? `${id}-error` : undefined;
  const describedBy = [error ? errorId : null, helperText ? helpTextId : null]
    .filter(Boolean)
    .join(' ') || undefined;
  const classes = [inputVariants({ variant }), className].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-[--color-text]">
        <span className="font-medium">{label}</span>
      </label>
      <input
        id={id}
        className={classes}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {helperText ? (
        <span id={helpTextId} className="mt-1 block text-xs text-[--color-muted]">
          {helperText}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="mt-1 block text-xs text-[--color-danger]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
