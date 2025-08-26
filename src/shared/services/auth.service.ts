import { apiClient } from './api';
import { LoginCredentials, User } from '../../features/auth/types';

export interface LoginResponse {
  access_token: string;
  username: string;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
  token?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.error) {
      return { 
        success: false, 
        error: response.error 
      };
    }

    if (response.data) {
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.access_token);
      
      const user: User = {
        username: response.data.username,
        isAuthenticated: true
      };

      return {
        success: true,
        user,
        token: response.data.access_token
      };
    }

    return { 
      success: false, 
      error: 'Invalid response from server' 
    };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    const response = await apiClient.get<{username: string; isAuthenticated: boolean}>('/auth/me');
    
    if (response.error || !response.data) {
      localStorage.removeItem('auth_token');
      return null;
    }

    return {
      username: response.data.username,
      isAuthenticated: response.data.isAuthenticated
    };
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
