import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageComposerContainer } from './MessageComposerContainer';

const { sendTypingSignalMock } = vi.hoisted(() => ({
  sendTypingSignalMock: vi.fn()
}));

const setQueryDataMock = vi.fn();
const mutateMock = vi.fn();
const useMutationMock = vi.fn();

type ChatUIState = {
  selectedChatId: string | null;
};

type AuthState = {
  user: { id: string; displayName: string } | null;
};

let chatUIState: ChatUIState = {
  selectedChatId: null
};

let authState: AuthState = {
  user: { id: 'user-1', displayName: 'Mica' }
};

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueryData: setQueryDataMock
  }),
  useMutation: (options: unknown) => useMutationMock(options)
}));

vi.mock('@/features/messages/api/messages', async () => {
  const actual = await vi.importActual<typeof import('@/features/messages/api/messages')>('@/features/messages/api/messages');
  return {
    ...actual,
    sendTypingSignal: sendTypingSignalMock
  };
});

vi.mock('@/features/chat/store/chatUIStore', () => ({
  useChatUIStore: (selector: (state: ChatUIState) => unknown) => selector(chatUIState)
}));

vi.mock('@/features/auth/store/authStore', () => ({
  default: (selector: (state: AuthState) => unknown) => selector(authState)
}));

describe('MessageComposerContainer', () => {
  beforeEach(() => {
    chatUIState = { selectedChatId: null };
    authState = { user: { id: 'user-1', displayName: 'Mica' } };
    setQueryDataMock.mockReset();
    mutateMock.mockReset();
    useMutationMock.mockReset();
    sendTypingSignalMock.mockReset();

    useMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false
    });
  });

  it('renders disabled composer when no chat is selected', () => {
    render(<MessageComposerContainer />);

    expect(screen.getByLabelText('Message')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('adds optimistic pending message and marks delivered on mutation success', async () => {
    chatUIState.selectedChatId = 'chat-9';
    useMutationMock.mockImplementation((options: {
      onSuccess?: (data: { id: string; createdAt: string }, vars: { chatId: string; content: string }) => void;
    }) => ({
      isPending: false,
      mutate: (payload: { chatId: string; content: string }) => {
        mutateMock(payload);
        options.onSuccess?.({ id: 'server-1', createdAt: '2026-05-01T00:00:00.000Z' }, payload);
      }
    }));

    render(<MessageComposerContainer />);

    const input = screen.getByLabelText('Message');
    fireEvent.change(input, { target: { value: 'Hola batch 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(mutateMock).toHaveBeenCalledWith({
      chatId: 'chat-9',
      content: 'Hola batch 2'
    });

    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    expect(setQueryDataMock).toHaveBeenCalledTimes(2);

    const firstCall = setQueryDataMock.mock.calls[0] as [readonly unknown[], (current: unknown) => unknown];
    expect(firstCall[0]).toEqual(['messages', 'chat-9']);

    const optimisticResult = firstCall[1]({ items: [] }) as {
      items: Array<{ content: string; status: string }>;
    };
    expect(optimisticResult.items[0]).toMatchObject({
      content: 'Hola batch 2',
      status: 'pending'
    });

    const secondCall = setQueryDataMock.mock.calls[1] as [readonly unknown[], (current: unknown) => unknown];
    const deliveredResult = secondCall[1](optimisticResult) as {
      items: Array<{ id: string; status: string }>;
    };

    expect(deliveredResult.items[0]).toMatchObject({ id: 'server-1', status: 'delivered' });
  });

  it('does not send blank message content', () => {
    chatUIState.selectedChatId = 'chat-1';

    render(<MessageComposerContainer />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('marks optimistic message as failed when mutation errors', () => {
    chatUIState.selectedChatId = 'chat-1';
    useMutationMock.mockImplementation((options: { onError?: (_error: Error, vars: { chatId: string; content: string }) => void }) => ({
      isPending: false,
      mutate: (vars: { chatId: string; content: string }) => {
        options.onError?.(new Error('network'), vars);
      }
    }));

    render(<MessageComposerContainer />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Mensaje fallido' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(setQueryDataMock).toHaveBeenCalledTimes(2);
    const firstCall = setQueryDataMock.mock.calls[0] as [readonly unknown[], (current: unknown) => unknown];
    const optimisticResult = firstCall[1]({ items: [] }) as {
      items: Array<{ id: string }>;
    };
    const optimisticId = optimisticResult.items[0].id;

    const secondCall = setQueryDataMock.mock.calls[1] as [readonly unknown[], (current: unknown) => unknown];
    const failedResult = secondCall[1](optimisticResult) as {
      items: Array<{ id: string; status: string; retryable: boolean }>;
    };

    expect(failedResult.items[0]).toMatchObject({
      id: optimisticId,
      status: 'failed',
      retryable: true
    });
  });

  it('sends typing signal over HTTP when user writes with selected chat', async () => {
    vi.useFakeTimers();
    chatUIState.selectedChatId = 'chat-typing';
    sendTypingSignalMock.mockResolvedValue({ ok: true });

    render(<MessageComposerContainer />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'h' } });
    await vi.runAllTimersAsync();

    expect(sendTypingSignalMock).toHaveBeenCalledWith({ chatId: 'chat-typing', isTyping: true });
    vi.useRealTimers();
  });

  it('does not send typing signal when content is blank', async () => {
    vi.useFakeTimers();
    chatUIState.selectedChatId = 'chat-typing';

    render(<MessageComposerContainer />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: '   ' } });
    await vi.runAllTimersAsync();

    expect(sendTypingSignalMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('debounces typing signal across fast consecutive changes', async () => {
    vi.useFakeTimers();
    chatUIState.selectedChatId = 'chat-typing';
    sendTypingSignalMock.mockResolvedValue({ ok: true });

    render(<MessageComposerContainer />);

    const input = screen.getByLabelText('Message');
    fireEvent.change(input, { target: { value: 'h' } });
    fireEvent.change(input, { target: { value: 'ho' } });
    fireEvent.change(input, { target: { value: 'hol' } });

    await vi.advanceTimersByTimeAsync(399);
    expect(sendTypingSignalMock).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(1);
    expect(sendTypingSignalMock).toHaveBeenCalledTimes(1);
    expect(sendTypingSignalMock).toHaveBeenLastCalledWith({ chatId: 'chat-typing', isTyping: true });
    vi.useRealTimers();
  });

  it('throttles typing signal and allows next call after cooldown', async () => {
    vi.useFakeTimers();
    chatUIState.selectedChatId = 'chat-typing';
    sendTypingSignalMock.mockResolvedValue({ ok: true });

    render(<MessageComposerContainer />);

    const input = screen.getByLabelText('Message');
    fireEvent.change(input, { target: { value: 'h' } });
    await vi.advanceTimersByTimeAsync(400);
    expect(sendTypingSignalMock).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: 'ho' } });
    await vi.advanceTimersByTimeAsync(400);
    expect(sendTypingSignalMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1200);
    fireEvent.change(input, { target: { value: 'hola' } });
    await vi.advanceTimersByTimeAsync(400);
    expect(sendTypingSignalMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('does not send typing signal when user is not authenticated', async () => {
    vi.useFakeTimers();
    chatUIState.selectedChatId = 'chat-typing';
    authState = { user: null };

    render(<MessageComposerContainer />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'hola' } });
    await vi.runAllTimersAsync();

    expect(sendTypingSignalMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('cancels pending typing signal when selected chat changes before debounce', async () => {
    vi.useFakeTimers();
    chatUIState.selectedChatId = 'chat-a';

    const { rerender } = render(<MessageComposerContainer />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'hola' } });

    chatUIState.selectedChatId = 'chat-b';
    rerender(<MessageComposerContainer />);

    await vi.runAllTimersAsync();

    expect(sendTypingSignalMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
