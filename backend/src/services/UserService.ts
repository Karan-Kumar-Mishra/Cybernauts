import { UserModel } from '../models/UserModel';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.getAllUsers();
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    this.validateUserData(userData);
    const user = await this.userModel.createUser(userData);
    await this.userModel.updatePopularityScore(user.id);
    return user;
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    if (updates.hobbies) {
      this.validateHobbies(updates.hobbies);
    }
    
    const updatedUser = await this.userModel.updateUser(id, updates);
    if (updatedUser) {
      await this.userModel.updatePopularityScore(id);
      // Update popularity scores of friends as well
      const friends = await this.userModel.getFriends(id);
      for (const friendId of friends) {
        await this.userModel.updatePopularityScore(friendId);
      }
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.userModel.deleteUser(id);
  }

  async createRelationship(userId: string, friendId: string): Promise<void> {
    await this.userModel.createRelationship(userId, friendId);
    // Update popularity scores for both users
    await this.userModel.updatePopularityScore(userId);
    await this.userModel.updatePopularityScore(friendId);
  }

  async removeRelationship(userId: string, friendId: string): Promise<void> {
    await this.userModel.removeRelationship(userId, friendId);
    // Update popularity scores for both users
    await this.userModel.updatePopularityScore(userId);
    await this.userModel.updatePopularityScore(friendId);
  }

  async getGraphData(): Promise<any> {
    return await this.userModel.getGraphData();
  }

  async getAllHobbies(): Promise<string[]> {
    return await this.userModel.getAllHobbies();
  }

  async addHobby(name: string): Promise<void> {
    await this.userModel.addHobby(name);
  }

  async removeHobby(name: string): Promise<void> {
    await this.userModel.removeHobby(name);
  }

  private validateUserData(userData: CreateUserRequest): void {
    if (!userData.username || userData.username.trim().length === 0) {
      throw new Error('Username is required');
    }
    if (userData.age < 0 || userData.age > 150) {
      throw new Error('Age must be between 0 and 150');
    }
    if (!Array.isArray(userData.hobbies)) {
      throw new Error('Hobbies must be an array');
    }
    this.validateHobbies(userData.hobbies);
  }

  private validateHobbies(hobbies: string[]): void {
    if (!hobbies.every(hobby => typeof hobby === 'string' && hobby.trim().length > 0)) {
      throw new Error('All hobbies must be non-empty strings');
    }
  }
}