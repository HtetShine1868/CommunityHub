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
      },
      

      checkAuth: async () => {

        if (get().initialized) return;
       
        const token = get().token;
        if (!token) {
          set({ isLoading: false, initialized: true  });
          return;
        }

        try {
          console.log('Checking authentication...');
          const user = await authService.getCurrentUser();
          console.log('User authenticated:', user.username);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            initialized: true,
            token 
          });
        } catch (error) {
          console.log('Not authenticated');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            initialized: true,
            token: null 
          });
          setAuthToken(null);
           localStorage.removeItem('auth_token');
        }
      },
    }),
    {
      name: 'auth-storage',
      
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        initialized: state.initialized,
      }),
    }
  )
);


const token = localStorage.getItem('auth_token');
if (token) {
  setAuthToken(token);
}