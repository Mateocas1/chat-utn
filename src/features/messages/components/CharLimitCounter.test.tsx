import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CharLimitCounter } from './CharLimitCounter';

describe('CharLimitCounter', () => {
  it('renders remaining character count', () => {
    render(<CharLimitCounter value="Hola" limit={20} />);

    expect(screen.getByText('16 characters remaining')).toBeInTheDocument();
  });

  it('announces when reaching 80% threshold', () => {
    render(<CharLimitCounter value="12345678" limit={10} />);

    expect(screen.getByRole('status')).toHaveTextContent('80% of character limit reached');
  });

  it('announces when reaching 100% threshold', () => {
    render(<CharLimitCounter value="1234567890" limit={10} />);

    expect(screen.getByRole('status')).toHaveTextContent('Character limit reached');
  });

  it('does not announce below 80% threshold', () => {
    render(<CharLimitCounter value="1234567" limit={10} />);

    expect(screen.queryByRole('status')).toBeNull();
  });
});
