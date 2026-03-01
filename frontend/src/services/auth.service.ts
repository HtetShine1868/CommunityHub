import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/user.types';

const TOKEN_KEY = 'auth_token';

export const authService = {
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }
    return response.data;
  },

  async login(data: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};