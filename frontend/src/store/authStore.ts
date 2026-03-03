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
  initialized: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      token: localStorage.getItem('auth_token'),
      initialized: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        initialized: true 
      }),
      
      setToken: (token) => {
        set({ token });
        setAuthToken(token);
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null,
          isLoading: false,
          initialized: true
        });
        setAuthToken(null);
        localStorage.removeItem('auth_token');
      },
      
      checkAuth: async () => {

        if (get().initialized) {
          set({ isLoading: false });
          return;
        }

        const token = get().token;

        if (!token) {
          console.log('ℹ️ No token found');
          set({ 
            isLoading: false, 
            initialized: true,
            user: null,
            isAuthenticated: false 
          });
          return;
        }

        const timeoutId = setTimeout(() => {
          console.log('⚠️ Auth check timeout - forcing completion');
          set({ 
            isLoading: false, 
            initialized: true,

            user: null,
            isAuthenticated: false,
            token: null
          });
          setAuthToken(null);
          localStorage.removeItem('auth_token');
        }, 5000); 

        try {
          console.log('🔍 Checking authentication with token...');
          const user = await authService.getCurrentUser();
          clearTimeout(timeoutId);
          
          console.log('✅ User authenticated:', user.username);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            initialized: true,
            token 
          });
        } catch (error) {
          clearTimeout(timeoutId);
          console.log('ℹ️ Authentication failed:', error);
          
          // Clear invalid token
          setAuthToken(null);
          localStorage.removeItem('auth_token');
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            initialized: true,
            token: null 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
      }),
    }
  )
);


const token = localStorage.getItem('auth_token');
if (token) {
  setAuthToken(token);
}