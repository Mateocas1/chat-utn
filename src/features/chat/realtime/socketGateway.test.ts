import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSocketGateway } from './socketGateway';

const onMock = vi.fn();
const offMock = vi.fn();
const emitMock = vi.fn();
const connectMock = vi.fn();
const disconnectMock = vi.fn();

const socket = {
  on: onMock,
  off: offMock,
  emit: emitMock,
  connect: connectMock,
  disconnect: disconnectMock
};

describe('socketGateway', () => {
  beforeEach(() => {
    onMock.mockReset();
    offMock.mockReset();
    emitMock.mockReset();
    connectMock.mockReset();
    disconnectMock.mockReset();
  });

  it('connects with lifecycle callbacks and maps status', () => {
    const onStatusChange = vi.fn();
    const onEvent = vi.fn();

    const gateway = createSocketGateway({
      socket,
      onStatusChange,
      onEvent
    });

    gateway.connect();
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(onMock).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(onMock).toHaveBeenCalledWith('disconnect', expect.any(Function));

    const connectHandler = onMock.mock.calls.find((call) => call[0] === 'connect')?.[1] as () => void;
    const disconnectHandler = onMock.mock.calls.find((call) => call[0] === 'disconnect')?.[1] as () => void;

    connectHandler();
    disconnectHandler();

    expect(onStatusChange).toHaveBeenNthCalledWith(1, 'connecting');
    expect(onStatusChange).toHaveBeenNthCalledWith(2, 'connected');
    expect(onStatusChange).toHaveBeenNthCalledWith(3, 'disconnected');
  });

  it('emits join and leave events for chat rooms', () => {
    const gateway = createSocketGateway({
      socket,
      onStatusChange: vi.fn(),
      onEvent: vi.fn()
    });

    gateway.joinChat('chat-1');
    gateway.leaveChat('chat-1');

    expect(emitMock).toHaveBeenCalledWith('joinChat', 'chat-1');
    expect(emitMock).toHaveBeenCalledWith('leaveChat', 'chat-1');
  });
});
