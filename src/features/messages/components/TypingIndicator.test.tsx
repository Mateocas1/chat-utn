import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TypingIndicator } from './TypingIndicator';

describe('TypingIndicator', () => {
  it('does not render when hidden', () => {
    const { container } = render(
      <TypingIndicator isVisible={false} typists={[{ id: 'u1', name: 'Mica' }]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when visible but empty typists', () => {
    const { container } = render(<TypingIndicator isVisible typists={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a single typist message', () => {
    render(<TypingIndicator isVisible typists={[{ id: 'u1', name: 'Mica' }]} />);

    expect(screen.getByLabelText('Typing indicator')).toHaveTextContent('Mica is typing…');
  });

  it('renders two typists message', () => {
    render(
      <TypingIndicator
        isVisible
        typists={[
          { id: 'u1', name: 'Mica' },
          { id: 'u2', name: 'Lauti' },
        ]}
      />, 
    );

    expect(screen.getByLabelText('Typing indicator')).toHaveTextContent('Mica and Lauti are typing…');
  });

  it('renders grouped message for three or more typists', () => {
    render(
      <TypingIndicator
        isVisible
        typists={[
          { id: 'u1', name: 'Mica' },
          { id: 'u2', name: 'Lauti' },
          { id: 'u3', name: 'Ari' },
        ]}
      />, 
    );

    expect(screen.getByLabelText('Typing indicator')).toHaveTextContent('Several people are typing…');
  });

  it('uses subtle industrial quiet visual treatment', () => {
    render(<TypingIndicator isVisible typists={[{ id: 'u1', name: 'Mica' }]} />);

    const indicator = screen.getByLabelText('Typing indicator');

    expect(indicator).toHaveClass('border-border');
    expect(indicator).toHaveClass('bg-surface');
    expect(indicator).toHaveClass('text-muted');
  });

  it('uses motion-reduce fallback for typing dot animation', () => {
    render(<TypingIndicator isVisible typists={[{ id: 'u1', name: 'Mica' }]} />);

    const dot = screen.getByLabelText('Typing indicator').querySelector('span[aria-hidden="true"]');
    expect(dot).not.toBeNull();
    expect(dot?.className).toContain('motion-reduce:animate-none');
  });
});
