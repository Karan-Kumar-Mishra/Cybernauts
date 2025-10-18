import axios from 'axios';
import { User, CreateUserRequest, UpdateUserRequest, GraphData } from '../types';

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  //timeout: 20000,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('Server error');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to backend server');
    }
    
    return Promise.reject(error);
  }
);

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

  // Hobby operations - FIXED THESE
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