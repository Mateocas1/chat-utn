import { useMemo } from 'react';
import { io, type Socket } from 'socket.io-client';
import useAuthStore from '@/features/auth/store/authStore';
import { useChatUIStore, type SocketStatus } from '@/features/chat/store/chatUIStore';
import { socketEventRouter, type NotificationEventPayload, type TypingEventPayload, type Message } from './socketEventRouter';

type OutboundTypingPayload = {
  chatId: string;
  isTyping: boolean;
};

type IncomingSocketEvent =
  | { type: 'message'; payload: Message }
  | { type: 'typing'; payload: TypingEventPayload }
  | { type: 'notification'; payload: NotificationEventPayload };

type SocketLike = Pick<Socket, 'on' | 'off' | 'emit' | 'connect' | 'disconnect'>;

type CreateSocketGatewayOptions = {
  socket: SocketLike;
  onStatusChange: (status: SocketStatus) => void;
  onEvent: (event: IncomingSocketEvent) => void;
};

export const createSocketGateway = ({ socket, onStatusChange, onEvent }: CreateSocketGatewayOptions) => {
  const bindEvents = () => {
    socket.on('connect', () => onStatusChange('connected'));
    socket.on('disconnect', () => onStatusChange('disconnected'));
    socket.on('connect_error', () => onStatusChange('error'));

    socket.on('message', (payload: Message) => onEvent({ type: 'message', payload }));
    socket.on('typing', (payload: TypingEventPayload) => onEvent({ type: 'typing', payload }));
    socket.on('notification', (payload: NotificationEventPayload) => onEvent({ type: 'notification', payload }));
  };

  return {
    connect: () => {
      onStatusChange('connecting');
      bindEvents();
      socket.connect();
    },
    disconnect: () => {
      socket.disconnect();
      onStatusChange('disconnected');
    },
    joinChat: (chatId: string) => {
      socket.emit('joinChat', chatId);
    },
    leaveChat: (chatId: string) => {
      socket.emit('leaveChat', chatId);
    },
    emitTyping: (payload: OutboundTypingPayload) => {
      socket.emit('typing', payload);
    },
    subscribe: bindEvents
  };
};

const getSocket = () => {
  const token = useAuthStore.getState().token;
  return io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000', {
    autoConnect: false,
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
    reconnectionAttempts: Infinity
  });
};

export const useSocketGateway = () => {
  return useMemo(() => {
    const socket = getSocket();
    return createSocketGateway({
      socket,
      onStatusChange: (status) => useChatUIStore.getState().setSocketStatus(status),
      onEvent: (event) => socketEventRouter.handleEvent(event)
    });
  }, []);
};
