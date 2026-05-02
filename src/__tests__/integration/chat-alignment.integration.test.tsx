import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageComposerContainer } from '@/features/messages/containers/MessageComposerContainer';
import { NotificationTrayContainer } from '@/features/chats/containers/NotificationTrayContainer';
import { ChatListContainer } from '@/features/chats/containers/ChatListContainer';
import { createSocketEventRouter } from '@/features/chat/realtime/socketEventRouter';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';

const { sendTypingSignalMock } = vi.hoisted(() => ({
  sendTypingSignalMock: vi.fn()
}));

const setQueryDataMock = vi.fn();
const useMutationMock = vi.fn();
const useQueryMock = vi.fn();
const markNotificationReadMutationMock = vi.fn();
const useNotificationsMock = vi.fn();
const useUsersMock = vi.fn();
const createChatMock = vi.fn();
const getChatsMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      setQueryData: setQueryDataMock,
      invalidateQueries: invalidateQueriesMock
    }),
    useMutation: (options: unknown) => useMutationMock(options),
    useQuery: (options: unknown) => useQueryMock(options)
  };
});

vi.mock('@/features/messages/api/messages', async () => {
  const actual = await vi.importActual<typeof import('@/features/messages/api/messages')>('@/features/messages/api/messages');
  return {
    ...actual,
    sendTypingSignal: sendTypingSignalMock
  };
});

vi.mock('@/features/chats/api/chats', () => ({
  getChats: (args: unknown) => getChatsMock(args),
  createChat: (userId: string) => createChatMock(userId)
}));

vi.mock('@/features/auth/store/authStore', () => ({
  default: (selector: (state: { user: { id: string; displayName: string } | null }) => unknown) =>
    selector({ user: { id: 'user-1', displayName: 'Mica' } })
}));

vi.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => useNotificationsMock(),
  useMarkNotificationRead: () => ({
    mutate: markNotificationReadMutationMock
  })
}));

vi.mock('@/features/users/hooks/useUsers', () => ({
  useUsers: () => useUsersMock()
}));

describe('chat frontend backend alignment integration', () => {
  beforeEach(() => {
    vi.useRealTimers();
    sendTypingSignalMock.mockReset();
    setQueryDataMock.mockReset();
    useMutationMock.mockReset();
    useQueryMock.mockReset();
    markNotificationReadMutationMock.mockReset();
    useNotificationsMock.mockReset();
    useUsersMock.mockReset();
    createChatMock.mockReset();
    getChatsMock.mockReset();
    invalidateQueriesMock.mockReset();

    useChatUIStore.setState({
      selectedChatId: null,
      socketStatus: 'disconnected',
      typingByChatId: {},
      toastQueue: []
    });

    useMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });

    useQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false
    });

    useNotificationsMock.mockReturnValue({
      data: {
        items: []
      },
      isLoading: false,
      isError: false
    });

    useUsersMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false
    });
  });

  it('routes typing from composer HTTP signal to store typing state through socket router', async () => {
    vi.useFakeTimers();
    useChatUIStore.setState({ selectedChatId: 'chat-typing-1' });
    sendTypingSignalMock.mockResolvedValue({ ok: true });

    render(<MessageComposerContainer />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'hola backend' } });
    await vi.advanceTimersByTimeAsync(400);

    expect(sendTypingSignalMock).toHaveBeenCalledWith({ chatId: 'chat-typing-1', isTyping: true });

    const queryClient = new QueryClient();
    const router = createSocketEventRouter({
      queryClient,
      getChatUIState: useChatUIStore.getState
    });

    router.handleEvent({
      type: 'typing',
      payload: {
        userId: 'u-remote-1',
        chatId: 'chat-typing-1'
      }
    });

    expect(useChatUIStore.getState().typingByChatId).toEqual({
      'chat-typing-1': {
        'u-remote-1': 'u-remote-1'
      }
    });
  });

  it('renders persisted notifications and calls read endpoint mutation on dismiss', () => {
    useNotificationsMock.mockReturnValue({
      data: {
        items: [
          {
            id: 'notif-1',
            title: 'Nuevo mensaje',
            message: 'Te escribieron en Infra Squad',
            read: false,
            createdAt: '2026-05-01T10:00:00.000Z'
          }
        ]
      },
      isLoading: false,
      isError: false
    });

    render(<NotificationTrayContainer />);

    expect(screen.getByText('Nuevo mensaje')).toBeInTheDocument();
    expect(screen.getByText('Te escribieron en Infra Squad')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss Nuevo mensaje' }));

    expect(markNotificationReadMutationMock).toHaveBeenCalledWith('notif-1');
  });

  it('creates chat from users list selection', () => {
    let mutationOptions: {
      onSuccess?: (data: { id?: string }) => void;
    } | null = null;

    useMutationMock.mockImplementation((options: { onSuccess?: (data: { id?: string }) => void }) => {
      mutationOptions = options;
      return {
        mutate: (userId: string) => {
          createChatMock(userId);
          mutationOptions?.onSuccess?.({ id: 'chat-created-42' });
        },
        isPending: false
      };
    });

    useUsersMock.mockReturnValue({
      data: {
        items: [
          {
            id: 'u-1',
            displayName: 'Mica'
          }
        ]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mica' }));

    expect(createChatMock).toHaveBeenCalledWith('u-1');
    expect(useChatUIStore.getState().selectedChatId).toBe('chat-created-42');
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['chats'] });
  });
});
