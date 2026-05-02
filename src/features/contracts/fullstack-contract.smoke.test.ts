import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/axios';
import { createChat } from '@/features/chats/api/chats';
import { getMessages, sendTypingSignal } from '@/features/messages/api/messages';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('fullstack contract smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps create chat + message history + typing contracts coherent', async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'chat-42',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
        },
      });

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 'msg-1',
            chatId: 'chat-42',
            senderId: 'user-b',
            content: 'hola',
            createdAt: '2026-05-01T00:00:00.000Z',
          },
        ],
        meta: {
          nextCursor: 'cursor-2',
        },
      },
    });

    const chat = await createChat('user-b');
    const history = await getMessages({ chatId: chat.id });
    const typing = await sendTypingSignal({ chatId: chat.id, isTyping: true });

    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/chats', { recipientId: 'user-b' });
    expect(apiClient.get).toHaveBeenCalledWith('/messages', {
      params: { chatId: 'chat-42', cursor: undefined, limit: 50 },
    });
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/messages/typing', { chatId: 'chat-42', isTyping: true });

    expect(chat).toEqual({ id: 'chat-42' });
    expect(history.data).toEqual([
      {
        id: 'msg-1',
        chatId: 'chat-42',
        senderId: 'user-b',
        content: 'hola',
        createdAt: '2026-05-01T00:00:00.000Z',
      },
    ]);
    expect(history.nextCursor).toBe('cursor-2');
    expect(typing).toBeUndefined();
  });
});
