import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user.types';
import { authService } from '../services/auth.service';
import { setAuthToken } from '../services/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      token: localStorage.getItem('auth_token'),
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      
      setToken: (token) => {
        set({ token });
        setAuthToken(token);
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null,
          isLoading: false 
        });
        setAuthToken(null);
      },
      
      checkAuth: async () => {
        // If we have a token, try to get user
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          console.log('🔍 Checking authentication...');
          const user = await authService.getCurrentUser();
          console.log('✅ User authenticated:', user.username);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            token // Keep existing token
          });
        } catch (error) {
          console.log('ℹ️ Not authenticated');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            token: null 
          });
          setAuthToken(null);
        }
      },
    }),
    {
      name: 'auth-storage',
      // Persist both user and token
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Initialize token on store creation
const token = localStorage.getItem('auth_token');
if (token) {
  setAuthToken(token);
}