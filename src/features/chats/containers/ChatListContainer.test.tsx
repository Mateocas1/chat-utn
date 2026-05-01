import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatListContainer } from './ChatListContainer';

const useQueryMock = vi.fn();
const getChatsMock = vi.fn();
const setSelectedChatIdMock = vi.fn();

type ChatUIState = {
  selectedChatId: string | null;
  typingByChatId: Record<string, Record<string, string>>;
  setSelectedChatId: (chatId: string | null) => void;
};

let chatUIState: ChatUIState = {
  selectedChatId: null,
  typingByChatId: {},
  setSelectedChatId: setSelectedChatIdMock
};

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => useQueryMock(options)
}));

vi.mock('@/features/chats/api/chats', () => ({
  getChats: (args: unknown) => getChatsMock(args)
}));

vi.mock('@/features/chat/store/chatUIStore', () => ({
  useChatUIStore: (selector: (state: ChatUIState) => unknown) => selector(chatUIState)
}));

describe('ChatListContainer', () => {
  beforeEach(() => {
    chatUIState = {
      selectedChatId: null,
      typingByChatId: {},
      setSelectedChatId: setSelectedChatIdMock
    };

    setSelectedChatIdMock.mockReset();
    getChatsMock.mockReset();
    useQueryMock.mockReset();
  });

  it('adapts query data into ChatList item props', () => {
    useQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 'chat-1',
            title: 'Infra Squad',
            unreadCount: 3,
            updatedAt: '2026-04-30T12:10:00.000Z',
            lastMessage: {
              content: 'Pipeline está en verde'
            }
          }
        ]
      }
    });

    render(<ChatListContainer />);

    expect(screen.getByText('Infra Squad')).toBeInTheDocument();
    expect(screen.getByText('Pipeline está en verde')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('uses selected chat id from ui store', () => {
    chatUIState.selectedChatId = 'chat-2';
    useQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 'chat-1',
            title: 'Infra',
            unreadCount: 0,
            updatedAt: '2026-04-30T12:00:00.000Z',
            lastMessage: { content: 'A' }
          },
          {
            id: 'chat-2',
            title: 'Producto',
            unreadCount: 0,
            updatedAt: '2026-04-30T12:01:00.000Z',
            lastMessage: { content: 'B' }
          }
        ]
      }
    });

    render(<ChatListContainer />);

    expect(screen.getByRole('button', { name: /Producto/ })).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('button', { name: /Infra/ })).toHaveAttribute('data-selected', 'false');
  });

  it('connects chat selection callback to ui store', () => {
    useQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 'chat-1',
            title: 'Infra',
            unreadCount: 0,
            updatedAt: '2026-04-30T12:00:00.000Z',
            lastMessage: { content: 'A' }
          }
        ]
      }
    });

    render(<ChatListContainer />);
    fireEvent.click(screen.getByRole('button', { name: /Infra/ }));

    expect(setSelectedChatIdMock).toHaveBeenCalledWith('chat-1');
  });

  it('queries chats list with deterministic key and queryFn', () => {
    useQueryMock.mockReturnValue({ data: { items: [] } });

    render(<ChatListContainer />);

    expect(useQueryMock).toHaveBeenCalledTimes(1);
    const firstCall = useQueryMock.mock.calls[0][0] as {
      queryKey: readonly unknown[];
      queryFn: () => unknown;
    };

    expect(firstCall.queryKey).toEqual(['chats']);
    expect(typeof firstCall.queryFn).toBe('function');
  });

  it('renders typing dot when a chat has remote typists', () => {
    chatUIState.typingByChatId = {
      'chat-1': {
        'u-9': 'Lauti'
      }
    };

    useQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 'chat-1',
            title: 'Infra',
            unreadCount: 0,
            updatedAt: '2026-04-30T12:00:00.000Z',
            lastMessage: { content: 'A' }
          }
        ]
      }
    });

    render(<ChatListContainer />);

    expect(screen.getByLabelText('chat typing')).toBeInTheDocument();
  });

  it('renders loading state while chats query is fetching', () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    render(<ChatListContainer />);

    expect(screen.getByText('Cargando chats…')).toBeInTheDocument();
  });

  it('renders error state when chats query fails', () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    render(<ChatListContainer />);

    expect(screen.getByText('No pudimos cargar los chats')).toBeInTheDocument();
  });
});
