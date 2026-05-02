import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationTrayContainer } from './NotificationTrayContainer';

const mutateMarkReadMock = vi.fn();

type NotificationsHookState = {
  data?: {
    items: Array<{
      id: string;
      title: string;
      message: string;
      read: boolean;
      createdAt: string;
      metadata?: Record<string, unknown>;
    }>;
  };
  isLoading?: boolean;
  isError?: boolean;
};

let notificationsHookState: NotificationsHookState = {
  data: { items: [] },
  isLoading: false,
  isError: false
};

vi.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => notificationsHookState,
  useMarkNotificationRead: () => ({
    mutate: mutateMarkReadMock
  })
}));

describe('NotificationTrayContainer', () => {
  beforeEach(() => {
    mutateMarkReadMock.mockReset();
    notificationsHookState = {
      data: { items: [] },
      isLoading: false,
      isError: false
    };
  });

  it('does not render when notifications are empty', () => {
    const { container } = render(<NotificationTrayContainer />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders notifications from useNotifications hook', () => {
    notificationsHookState.data = {
      items: [
      {
        id: 'n-1',
        title: 'Socket conectado',
        message: 'Se reconectó la sesión',
        read: false,
        createdAt: '2026-05-01T12:00:00.000Z'
      },
      {
        id: 'n-2',
        title: 'Mensaje enviado',
        message: 'Tu mensaje llegó al servidor',
        read: false,
        createdAt: '2026-05-01T12:01:00.000Z'
      }
      ]
    };

    render(<NotificationTrayContainer />);

    expect(screen.getByText('Socket conectado')).toBeInTheDocument();
    expect(screen.getByText('Mensaje enviado')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('dismisses notification through mark-as-read mutation', () => {
    notificationsHookState.data = {
      items: [
      {
        id: 'n-1',
        title: 'Socket conectado',
        message: 'Se reconectó la sesión',
        read: false,
        createdAt: '2026-05-01T12:00:00.000Z'
      }
      ]
    };

    render(<NotificationTrayContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss Socket conectado' }));
    expect(mutateMarkReadMock).toHaveBeenCalledWith('n-1');
  });
});
