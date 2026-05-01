import { create } from 'zustand';

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ChatToast {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
}

export type PushPermissionState = NotificationPermission | 'unsupported';

export type QuietHours = {
  enabled: boolean;
  start: string;
  end: string;
};

export type TypingUsersByChatId = Record<string, Record<string, string>>;

interface ChatUIState {
  selectedChatId: string | null;
  socketStatus: SocketStatus;
  typingByChatId: TypingUsersByChatId;
  toastQueue: ChatToast[];
  pushPermission: PushPermissionState;
  pushOptInDialogOpen: boolean;
  quietHours: QuietHours;
  threadPushEnabled: Record<string, boolean>;
  setSelectedChatId: (chatId: string | null) => void;
  setSocketStatus: (status: SocketStatus) => void;
  setUserTyping: (chatId: string, userId: string, userName: string, ttlMs?: number) => void;
  clearUserTyping: (chatId: string, userId: string) => void;
  clearChatTyping: (chatId: string) => void;
  enqueueToast: (toast: ChatToast) => void;
  dequeueToast: () => ChatToast | undefined;
  removeToast: (toastId: string) => void;
  setPushPermission: (permission: PushPermissionState) => void;
  setPushOptInDialogOpen: (isOpen: boolean) => void;
  setQuietHours: (quietHours: QuietHours) => void;
  setThreadPushEnabled: (chatId: string, enabled: boolean) => void;
}

const typingTimers = new Map<string, Map<string, ReturnType<typeof setTimeout>>>();
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();
const TOAST_AUTO_DISMISS_MS = 5000;

const clearTypingTimer = (chatId: string, userId: string) => {
  const chatTimers = typingTimers.get(chatId);
  const timer = chatTimers?.get(userId);

  if (!timer) {
    return;
  }

  clearTimeout(timer);
  chatTimers?.delete(userId);

  if (chatTimers && chatTimers.size === 0) {
    typingTimers.delete(chatId);
  }
};

export const useChatUIStore = create<ChatUIState>()((set, get) => ({
  selectedChatId: null,
  socketStatus: 'disconnected',
  typingByChatId: {},
  toastQueue: [],
  pushPermission: typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  pushOptInDialogOpen: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00'
  },
  threadPushEnabled: {},
  setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),
  setSocketStatus: (status) => set({ socketStatus: status }),
  setUserTyping: (chatId, userId, userName, ttlMs = 3000) => {
    clearTypingTimer(chatId, userId);

    set((state) => ({
      typingByChatId: {
        ...state.typingByChatId,
        [chatId]: {
          ...(state.typingByChatId[chatId] ?? {}),
          [userId]: userName
        }
      }
    }));

    if (!typingTimers.has(chatId)) {
      typingTimers.set(chatId, new Map());
    }

    const chatTimers = typingTimers.get(chatId);
    const timeout = setTimeout(() => {
      get().clearUserTyping(chatId, userId);
    }, ttlMs);

    chatTimers?.set(userId, timeout);
  },
  clearUserTyping: (chatId, userId) => {
    clearTypingTimer(chatId, userId);

    set((state) => {
      const currentChatTyping = state.typingByChatId[chatId];
      if (!currentChatTyping) {
        return state;
      }

      const nextChatTyping = { ...currentChatTyping };
      delete nextChatTyping[userId];

      const nextTypingByChatId = { ...state.typingByChatId };
      if (Object.keys(nextChatTyping).length === 0) {
        delete nextTypingByChatId[chatId];
      } else {
        nextTypingByChatId[chatId] = nextChatTyping;
      }

      return { typingByChatId: nextTypingByChatId };
    });
  },
  clearChatTyping: (chatId) => {
    const chatTimers = typingTimers.get(chatId);
    chatTimers?.forEach((timer) => clearTimeout(timer));
    typingTimers.delete(chatId);

    set((state) => {
      const nextTypingByChatId = { ...state.typingByChatId };
      delete nextTypingByChatId[chatId];
      return { typingByChatId: nextTypingByChatId };
    });
  },
  enqueueToast: (toast) =>
    {
      const existingTimer = toastTimers.get(toast.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timeout = setTimeout(() => {
        get().removeToast(toast.id);
      }, TOAST_AUTO_DISMISS_MS);

      toastTimers.set(toast.id, timeout);

      set((state) => ({
        toastQueue: [toast, ...state.toastQueue.filter((current) => current.id !== toast.id)]
      }));
    },
  dequeueToast: () => {
    const firstToast = get().toastQueue[0];

    if (!firstToast) {
      return undefined;
    }

    const firstToastTimer = toastTimers.get(firstToast.id);
    if (firstToastTimer) {
      clearTimeout(firstToastTimer);
      toastTimers.delete(firstToast.id);
    }

    set((state) => ({
      toastQueue: state.toastQueue.slice(1)
    }));

    return firstToast;
  },
  removeToast: (toastId) =>
    {
      const timer = toastTimers.get(toastId);
      if (timer) {
        clearTimeout(timer);
        toastTimers.delete(toastId);
      }

      set((state) => ({
        toastQueue: state.toastQueue.filter((toast) => toast.id !== toastId)
      }));
    },
  setPushPermission: (permission) => set({ pushPermission: permission }),
  setPushOptInDialogOpen: (isOpen) => set({ pushOptInDialogOpen: isOpen }),
  setQuietHours: (quietHours) => set({ quietHours }),
  setThreadPushEnabled: (chatId, enabled) =>
    set((state) => ({
      threadPushEnabled: {
        ...state.threadPushEnabled,
        [chatId]: enabled
      }
    }))
}));
