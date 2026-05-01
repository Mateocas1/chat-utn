import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders accent mention toast', () => {
    render(<Toast title="Mención" description="Te mencionaron" variant="accent" />);

    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('data-variant', 'accent');
    expect(screen.getByText('Mención')).toBeInTheDocument();
  });
});
