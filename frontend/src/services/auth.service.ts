import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/user.types';

export const authService = {
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.user;
  },
};