import axios from 'axios';
import { User, CreateUserRequest, UpdateUserRequest, GraphData } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // User operations
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

  // Relationship operations
  async createRelationship(userId: string, friendId: string): Promise<void> {
    await api.post(`/users/${userId}/link`, { friendId });
  },

  async removeRelationship(userId: string, friendId: string): Promise<void> {
    await api.delete(`/users/${userId}/unlink`, { data: { friendId } });
  },

  // Graph operations
  async getGraphData(): Promise<GraphData> {
    const response = await api.get('/graph');
    return response.data;
  },
};