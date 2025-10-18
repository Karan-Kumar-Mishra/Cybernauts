import User from '../interfaces/User';
import { CreateUserRequest } from '../interfaces/CreateUserRequest';
import { UpdateUserRequest } from '../interfaces/UpdateUserRequest';
import { GraphData } from '../interfaces/GraphData';
import api from './api';

export const apiService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/users/${userId}`, updates);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },

  async createRelationship(userId: string, friendId: string): Promise<void> {
    await api.post(`/users/${userId}/link`, { friendId });
  },

  async removeRelationship(userId: string, friendId: string): Promise<void> {
    await api.delete(`/users/${userId}/unlink`, { data: { friendId } });
  },

  async getGraphData(): Promise<GraphData> {
    const response = await api.get('/graph');
    return response.data;
  },


  async getAllHobbies(): Promise<string[]> {
    try {
      const response = await api.get('/hobbies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch hobbies from backend, returning empty array');
      return [];
    }
  },

  async addHobby(name: string): Promise<void> {
    const response = await api.post('/hobbies', { name });
    return response.data;
  },

  async removeHobby(name: string): Promise<void> {
    await api.delete('/hobbies', { data: { name } });    
  },
};