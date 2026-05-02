import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatListError } from './ChatListError';

describe('ChatListError', () => {
  it('renders the error message', () => {
    render(<ChatListError onRetry={() => {}} />);

    expect(screen.getByText('No pudimos cargar los chats')).toBeInTheDocument();
  });

  it('renders a keyboard-reachable retry button', () => {
    render(<ChatListError onRetry={() => {}} />);

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ChatListError onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
