import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ChatPage } from './ChatPage';

const navigateMock = vi.fn();
const clearAuthMock = vi.fn();

type AuthState = {
  user: { id: string; displayName: string } | null;
  clearAuth: () => void;
};

let authState: AuthState = {
  user: { id: 'u-1', displayName: 'Mica' },
  clearAuth: clearAuthMock
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('@/features/auth/store/authStore', () => ({
  default: (selector: (state: AuthState) => unknown) => selector(authState)
}));

vi.mock('@/components/layout/ChatLayout', () => ({
  ChatLayout: ({ sidebar, main, secondary }: { sidebar: ReactNode; main: ReactNode; secondary?: ReactNode }) => (
    <div data-testid="chat-layout">
      <div data-testid="sidebar-slot">{sidebar}</div>
      <div data-testid="main-slot">{main}</div>
      <div data-testid="secondary-slot">{secondary}</div>
    </div>
  )
}));

vi.mock('@/features/chats/containers/ChatListContainer', () => ({
  ChatListContainer: () => <div>ChatListContainer</div>
}));

vi.mock('@/features/chats/containers/ChatThreadContainer', () => ({
  ChatThreadContainer: () => <div>ChatThreadContainer</div>
}));

vi.mock('@/features/messages/containers/MessageListContainer', () => ({
  MessageListContainer: ({ currentUserId }: { currentUserId?: string }) => (
    <div>MessageListContainer:{currentUserId ?? 'none'}</div>
  )
}));

vi.mock('@/features/messages/containers/MessageComposerContainer', () => ({
  MessageComposerContainer: () => <div>MessageComposerContainer</div>
}));

vi.mock('@/features/chats/containers/NotificationTrayContainer', () => ({
  NotificationTrayContainer: () => <div>NotificationTrayContainer</div>
}));

vi.mock('@/features/chats/containers/NotificationSettingsContainer', () => ({
  NotificationSettingsContainer: () => <div>NotificationSettingsContainer</div>
}));

vi.mock('@/features/messages/components/TypingIndicator', () => ({
  TypingIndicator: ({ isVisible }: { isVisible: boolean }) => <div>TypingIndicator:{String(isVisible)}</div>
}));

vi.mock('@/features/chat/realtime/useChatRealtime', () => ({
  useChatRealtime: () => undefined
}));

describe('ChatPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    clearAuthMock.mockReset();
    authState = {
      user: { id: 'u-1', displayName: 'Mica' },
      clearAuth: clearAuthMock
    };
  });

  it('assembles chat layout with wired container composition', () => {
    render(<ChatPage />);

    expect(screen.getByTestId('chat-layout')).toBeInTheDocument();
    expect(screen.getByText('ChatListContainer')).toBeInTheDocument();
    expect(screen.getByText('ChatThreadContainer')).toBeInTheDocument();
    expect(screen.getByText('MessageListContainer:u-1')).toBeInTheDocument();
    expect(screen.getByText('MessageComposerContainer')).toBeInTheDocument();
    expect(screen.queryByText('NotificationSettingsContainer')).not.toBeInTheDocument();
    expect(screen.getByText('NotificationTrayContainer')).toBeInTheDocument();
  });

  it('passes fallback user id when auth user is missing', () => {
    authState.user = null;

    render(<ChatPage />);

    expect(screen.getByText('MessageListContainer:none')).toBeInTheDocument();
  });
});
