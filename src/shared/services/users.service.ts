import { apiClient } from './api';
import { User, CreateUserData, UpdateUserData } from '../../features/auth/types';

class UsersService {
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/auth/users');
    
    if (response.error) {
      console.error('Error fetching users:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async getUserById(id: number): Promise<User | null> {
    const response = await apiClient.get<User>(`/auth/users/${id}`);
    
    if (response.error) {
      console.error('Error fetching user:', response.error);
      return null;
    }
    
    return response.data || null;
  }

  async createUser(userData: CreateUserData): Promise<User | null> {
    const response = await apiClient.post<User>('/auth/users', userData);
    
    if (response.error) {
      console.error('Error creating user:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
    const response = await apiClient.patch<User>(`/auth/users/${id}`, userData);
    
    if (response.error) {
      console.error('Error updating user:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/auth/users/${id}`);
    
    if (response.error) {
      console.error('Error deleting user:', response.error);
      return false;
    }
    
    return true;
  }

  async toggleUserStatus(id: number, isActive: boolean): Promise<User | null> {
    const response = await apiClient.patch<User>(`/auth/users/${id}`, { isActive });
    
    if (response.error) {
      console.error('Error toggling user status:', response.error);
      throw new Error(response.error);
    }
    
    return response.data || null;
  }
}

export const usersService = new UsersService();
