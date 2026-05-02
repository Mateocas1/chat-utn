import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatListContainer } from './ChatListContainer';

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const useQueryClientMock = vi.fn();
const getChatsMock = vi.fn();
const createChatMock = vi.fn();
const useUsersMock = vi.fn();
const useAuthStoreMock = vi.fn();
const authStoreGetStateMock = vi.fn();
const setSelectedChatIdMock = vi.fn();
const invalidateQueriesMock = vi.fn();

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
  useQuery: (options: unknown) => useQueryMock(options),
  useMutation: (options: unknown) => useMutationMock(options),
  useQueryClient: () => useQueryClientMock()
}));

vi.mock('@/features/chats/api/chats', () => ({
  getChats: (args: unknown) => getChatsMock(args),
  createChat: (userId: string) => createChatMock(userId)
}));

vi.mock('@/features/users/hooks/useUsers', () => ({
  useUsers: () => useUsersMock()
}));

vi.mock('@/features/auth/store/authStore', () => ({
  default: Object.assign(
    (selector: (state: { user: { id: string } | null }) => unknown) => useAuthStoreMock(selector),
    { getState: () => authStoreGetStateMock() }
  )
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
    createChatMock.mockReset();
    useUsersMock.mockReset();
    useAuthStoreMock.mockReset();
    authStoreGetStateMock.mockReset();
    useQueryMock.mockReset();
    useMutationMock.mockReset();

    useAuthStoreMock.mockImplementation((selector: (state: { user: { id: string } | null }) => unknown) =>
      selector({ user: { id: 'u-auth' } })
    );
    authStoreGetStateMock.mockReturnValue({ user: { id: 'u-auth' } });

    useUsersMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false
    });

    useMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });

    invalidateQueriesMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock
    });
  });

  it('adapts envelope query data into ChatList item props', () => {
    useQueryMock.mockReturnValue({
      data: [
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
    });

    render(<ChatListContainer />);

    expect(screen.getByText('Infra Squad')).toBeInTheDocument();
    expect(screen.getByText('Pipeline está en verde')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('uses selected chat id from ui store', () => {
    chatUIState.selectedChatId = 'chat-2';
    useQueryMock.mockReturnValue({
      data: [
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
    });

    render(<ChatListContainer />);

    expect(screen.getByRole('button', { name: /Producto/ })).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('button', { name: /Infra/ })).toHaveAttribute('data-selected', 'false');
  });

  it('connects chat selection callback to ui store', () => {
    useQueryMock.mockReturnValue({
      data: [
        {
          id: 'chat-1',
          title: 'Infra',
          unreadCount: 0,
          updatedAt: '2026-04-30T12:00:00.000Z',
          lastMessage: { content: 'A' }
        }
      ]
    });

    render(<ChatListContainer />);
    fireEvent.click(screen.getByRole('button', { name: /Infra/ }));

    expect(setSelectedChatIdMock).toHaveBeenCalledWith('chat-1');
  });

  it('queries chats list with deterministic key and queryFn', () => {
    useQueryMock.mockReturnValue({ data: [] });

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
      data: [
        {
          id: 'chat-1',
          title: 'Infra',
          unreadCount: 0,
          updatedAt: '2026-04-30T12:00:00.000Z',
          lastMessage: { content: 'A' }
        }
      ]
    });

    render(<ChatListContainer />);

    expect(screen.getByLabelText('typing indicator')).toBeInTheDocument();
  });

  it('renders loading state while chats query is fetching', () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    render(<ChatListContainer />);

    expect(screen.getByLabelText('Loading chats')).toBeInTheDocument();
  });

  it('renders error state when chats query fails', () => {
    const refetchMock = vi.fn();
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: refetchMock });

    render(<ChatListContainer />);

    expect(screen.getByText('No pudimos cargar los chats')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when there are no chats', () => {
    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(<ChatListContainer />);

    expect(screen.getByText('No chats yet')).toBeInTheDocument();
    expect(screen.getByText('Start a new conversation to see it here.')).toBeInTheDocument();
  });

  it('renders new chat button', () => {
    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(<ChatListContainer />);

    expect(screen.getByRole('button', { name: 'Nuevo chat' })).toBeInTheDocument();
  });

  it('renders a single Mis Chats heading without duplicated structural header', () => {
    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(<ChatListContainer />);

    expect(screen.getAllByRole('heading', { name: 'Mis Chats' })).toHaveLength(1);
  });

  it('renders users list from useUsers hook using displayName', () => {
    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: {
        items: [
          { id: 'u-1', displayName: 'Mica' },
          { id: 'u-2', displayName: 'Lauti' }
        ]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));

    expect(screen.getByRole('button', { name: 'Mica' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lauti' })).toBeInTheDocument();
  });

  it('excludes authenticated user from Nuevo chat list', () => {
    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: {
        items: [
          { id: 'u-auth', displayName: 'Yo' },
          { id: 'u-2', displayName: 'Lauti' }
        ]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));

    expect(screen.queryByRole('button', { name: 'Yo' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lauti' })).toBeInTheDocument();
  });

  it('blocks self-selection in handler, shows accessible error, and does not call createChat mutation', () => {
    useAuthStoreMock.mockImplementation((selector: (state: { user: { id: string } | null }) => unknown) =>
      selector({ user: null })
    );
    authStoreGetStateMock.mockReturnValue({ user: { id: 'u-auth' } });

    const mutateCreateChatMock = vi.fn((userId: string) => {
      if (mutationOptions?.mutationFn) {
        void mutationOptions.mutationFn(userId).catch(() => undefined);
      }
    });
    let mutationOptions: {
      mutationFn?: (userId: string) => Promise<unknown>;
    } | null = null;

    useMutationMock.mockImplementation((options: { mutationFn?: (userId: string) => Promise<unknown> }) => {
      mutationOptions = options;
      return {
        mutate: mutateCreateChatMock,
        isPending: false
      };
    });

    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: {
        items: [{ id: 'u-auth', displayName: 'Yo' }]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yo' }));

    expect(mutateCreateChatMock).toHaveBeenCalledWith('u-auth');
    expect(createChatMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('No podés crear un chat con vos mismo.');
  });

  it('disables only the selected user while create chat is pending', () => {
    let mutationOptions: {
      mutationFn?: (userId: string) => Promise<unknown>;
    } | null = null;

    const mutateCreateChatMock = vi.fn((userId: string) => {
      const mutationResult = mutationOptions?.mutationFn?.(userId);
      if (mutationResult instanceof Promise) {
        void mutationResult.catch(() => undefined);
      }
    });

    useMutationMock.mockImplementation((options: { mutationFn?: (userId: string) => Promise<unknown> }) => {
      mutationOptions = options;
      return {
        mutate: mutateCreateChatMock,
        isPending: true
      };
    });

    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: {
        items: [
          { id: 'u-1', displayName: 'Mica' },
          { id: 'u-2', displayName: 'Lauti' }
        ]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));

    const micaButton = screen.getByRole('button', { name: 'Mica' });
    const lautiButton = screen.getByRole('button', { name: 'Lauti' });

    expect(micaButton).not.toBeDisabled();
    expect(lautiButton).not.toBeDisabled();

    fireEvent.click(micaButton);

    expect(micaButton).toBeDisabled();
    expect(micaButton).toHaveTextContent('Creando chat…');
    expect(lautiButton).not.toBeDisabled();
  });

  it('shows mutation failure error and restores user interactivity', async () => {
    let mutationOptions: {
      onError?: () => void;
      mutationFn?: (userId: string) => Promise<unknown>;
    } | null = null;

    const mutateCreateChatMock = vi.fn((userId: string) => {
      const mutationResult = mutationOptions?.mutationFn?.(userId);
      if (mutationResult instanceof Promise) {
        void mutationResult.catch(() => undefined);
      }
      mutationOptions?.onError?.();
    });

    useMutationMock.mockImplementation((options: {
      onError?: () => void;
      mutationFn?: (userId: string) => Promise<unknown>;
    }) => {
      mutationOptions = options;
      return {
        mutate: mutateCreateChatMock,
        isPending: false
      };
    });

    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: {
        items: [{ id: 'u-1', displayName: 'Mica' }]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));
    const micaButton = screen.getByRole('button', { name: 'Mica' });

    fireEvent.click(micaButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No pudimos crear el chat. Probá de nuevo.');
    });
    expect(micaButton).not.toBeDisabled();
    expect(micaButton).toHaveTextContent('Mica');
  });

  it('renders eligible users empty state when only authenticated user exists', () => {
    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: {
        items: [{ id: 'u-auth', displayName: 'Yo' }]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));

    expect(screen.getByRole('status')).toHaveTextContent('No hay usuarios disponibles para crear un chat.');
    expect(screen.queryByRole('button', { name: 'Yo' })).not.toBeInTheDocument();
  });

  it('retries users fetch from dialog error state', () => {
    const usersRefetchMock = vi.fn();

    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: usersRefetchMock
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar usuarios' }));

    expect(usersRefetchMock).toHaveBeenCalledTimes(1);
  });

  it('creates chat on user selection and selects created chat', () => {
    const mutateCreateChatMock = vi.fn((userId: string) => {
      mutationOptions?.onSuccess?.({ id: 'chat-created-1' });
      createChatMock(userId);
    });
    let mutationOptions: {
      onSuccess?: (data: { id: string }) => void;
      mutationFn?: (userId: string) => Promise<unknown>;
    } | null = null;

    useMutationMock.mockImplementation((options: {
      onSuccess?: (data: { id: string }) => void;
      mutationFn?: (userId: string) => Promise<unknown>;
    }) => {
      mutationOptions = options;
      return {
        mutate: mutateCreateChatMock,
        isPending: false
      };
    });

    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: {
        items: [{ id: 'u-1', displayName: 'Mica' }]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mica' }));

    expect(createChatMock).toHaveBeenCalledWith('u-1');
    expect(setSelectedChatIdMock).toHaveBeenCalledWith('chat-created-1');
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['chats'] });
  });

  it('restores focus to Nuevo chat button after closing the dialog', async () => {
    useQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });
    useUsersMock.mockReturnValue({
      data: {
        items: [{ id: 'u-1', displayName: 'Mica' }]
      },
      isLoading: false,
      isError: false
    });

    render(<ChatListContainer />);

    const newChatButton = screen.getByRole('button', { name: 'Nuevo chat' });
    newChatButton.focus();
    fireEvent.click(newChatButton);

    const dialog = screen.getByRole('dialog', { name: 'Crear nuevo chat' });
    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => {
      expect(newChatButton).toHaveFocus();
    });
  });
});
