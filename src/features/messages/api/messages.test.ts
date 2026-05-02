import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/axios';
import { getMessages, sendMessage, sendTypingSignal } from './messages';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('messages api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /messages/typing with backend payload contract and does not depend on response body', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true, data: { accepted: true } } });

    const result = await sendTypingSignal({ chatId: 'chat-123', isTyping: true });

    expect(apiClient.post).toHaveBeenCalledWith('/messages/typing', { chatId: 'chat-123', isTyping: true });
    expect(result).toBeUndefined();
  });

  it('returns typed message collection from GET /messages envelope', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'm-1',
            chatId: 'chat-1',
            content: 'Hola',
            senderId: 'user-2',
            senderName: 'Mica',
            createdAt: '2026-05-01T00:00:00.000Z',
            status: 'delivered',
            retryable: false,
          },
        ],
        meta: {
          nextCursor: 'cursor-2',
        },
      },
    });

    const result = await getMessages({ chatId: 'chat-1' });

    expect(apiClient.get).toHaveBeenCalledWith('/messages', {
      params: { chatId: 'chat-1', cursor: undefined, limit: 50 }
    });
    expect(result.data[0]).toMatchObject({
      id: 'm-1',
      chatId: 'chat-1',
      content: 'Hola',
    });
    expect(result.nextCursor).toBe('cursor-2');
  });

  it('returns typed send-message response from POST /messages envelope', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'm-2',
          createdAt: '2026-05-01T01:00:00.000Z'
        }
      }
    });

    const result = await sendMessage({ chatId: 'chat-1', content: 'Mensaje nuevo' });

    expect(apiClient.post).toHaveBeenCalledWith('/messages', { chatId: 'chat-1', content: 'Mensaje nuevo' });
    expect(result).toEqual({ id: 'm-2', createdAt: '2026-05-01T01:00:00.000Z' });
  });

  it('ignores typing endpoint response shape variations', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

    const result = await sendTypingSignal({ chatId: 'chat-9', isTyping: false });

    expect(apiClient.post).toHaveBeenCalledWith('/messages/typing', { chatId: 'chat-9', isTyping: false });
    expect(result).toBeUndefined();
  });
});
