import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/user.types';

export const authService = {
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    console.log('📝 Registering user:', data.email);
    const response = await api.post('/auth/register', data);
    console.log('✅ Registration successful - cookie should be set');
    return response.data;
  },

  async login(data: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 Logging in user:', data.email);
    const response = await api.post('/auth/login', data);
    console.log('✅ Login successful - cookie should be set');
    return response.data;
  },

  async logout(): Promise<void> {
    console.log('👋 Logging out...');
    await api.post('/auth/logout');
    console.log('✅ Logout successful - cookie cleared');
  },

  async getCurrentUser(): Promise<User> {
    console.log('🔍 Getting current user...');
    const response = await api.get('/auth/me');
    return response.data.user;
  },
};