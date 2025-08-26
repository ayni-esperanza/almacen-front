import { apiClient } from './api';
import { LoginCredentials, User, UserRole } from '../../features/auth/types';

export interface LoginResponse {
  access_token: string;
  username: string;
  role: UserRole;
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
        id: 0, // Will be set when we get profile
        username: response.data.username,
        role: response.data.role,
        isActive: true,
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

    const response = await apiClient.get<User>('/auth/me');
    
    if (response.error || !response.data) {
      localStorage.removeItem('auth_token');
      return null;
    }

    return response.data;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
