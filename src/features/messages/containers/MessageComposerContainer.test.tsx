import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageComposerContainer } from './MessageComposerContainer';

const setQueryDataMock = vi.fn();
const mutateMock = vi.fn();
const useMutationMock = vi.fn();
const emitTypingMock = vi.fn();

type ChatUIState = {
  selectedChatId: string | null;
};

let chatUIState: ChatUIState = {
  selectedChatId: null
};

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueryData: setQueryDataMock
  }),
  useMutation: (options: unknown) => useMutationMock(options)
}));

vi.mock('@/features/chat/store/chatUIStore', () => ({
  useChatUIStore: (selector: (state: ChatUIState) => unknown) => selector(chatUIState)
}));

vi.mock('@/features/chat/realtime/socketGateway', () => ({
  useSocketGateway: () => ({
    emitTyping: emitTypingMock
  })
}));

describe('MessageComposerContainer', () => {
  beforeEach(() => {
    chatUIState = { selectedChatId: null };
    setQueryDataMock.mockReset();
    mutateMock.mockReset();
    useMutationMock.mockReset();
    emitTypingMock.mockReset();

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

  it('emits typing event when user writes with selected chat', () => {
    chatUIState.selectedChatId = 'chat-typing';

    render(<MessageComposerContainer />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'h' } });

    expect(emitTypingMock).toHaveBeenCalledWith({ chatId: 'chat-typing', isTyping: true });
  });
});
