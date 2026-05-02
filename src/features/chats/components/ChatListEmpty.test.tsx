import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatListEmpty } from './ChatListEmpty';

describe('ChatListEmpty', () => {
  it('renders empty state copy', () => {
    render(<ChatListEmpty />);

    expect(screen.getByText('No chats yet')).toBeInTheDocument();
    expect(screen.getByText('Start a new conversation to see it here.')).toBeInTheDocument();
  });

  it('does not render interactive elements', () => {
    render(<ChatListEmpty />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
