import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { getNotifications, markNotificationRead, type NotificationItem } from '../api/notifications';
import { useMarkNotificationRead, useNotifications } from './useNotifications';

vi.mock('../api/notifications', () => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn()
}));

const TestNotifications = () => {
  const query = useNotifications();
  const mutation = useMarkNotificationRead();

  if (query.isPending) {
    return <span data-testid="state">loading</span>;
  }

  return (
    <div>
      <span data-testid="state">ready</span>
      <span data-testid="count">{query.data.items.length}</span>
      <button onClick={() => mutation.mutate('n-1')} type="button">
        mark
      </button>
    </div>
  );
};

describe('useNotifications hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads notifications from query api', async () => {
    const notifications: NotificationItem[] = [
      {
        id: 'n-1',
        title: 'Hello',
        message: 'World',
        read: false,
        createdAt: '2026-05-01T00:00:00.000Z'
      }
    ];
    vi.mocked(getNotifications).mockResolvedValue({ items: notifications });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TestNotifications />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('state')).toHaveTextContent('loading');

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(getNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls markNotificationRead mutation with selected id', async () => {
    vi.mocked(getNotifications).mockResolvedValue({ items: [] });
    vi.mocked(markNotificationRead).mockResolvedValue({
      id: 'n-1',
      title: 'A',
      message: 'B',
      read: true,
      createdAt: '2026-05-01T00:00:00.000Z'
    });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TestNotifications />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('ready');
    });

    screen.getByRole('button', { name: 'mark' }).click();

    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith('n-1', expect.anything());
    });
  });

  it('optimistically marks notification as read in cache before server response', async () => {
    vi.mocked(getNotifications).mockResolvedValue({
      items: [
        {
          id: 'n-1',
          title: 'Hello',
          message: 'World',
          read: false,
          createdAt: '2026-05-01T00:00:00.000Z'
        }
      ]
    });

    let resolveMutation: ((value: NotificationItem) => void) | null = null;
    vi.mocked(markNotificationRead).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMutation = resolve;
        })
    );

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <TestNotifications />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('ready');
    });

    screen.getByRole('button', { name: 'mark' }).click();

    await waitFor(() => {
      const optimistic = queryClient.getQueryData<{ items: NotificationItem[] }>(['notifications']);
      expect(optimistic).toEqual({
        items: [
          {
            id: 'n-1',
            title: 'Hello',
            message: 'World',
            read: true,
            createdAt: '2026-05-01T00:00:00.000Z'
          }
        ]
      });
    });

    resolveMutation?.({
      id: 'n-1',
      title: 'Hello',
      message: 'World',
      read: true,
      createdAt: '2026-05-01T00:00:00.000Z'
    });

    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith('n-1', expect.anything());
    });
  });
});
