import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { useChatUIStore } from '@/features/chat/store/chatUIStore';
import {
  CHATS_QUERY_KEY,
  NOTIFICATIONS_QUERY_KEY,
  createSocketEventRouter,
  type ChatPreview,
  type Message,
  type NotificationEventPayload
} from './socketEventRouter';

describe('socketEventRouter', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    useChatUIStore.setState({
      selectedChatId: null,
      socketStatus: 'disconnected',
      typingByChatId: {},
      toastQueue: []
    });
  });

  it('patches message cache and chat preview cache on message event', () => {
    const router = createSocketEventRouter({
      queryClient,
      chatUIStore: useChatUIStore.getState()
    });

    const existingMessage: Message = {
      id: 'm-1',
      chatId: 'chat-1',
      senderId: 'u-1',
      content: 'old',
      createdAt: '2026-04-30T12:00:00.000Z'
    };

    const incomingMessage: Message = {
      id: 'm-2',
      chatId: 'chat-1',
      senderId: 'u-2',
      content: 'new message',
      createdAt: '2026-04-30T12:01:00.000Z'
    };

    queryClient.setQueryData(['messages', 'chat-1'], { items: [existingMessage] });

    const chats: ChatPreview[] = [
      { id: 'chat-1', title: 'General', lastMessage: existingMessage },
      {
        id: 'chat-2',
        title: 'Random',
        lastMessage: {
          id: 'm-9',
          chatId: 'chat-2',
          senderId: 'u-3',
          content: 'other',
          createdAt: '2026-04-30T12:00:00.000Z'
        }
      }
    ];

    queryClient.setQueryData(CHATS_QUERY_KEY, chats);

    router.handleEvent({ type: 'message', payload: incomingMessage });

    expect(queryClient.getQueryData<{ items: Message[] }>(['messages', 'chat-1'])).toEqual({
      items: [existingMessage, incomingMessage]
    });

    expect(queryClient.getQueryData<{ items: ChatPreview[] }>(CHATS_QUERY_KEY)).toEqual({
      items: [{ id: 'chat-1', title: 'General', lastMessage: incomingMessage }, chats[1]]
    });
  });

  it('updates per-user typing state on typing event', () => {
    const router = createSocketEventRouter({
      queryClient,
      chatUIStore: useChatUIStore.getState()
    });

    router.handleEvent({
      type: 'typing',
      payload: {
        chatId: 'chat-1',
        userId: 'u-2',
        userName: 'Mica',
        isTyping: true
      }
    });

    expect(useChatUIStore.getState().typingByChatId).toEqual({
      'chat-1': {
        'u-2': 'Mica'
      }
    });

    router.handleEvent({
      type: 'typing',
      payload: {
        chatId: 'chat-1',
        userId: 'u-2',
        userName: 'Mica',
        isTyping: false
      }
    });

    expect(useChatUIStore.getState().typingByChatId).toEqual({});
  });

  it('prepends notification data and enqueues toast', () => {
    const router = createSocketEventRouter({
      queryClient,
      chatUIStore: useChatUIStore.getState()
    });

    const oldNotification: NotificationEventPayload = {
      id: 'n-1',
      message: 'old',
      variant: 'info',
      createdAt: '2026-04-30T12:00:00.000Z',
      mode: 'append'
    };

    const newNotification: NotificationEventPayload = {
      id: 'n-2',
      message: 'new',
      variant: 'success',
      createdAt: '2026-04-30T12:01:00.000Z',
      mode: 'prepend'
    };

    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, [oldNotification]);

    router.handleEvent({ type: 'notification', payload: newNotification });

    expect(queryClient.getQueryData<{ items: NotificationEventPayload[] }>(NOTIFICATIONS_QUERY_KEY)).toEqual({
      items: [newNotification, oldNotification]
    });

    expect(useChatUIStore.getState().toastQueue).toEqual([
      {
        id: 'n-2',
        message: 'new',
        variant: 'success'
      }
    ]);
  });

  it('appends notification data when mode is append', () => {
    const router = createSocketEventRouter({
      queryClient,
      chatUIStore: useChatUIStore.getState()
    });

    const first: NotificationEventPayload = {
      id: 'n-1',
      message: 'first',
      variant: 'info',
      createdAt: '2026-04-30T12:00:00.000Z',
      mode: 'append'
    };

    const second: NotificationEventPayload = {
      id: 'n-2',
      message: 'second',
      variant: 'warning',
      createdAt: '2026-04-30T12:01:00.000Z',
      mode: 'append'
    };

    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, [first]);

    router.handleEvent({ type: 'notification', payload: second });

    expect(queryClient.getQueryData<{ items: NotificationEventPayload[] }>(NOTIFICATIONS_QUERY_KEY)).toEqual({
      items: [first, second]
    });
  });

  it('suppresses toast enqueue during configured quiet hours', () => {
    const enqueueToast = vi.fn();
    const router = createSocketEventRouter({
      queryClient,
      chatUIStore: {
        setUserTyping: vi.fn(),
        clearUserTyping: vi.fn(),
        enqueueToast,
        quietHours: { enabled: true, start: '22:00', end: '07:00' },
        threadPushEnabled: { 'chat-1': true }
      }
    });

    const notification: NotificationEventPayload = {
      id: 'n-3',
      message: 'mention',
      variant: 'info',
      createdAt: '2026-04-30T23:15:00.000Z',
      mode: 'append',
      chatId: 'chat-1',
      kind: 'mention'
    };

    router.handleEvent({ type: 'notification', payload: notification, now: new Date(2026, 3, 30, 23, 15, 0) });

    expect(enqueueToast).not.toHaveBeenCalled();
  });
});
