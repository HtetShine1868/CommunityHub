import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { LoginCredentials, RegisterCredentials } from '../types/user.types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, user, isAuthenticated, logout: storeLogout } = useAuthStore();
  const { addNotification } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount and after login
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔍 Verifying authentication...');
        const userData = await authService.getCurrentUser();
        console.log('✅ User verified:', userData);
        setUser(userData);
      } catch (err) {
        console.log('❌ Not authenticated');
        setUser(null);
      }
    };
    
    verifyAuth();
  }, [setUser]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔐 Attempting login...');
      const response = await authService.login(credentials);
      console.log('✅ Login response:', response);
      
      // Immediately verify the user is authenticated
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        addNotification({
          type: 'success',
          message: `Welcome back, ${userData.username}!`,
        });
        navigate('/');
      } catch (verifyErr) {
        console.error('❌ Failed to verify after login:', verifyErr);
        setError('Login succeeded but failed to verify session');
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err);
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
      console.log('📝 Attempting registration...');
      const response = await authService.register(credentials);
      console.log('✅ Registration response:', response);
      
      // Immediately verify the user is authenticated
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        addNotification({
          type: 'success',
          message: `Welcome, ${userData.username}!`,
        });
        navigate('/');
      } catch (verifyErr) {
        console.error('❌ Failed to verify after registration:', verifyErr);
        setError('Registration succeeded but failed to create session');
      }
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
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
      console.log('👋 Logging out...');
      await authService.logout();
      storeLogout(); // Clear store and localStorage
      addNotification({ type: 'info', message: 'Logged out successfully' });
      navigate('/login');
    } catch (err: any) {
      console.error('❌ Logout failed:', err);
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
    error,
  };
};