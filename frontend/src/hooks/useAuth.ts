import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { LoginCredentials, RegisterCredentials } from '../types/user.types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    setUser, 
    setToken, 
    logout: storeLogout, 
    checkAuth,
    isLoading: storeLoading 
  } = useAuthStore();
  const { addNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      if (response.token) {
        setToken(response.token);
      }
      addNotification({
        type: 'success',
        message: `Welcome back, ${response.user.username}!`,
      });
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
      if (response.token) {
        setToken(response.token);
      }
      addNotification({
        type: 'success',
        message: `Welcome, ${response.user.username}!`,
      });
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      setError(errorMsg);
      addNotification({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      storeLogout();
      addNotification({ type: 'info', message: 'Logged out successfully' });
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      // Still clear local state even if backend fails
      storeLogout();
      addNotification({ type: 'error', message: 'Logout failed, but cleared local session' });
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: storeLoading || loading,
    login,
    register,
    logout,
    error,
  };
};