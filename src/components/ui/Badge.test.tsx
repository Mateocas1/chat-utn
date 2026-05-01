import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders content and variant attribute', () => {
    render(<Badge variant="accent">Nuevo</Badge>);

    const badge = screen.getByText('Nuevo');
    expect(badge).toHaveAttribute('data-variant', 'accent');
  });
});
