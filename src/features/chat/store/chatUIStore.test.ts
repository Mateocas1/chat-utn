import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatUIStore, type ChatToast } from './chatUIStore';

const createToast = (id: string, message: string): ChatToast => ({
  id,
  message,
  variant: 'info'
});

describe('useChatUIStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useChatUIStore.setState({
      selectedChatId: null,
      socketStatus: 'disconnected',
      typingByChatId: {},
      toastQueue: []
    });
  });

  it('starts with default ephemeral ui state', () => {
    const state = useChatUIStore.getState();

    expect(state.selectedChatId).toBeNull();
    expect(state.socketStatus).toBe('disconnected');
    expect(state.typingByChatId).toEqual({});
    expect(state.toastQueue).toEqual([]);
  });

  it('sets and clears selected chat id', () => {
    useChatUIStore.getState().setSelectedChatId('chat-1');
    expect(useChatUIStore.getState().selectedChatId).toBe('chat-1');

    useChatUIStore.getState().setSelectedChatId(null);
    expect(useChatUIStore.getState().selectedChatId).toBeNull();
  });

  it('updates socket status deterministically', () => {
    const setSocketStatus = useChatUIStore.getState().setSocketStatus;

    setSocketStatus('connecting');
    expect(useChatUIStore.getState().socketStatus).toBe('connecting');

    setSocketStatus('connected');
    expect(useChatUIStore.getState().socketStatus).toBe('connected');

    setSocketStatus('error');
    expect(useChatUIStore.getState().socketStatus).toBe('error');
  });

  it('tracks per-user typing state and evicts by ttl', () => {
    const { setUserTyping, clearUserTyping } = useChatUIStore.getState();

    setUserTyping('chat-1', 'u-1', 'Mica');
    setUserTyping('chat-1', 'u-2', 'Lauti');
    setUserTyping('chat-2', 'u-3', 'Ari');
    expect(useChatUIStore.getState().typingByChatId).toEqual({
      'chat-1': {
        'u-1': 'Mica',
        'u-2': 'Lauti'
      },
      'chat-2': {
        'u-3': 'Ari'
      }
    });

    clearUserTyping('chat-1', 'u-1');
    expect(useChatUIStore.getState().typingByChatId).toEqual({
      'chat-1': {
        'u-2': 'Lauti'
      },
      'chat-2': {
        'u-3': 'Ari'
      }
    });

    vi.advanceTimersByTime(3001);
    expect(useChatUIStore.getState().typingByChatId).toEqual({});
  });

  it('stacks toasts newest on top and auto-dismisses deterministically', () => {
    const first = createToast('t1', 'First');
    const second = createToast('t2', 'Second');
    const { enqueueToast, removeToast } = useChatUIStore.getState();

    enqueueToast(first);
    enqueueToast(second);
    expect(useChatUIStore.getState().toastQueue).toEqual([second, first]);

    vi.advanceTimersByTime(5000);
    expect(useChatUIStore.getState().toastQueue).toEqual([]);

    enqueueToast(first);
    removeToast('t1');
    vi.advanceTimersByTime(5000);
    expect(useChatUIStore.getState().toastQueue).toEqual([]);
  });

  it('dequeues latest toast first', () => {
    const first = createToast('t1', 'First');
    const second = createToast('t2', 'Second');
    const { enqueueToast, dequeueToast } = useChatUIStore.getState();

    enqueueToast(first);
    enqueueToast(second);

    const dequeued = dequeueToast();
    expect(dequeued).toEqual(second);
    expect(useChatUIStore.getState().toastQueue).toEqual([first]);
  });

  it('clears queued toasts timers between tests', () => {
    expect(useChatUIStore.getState().toastQueue).toEqual([]);
  });

  it('tracks push permission and opt-in rationale dialog state', () => {
    const { setPushPermission, setPushOptInDialogOpen } = useChatUIStore.getState();

    setPushOptInDialogOpen(true);
    expect(useChatUIStore.getState().pushOptInDialogOpen).toBe(true);

    setPushPermission('granted');
    expect(useChatUIStore.getState().pushPermission).toBe('granted');

    setPushOptInDialogOpen(false);
    expect(useChatUIStore.getState().pushOptInDialogOpen).toBe(false);
  });

  it('stores deterministic quiet hours and per-thread push settings', () => {
    const { setQuietHours, setThreadPushEnabled } = useChatUIStore.getState();

    setQuietHours({ enabled: true, start: '22:00', end: '07:00' });
    expect(useChatUIStore.getState().quietHours).toEqual({ enabled: true, start: '22:00', end: '07:00' });

    setThreadPushEnabled('chat-1', false);
    setThreadPushEnabled('chat-2', true);

    expect(useChatUIStore.getState().threadPushEnabled).toEqual({
      'chat-1': false,
      'chat-2': true
    });
  });
});
