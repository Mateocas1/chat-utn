import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography', () => {
  it('renders heading variant as semantic heading', () => {
    render(<Typography variant="heading">Panel title</Typography>);

    const heading = screen.getByRole('heading', { name: 'Panel title', level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-variant', 'heading');
  });

  it('renders body variant as paragraph', () => {
    render(<Typography variant="body">Body copy</Typography>);

    const paragraph = screen.getByText('Body copy');
    expect(paragraph.tagName).toBe('P');
    expect(paragraph).toHaveAttribute('data-variant', 'body');
  });

  it('renders muted variant with muted style marker', () => {
    render(<Typography variant="muted">Muted copy</Typography>);

    const mutedText = screen.getByText('Muted copy');
    expect(mutedText.tagName).toBe('P');
    expect(mutedText).toHaveAttribute('data-variant', 'muted');
    expect(mutedText.className).toContain('text-[--color-muted]');
  });
});
