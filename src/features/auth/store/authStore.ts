import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { id: string; displayName: string } | null;
  setAuth: (token: string, user: { id: string; displayName: string }) => void;
  clearAuth: () => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
};

const resolveStorage = (): StateStorage => {
  if (import.meta.env.MODE === 'test') {
    return noopStorage;
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    return noopStorage;
  }

  return window.localStorage;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(resolveStorage)
    }
  )
);

export default useAuthStore;
