import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/axios';
import { getNotifications, markNotificationRead } from './notifications';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn()
  }
}));

describe('notifications api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /notifications and returns payload', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: [{ id: 'n-1', title: 'Title', message: 'Message', read: false, createdAt: '2026-05-01T00:00:00.000Z' }]
      }
    });

    const result = await getNotifications();

    expect(apiClient.get).toHaveBeenCalledWith('/notifications');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('n-1');
  });

  it('calls PATCH /notifications/:id/read and returns payload', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'n-1',
          title: 'Title',
          message: 'Message',
          read: true,
          createdAt: '2026-05-01T00:00:00.000Z'
        }
      }
    });

    const result = await markNotificationRead('n-1');

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/n-1/read');
    expect(result.read).toBe(true);
  });
});
