import { vi, describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from '../features/auth/store/authStore';
import apiClient from './axios';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'uuid-value'),
}));

// Mock auth store
vi.mock('../features/auth/store/authStore', () => ({
  default: {
    getState: vi.fn(() => ({
      token: null,
      clearAuth: vi.fn(),
    })),
  },
}));

describe('Axios interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      const token = 'test-token';
      const config = { headers: {} as any };
      
      vi.mocked(useAuthStore.getState).mockReturnValue({
        token,
        user: null,
        setAuth: vi.fn(),
        clearAuth: vi.fn(),
      });

      // Access the interceptor from the real axios instance
      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;
      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add Authorization header when token is null', async () => {
      const config = { headers: {} as any };
      
      vi.mocked(useAuthStore.getState).mockReturnValue({
        token: null,
        user: null,
        setAuth: vi.fn(),
        clearAuth: vi.fn(),
      });

      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;
      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should add Idempotency-Key header for POST requests', async () => {
      const config = { method: 'POST', headers: {} as any };
      
      vi.mocked(useAuthStore.getState).mockReturnValue({
        token: null,
        user: null,
        setAuth: vi.fn(),
        clearAuth: vi.fn(),
      });

      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;
      const result = await requestInterceptor(config);

      expect(result.headers['Idempotency-Key']).toBe('uuid-value');
    });
  });

  describe('Response interceptor', () => {
    it('should clear auth store on 401 Unauthorized response', async () => {
      const error = { response: { status: 401 } };
      const clearAuthMock = vi.fn();
      
      vi.mocked(useAuthStore.getState).mockReturnValue({
        token: null,
        user: null,
        setAuth: vi.fn(),
        clearAuth: clearAuthMock,
      });

      const responseErrorInterceptor = (apiClient.interceptors.response as any).handlers[0].rejected;
      
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(clearAuthMock).toHaveBeenCalled();
    });
  });
});
