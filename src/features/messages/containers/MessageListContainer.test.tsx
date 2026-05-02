import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageListContainer } from './MessageListContainer';

const useQueryMock = vi.fn();
const mutateMock = vi.fn();
const useMutationMock = vi.fn();
const setQueryDataMock = vi.fn();

type ChatUIState = {
  selectedChatId: string | null;
};

let chatUIState: ChatUIState = {
  selectedChatId: null
};

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => useQueryMock(options),
  useMutation: (options: unknown) => useMutationMock(options),
  useQueryClient: () => ({
    setQueryData: setQueryDataMock
  })
}));

vi.mock('@/features/chat/store/chatUIStore', () => ({
  useChatUIStore: (selector: (state: ChatUIState) => unknown) => selector(chatUIState)
}));

describe('MessageListContainer', () => {
  beforeEach(() => {
    chatUIState = { selectedChatId: null };
    useQueryMock.mockReset();
    mutateMock.mockReset();
    useMutationMock.mockReset();
    setQueryDataMock.mockReset();

    useMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false
    });
  });

  it('does not fetch messages until a chat is selected', () => {
    useQueryMock.mockReturnValue({ data: { data: [] } });

    render(<MessageListContainer />);

    const firstCall = useQueryMock.mock.calls[0][0] as { enabled?: boolean };
    expect(firstCall.enabled).toBe(false);
    expect(screen.getByText('Seleccioná un chat para ver mensajes')).toBeInTheDocument();
  });

  it('requests selected chat messages and adapts query payload', () => {
    chatUIState.selectedChatId = 'chat-1';
    useQueryMock.mockReturnValue({
      data: {
        data: [
          {
            id: 'm-1',
            chatId: 'chat-1',
            content: 'Hola equipo',
            senderId: 'u-2',
            senderName: 'Mica',
            createdAt: '2026-04-30T12:00:00.000Z',
            status: 'delivered'
          }
        ]
      }
    });

    render(<MessageListContainer />);

    expect(screen.getByText('Hola equipo')).toBeInTheDocument();

    const firstCall = useQueryMock.mock.calls[0][0] as {
      queryKey: readonly unknown[];
      enabled?: boolean;
    };

    expect(firstCall.queryKey).toEqual(['messages', 'chat-1']);
    expect(firstCall.enabled).toBe(true);
  });

  it('marks outbound messages based on current user id', () => {
    chatUIState.selectedChatId = 'chat-1';
    useQueryMock.mockReturnValue({
      data: {
        data: [
          {
            id: 'm-1',
            chatId: 'chat-1',
            content: 'Mensaje propio',
            senderId: 'u-self',
            createdAt: '2026-04-30T12:00:00.000Z',
            status: 'pending'
          }
        ]
      }
    });

    render(<MessageListContainer currentUserId="u-self" />);

    expect(screen.getByTestId('message-bubble-m-1')).toHaveAttribute('data-direction', 'outbound');
  });

  it('renders loading state for selected chat while messages fetch', () => {
    chatUIState.selectedChatId = 'chat-1';
    useQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    render(<MessageListContainer />);

    expect(screen.getByText('Cargando mensajes…')).toBeInTheDocument();
  });

  it('renders error state for selected chat when query fails', () => {
    chatUIState.selectedChatId = 'chat-1';
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    render(<MessageListContainer />);

    expect(screen.getByText('No pudimos cargar los mensajes')).toBeInTheDocument();
  });

  it('renders empty state when selected chat has no messages', () => {
    chatUIState.selectedChatId = 'chat-1';
    useQueryMock.mockReturnValue({ data: { data: [] }, isLoading: false, isError: false });

    render(<MessageListContainer />);

    expect(screen.getByText('No hay mensajes todavía')).toBeInTheDocument();
  });

  it('retries a failed retryable message from UI callback', () => {
    chatUIState.selectedChatId = 'chat-1';
    useQueryMock.mockReturnValue({
      data: {
        data: [
          {
            id: 'm-failed',
            chatId: 'chat-1',
            content: 'Mensaje fallido',
            senderId: 'u-self',
            createdAt: '2026-04-30T12:00:00.000Z',
            status: 'failed',
            retryable: true
          }
        ]
      },
      isLoading: false,
      isError: false
    });

    render(<MessageListContainer currentUserId="u-self" />);

    fireEvent.click(screen.getByRole('button', { name: 'Retry send' }));

    expect(mutateMock).toHaveBeenCalledWith({
      chatId: 'chat-1',
      messageId: 'm-failed',
      content: 'Mensaje fallido'
    });
  });
});
