import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { LoginCredentials, RegisterCredentials } from '../types/user.types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, user, isAuthenticated } = useAuthStore();
  const { addNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
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
      setUser(null);
      addNotification({ type: 'info', message: 'Logged out successfully' });
      navigate('/login');
    } catch (err: any) {
      addNotification({ type: 'error', message: 'Logout failed' });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
    isLoading: loading,
    error,
  };
};