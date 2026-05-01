import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatRealtime } from './useChatRealtime';

const connectMock = vi.fn();
const disconnectMock = vi.fn();
const joinChatMock = vi.fn();
const leaveChatMock = vi.fn();
const subscribeMock = vi.fn();

let selectedChatId: string | null = null;
let setSocketStatusRef: ((status: 'disconnected' | 'connecting' | 'connected' | 'error') => void) | null = null;

vi.mock('@/features/chat/realtime/socketGateway', () => ({
  useSocketGateway: () => ({
    connect: connectMock,
    disconnect: disconnectMock,
    joinChat: joinChatMock,
    leaveChat: leaveChatMock,
    subscribe: subscribeMock
  })
}));

vi.mock('@/features/chat/store/chatUIStore', () => ({
  useChatUIStore: (selector: (state: {
    selectedChatId: string | null;
    setSocketStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
    clearChatTyping: (chatId: string) => void;
  }) => unknown) =>
    selector({
      selectedChatId,
      setSocketStatus: (status) => {
        if (setSocketStatusRef) {
          setSocketStatusRef(status);
        }
      },
      clearChatTyping: () => undefined
    })
}));

function Probe() {
  useChatRealtime();
  return null;
}

describe('useChatRealtime', () => {
  beforeEach(() => {
    selectedChatId = null;
    connectMock.mockReset();
    disconnectMock.mockReset();
    joinChatMock.mockReset();
    leaveChatMock.mockReset();
    subscribeMock.mockReset();
    setSocketStatusRef = vi.fn();
  });

  it('connects on mount and disconnects on unmount', () => {
    const { unmount } = render(<Probe />);

    expect(connectMock).toHaveBeenCalledTimes(1);

    unmount();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('joins and leaves chat room as selection changes', () => {
    const { rerender } = render(<Probe />);

    selectedChatId = 'chat-1';
    rerender(<Probe />);
    expect(joinChatMock).toHaveBeenCalledWith('chat-1');

    selectedChatId = 'chat-2';
    rerender(<Probe />);
    expect(leaveChatMock).toHaveBeenCalledWith('chat-1');
    expect(joinChatMock).toHaveBeenCalledWith('chat-2');
  });
});
