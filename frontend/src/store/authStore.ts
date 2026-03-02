import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user.types';
import { authService } from '../services/auth.service';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      checkAuth: async () => {
        try {
          console.log('🔍 Checking authentication via cookie...');
          const user = await authService.getCurrentUser();
          console.log('✅ User authenticated:', user.username);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.log('ℹ️ Not authenticated');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data, NEVER tokens (cookies handle tokens)
      partialize: (state) => ({ 
        user: state.user,
        // Don't persist isAuthenticated - derive from user
      }),
    }
  )
);