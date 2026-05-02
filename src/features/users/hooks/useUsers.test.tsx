import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { getUsers, type UserItem } from '../api/users';
import { useUsers } from './useUsers';

vi.mock('../api/users', () => ({
  getUsers: vi.fn()
}));

const TestUsers = () => {
  const query = useUsers();

  if (query.isPending) {
    return <span data-testid="state">loading</span>;
  }

  return (
    <div>
      <span data-testid="state">ready</span>
      <span data-testid="count">{query.data.items.length}</span>
    </div>
  );
};

describe('useUsers hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads users from query api', async () => {
    const users: UserItem[] = [
      { id: 'u-1', name: 'Mica' },
      { id: 'u-2', name: 'Lauti' }
    ];
    vi.mocked(getUsers).mockResolvedValue({ items: users });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TestUsers />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('state')).toHaveTextContent('loading');

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(getUsers).toHaveBeenCalledTimes(1);
  });

  it('returns empty users list when backend has no users', async () => {
    vi.mocked(getUsers).mockResolvedValue({ items: [] });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TestUsers />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
