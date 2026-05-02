import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatListSkeleton } from './ChatListSkeleton';

describe('ChatListSkeleton', () => {
  it('renders a busy list with accessible label', () => {
    render(<ChatListSkeleton />);

    const list = screen.getByRole('list', { name: 'Loading chats' });
    expect(list).toHaveAttribute('aria-busy', 'true');
  });

  it('renders three placeholder items', () => {
    render(<ChatListSkeleton />);

    const list = screen.getByRole('list', { name: 'Loading chats' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });
});
