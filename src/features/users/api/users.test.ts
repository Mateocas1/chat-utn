import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/axios';
import { getUsers } from './users';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('users api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /users and returns payload', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: [{ id: 'u-1', displayName: 'Mica' }]
      }
    });

    const result = await getUsers();

    expect(apiClient.get).toHaveBeenCalledWith('/users');
    expect(result.items).toEqual([{ id: 'u-1', displayName: 'Mica' }]);
  });

  it('returns empty users list payload from backend', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { success: true, data: [] } });

    const result = await getUsers();

    expect(result.items).toEqual([]);
  });
});
