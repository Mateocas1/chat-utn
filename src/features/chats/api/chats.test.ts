import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/axios';
import { getChats } from './chats';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('chats api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns direct chats array from backend list contract', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'chat-1',
            title: 'General',
            unreadCount: 2,
            updatedAt: '2026-05-01T00:00:00.000Z',
            lastMessage: { content: 'hola' },
          },
        ],
      },
    });

    const result = await getChats({ pageParam: 'cursor-1' });

    expect(apiClient.get).toHaveBeenCalledWith('/chats', {
      params: { cursor: 'cursor-1', limit: 20 },
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({
      id: 'chat-1',
      title: 'General',
      unreadCount: 2,
    });
  });

  it('returns empty direct array when backend has no chats', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });

    const result = await getChats({});

    expect(apiClient.get).toHaveBeenCalledWith('/chats', {
      params: { cursor: undefined, limit: 20 },
    });
    expect(result).toEqual([]);
  });
});
