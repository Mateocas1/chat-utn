import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { id: string; username: string } | null;
  setAuth: (token: string, user: { id: string; username: string }) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null })
    }),
    {
      name: 'auth-storage'
    }
  )
);

export default useAuthStore;