import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user.types';
import { authService } from '../services/auth.service';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false });
      },
      checkAuth: async () => {
        if (authService.getToken()) {
          try {
            const user = await authService.getCurrentUser();
            set({ user, isAuthenticated: true });
          } catch (error) {
            localStorage.removeItem('auth_token');
            set({ user: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);