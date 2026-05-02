import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatThreadContainer } from './ChatThreadContainer';

const useQueryMock = vi.fn();

type ChatUIState = {
  selectedChatId: string | null;
  socketStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
};

let chatUIState: ChatUIState = {
  selectedChatId: null,
  socketStatus: 'disconnected'
};

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => useQueryMock(options)
}));

vi.mock('@/features/chat/store/chatUIStore', () => ({
  useChatUIStore: (selector: (state: ChatUIState) => unknown) => selector(chatUIState)
}));

vi.mock('@/features/chats/containers/NotificationSettingsContainer', () => ({
  NotificationSettingsContainer: () => <div>NotificationSettingsContainer</div>
}));

describe('ChatThreadContainer', () => {
  beforeEach(() => {
    chatUIState = {
      selectedChatId: null,
      socketStatus: 'disconnected'
    };
    useQueryMock.mockReset();
  });

  it('renders empty prompt when no chat is selected', () => {
    useQueryMock.mockReturnValue({ data: [] });

    render(<ChatThreadContainer />);

    expect(screen.getByText('Seleccioná un chat para empezar')).toBeInTheDocument();
  });

  it('adapts selected chat into ChatThreadHeader content', () => {
    chatUIState.selectedChatId = 'chat-2';
    useQueryMock.mockReturnValue({
      data: [
        {
          id: 'chat-1',
          title: 'Infra',
          participantCount: 2,
          updatedAt: '2026-04-30T12:00:00.000Z'
        },
        {
          id: 'chat-2',
          title: 'Producto',
          participantCount: 4,
          updatedAt: '2026-04-30T12:03:00.000Z'
        }
      ]
    });

    render(<ChatThreadContainer />);

    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('4 participantes')).toBeInTheDocument();
  });

  it('hides status indicator when connected', () => {
    chatUIState.selectedChatId = 'chat-1';
    chatUIState.socketStatus = 'connected';
    useQueryMock.mockReturnValue({
      data: [{ id: 'chat-1', title: 'Infra', participantCount: 2, updatedAt: '2026-04-30T12:00:00.000Z' }]
    });

    render(<ChatThreadContainer />);

    expect(screen.queryByLabelText('Estado de presencia')).toBeNull();
  });

  it('shows reconnecting status while disconnected and clears when recovered', () => {
    chatUIState.selectedChatId = 'chat-1';
    chatUIState.socketStatus = 'disconnected';
    useQueryMock.mockReturnValue({
      data: [{ id: 'chat-1', title: 'Infra', participantCount: 2, updatedAt: '2026-04-30T12:00:00.000Z' }]
    });

    const { rerender } = render(<ChatThreadContainer />);

    expect(screen.getByLabelText('Estado de presencia')).toHaveTextContent('Reconnecting…');

    chatUIState.socketStatus = 'connected';
    rerender(<ChatThreadContainer />);

    expect(screen.queryByLabelText('Estado de presencia')).toBeNull();
  });

  it('renders accessible notification settings trigger in header actions', () => {
    chatUIState.selectedChatId = 'chat-1';
    useQueryMock.mockReturnValue({
      data: [{ id: 'chat-1', title: 'Infra', participantCount: 2, updatedAt: '2026-04-30T12:00:00.000Z' }]
    });

    render(<ChatThreadContainer />);

    expect(screen.getByRole('button', { name: 'Ajustes de notificaciones' })).toBeInTheDocument();
  });

  it('opens notification settings dialog and closes with escape', () => {
    chatUIState.selectedChatId = 'chat-1';
    useQueryMock.mockReturnValue({
      data: [{ id: 'chat-1', title: 'Infra', participantCount: 2, updatedAt: '2026-04-30T12:00:00.000Z' }]
    });

    render(<ChatThreadContainer />);

    const trigger = screen.getByRole('button', { name: 'Ajustes de notificaciones' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Ajustes de notificaciones' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('NotificationSettingsContainer')).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Ajustes de notificaciones' })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});
