import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('zustand/middleware', () => ({
  persist: (config: unknown) => config,
  createJSONStorage: () => undefined
}));

import useAuthStore from './authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('should initialize with null token and user', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should set auth token and user', () => {
    const token = 'test-token';
    const user = { id: 'user-id', displayName: 'testuser' };
    
    useAuthStore.getState().setAuth(token, user);
    
    const state = useAuthStore.getState();
    expect(state.token).toBe(token);
    expect(state.user).toEqual(user);
  });

  it('should clear auth token and user', () => {
    const token = 'test-token';
    const user = { id: 'user-id', displayName: 'testuser' };
    
    useAuthStore.getState().setAuth(token, user);
    useAuthStore.getState().clearAuth();
    
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
