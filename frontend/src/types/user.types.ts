export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
    token: string;
}