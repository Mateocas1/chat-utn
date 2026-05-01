import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationTrayContainer } from './NotificationTrayContainer';

const removeToastMock = vi.fn();

type ChatToast = {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
};

type ChatUIState = {
  toastQueue: ChatToast[];
  removeToast: (toastId: string) => void;
};

let chatUIState: ChatUIState = {
  toastQueue: [],
  removeToast: removeToastMock
};

vi.mock('@/features/chat/store/chatUIStore', () => ({
  useChatUIStore: (selector: (state: ChatUIState) => unknown) => selector(chatUIState)
}));

describe('NotificationTrayContainer', () => {
  beforeEach(() => {
    removeToastMock.mockReset();
    chatUIState = {
      toastQueue: [],
      removeToast: removeToastMock
    };
  });

  it('does not render when queue is empty', () => {
    const { container } = render(<NotificationTrayContainer />);
    expect(container).toBeEmptyDOMElement();
  });

  it('maps toast queue to tray items and variants', () => {
    chatUIState.toastQueue = [
      {
        id: 'n-1',
        message: 'Socket conectado',
        variant: 'info'
      },
      {
        id: 'n-2',
        message: 'Mensaje enviado',
        variant: 'success'
      }
    ];

    render(<NotificationTrayContainer />);

    expect(screen.getByText('Socket conectado')).toBeInTheDocument();
    expect(screen.getByText('Mensaje enviado')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('dismisses toast through store action', () => {
    chatUIState.toastQueue = [
      {
        id: 'n-1',
        message: 'Socket conectado',
        variant: 'info'
      }
    ];

    render(<NotificationTrayContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss Socket conectado' }));
    expect(removeToastMock).toHaveBeenCalledWith('n-1');
  });
});
