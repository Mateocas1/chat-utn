import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders non-danger toasts as status with polite live region', () => {
    render(<Toast title="Mención" description="Te mencionaron" variant="accent" />);

    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('data-variant', 'accent');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Mención')).toBeInTheDocument();
  });

  it('renders danger toasts as alert with assertive live region', () => {
    render(<Toast title="Message failed" description="Try again" variant="danger" />);

    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('data-variant', 'danger');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('Message failed')).toBeInTheDocument();
  });
});
