import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationSettingsContainer } from './NotificationSettingsContainer';

const enablePushNotificationsMock = vi.fn();

vi.mock('@/features/notifications/push/pushNotifications', () => ({
  enablePushNotifications: (...args: unknown[]) => enablePushNotificationsMock(...args)
}));

type ChatUIState = {
  selectedChatId: string | null;
  pushPermission: 'default' | 'granted' | 'denied' | 'unsupported';
  pushOptInDialogOpen: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
  threadPushEnabled: Record<string, boolean>;
  setPushOptInDialogOpen: (isOpen: boolean) => void;
  setPushPermission: (permission: 'default' | 'granted' | 'denied' | 'unsupported') => void;
  setQuietHours: (quietHours: { enabled: boolean; start: string; end: string }) => void;
  setThreadPushEnabled: (chatId: string, enabled: boolean) => void;
};

let chatUIState: ChatUIState = {
  selectedChatId: 'chat-1',
  pushPermission: 'default',
  pushOptInDialogOpen: false,
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  threadPushEnabled: {},
  setPushOptInDialogOpen: vi.fn(),
  setPushPermission: vi.fn(),
  setQuietHours: vi.fn(),
  setThreadPushEnabled: vi.fn()
};

vi.mock('@/features/chat/store/chatUIStore', () => ({
  useChatUIStore: (selector: (state: ChatUIState) => unknown) => selector(chatUIState)
}));

describe('NotificationSettingsContainer', () => {
  beforeEach(() => {
    enablePushNotificationsMock.mockReset();
    chatUIState = {
      selectedChatId: 'chat-1',
      pushPermission: 'default',
      pushOptInDialogOpen: false,
      quietHours: { enabled: false, start: '22:00', end: '07:00' },
      threadPushEnabled: {},
      setPushOptInDialogOpen: vi.fn(),
      setPushPermission: vi.fn(),
      setQuietHours: vi.fn(),
      setThreadPushEnabled: vi.fn()
    };
  });

  it('opens rationale dialog only on explicit opt-in click', () => {
    render(<NotificationSettingsContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Enable notifications' }));

    expect(chatUIState.setPushOptInDialogOpen).toHaveBeenCalledWith(true);
  });

  it('requests permission and registration after confirm action', async () => {
    chatUIState.pushOptInDialogOpen = true;
    enablePushNotificationsMock.mockResolvedValue({ permission: 'granted' });

    render(<NotificationSettingsContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Allow notifications' }));

    await waitFor(() => {
      expect(enablePushNotificationsMock).toHaveBeenCalledTimes(1);
    });

    expect(chatUIState.setPushPermission).toHaveBeenCalledWith('granted');
    expect(chatUIState.setPushOptInDialogOpen).toHaveBeenCalledWith(false);
  });

  it('updates per-thread toggle and quiet-hours controls', () => {
    render(<NotificationSettingsContainer />);

    fireEvent.click(screen.getByLabelText('Thread notifications'));
    expect(chatUIState.setThreadPushEnabled).toHaveBeenCalledWith('chat-1', false);

    fireEvent.click(screen.getByLabelText('Quiet hours'));
    expect(chatUIState.setQuietHours).toHaveBeenCalledWith({ enabled: true, start: '22:00', end: '07:00' });

    fireEvent.change(screen.getByLabelText('Quiet hours start'), { target: { value: '21:30' } });
    expect(chatUIState.setQuietHours).toHaveBeenLastCalledWith({ enabled: false, start: '21:30', end: '07:00' });

    fireEvent.change(screen.getByLabelText('Quiet hours end'), { target: { value: '06:30' } });
    expect(chatUIState.setQuietHours).toHaveBeenLastCalledWith({ enabled: false, start: '22:00', end: '06:30' });
  });
});
