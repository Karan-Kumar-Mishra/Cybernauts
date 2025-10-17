import { UserModel } from '../models/UserModel';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  getAllUsers(): User[] {
    return this.userModel.getAllUsers();
  }

  createUser(userData: CreateUserRequest): User {
    this.validateUserData(userData);
    const user = this.userModel.createUser(userData);
    this.userModel.updateUserPopularityScore(user.id);
    return user;
  }

  updateUser(id: string, updates: UpdateUserRequest): User | null {
    if (updates.hobbies) {
      this.validateHobbies(updates.hobbies);
    }
    
    const updatedUser = this.userModel.updateUser(id, updates);
    if (updatedUser) {
      this.userModel.updateUserPopularityScore(id);
      // Update popularity scores of friends as well
      const friends = this.userModel.getFriends(id);
      friends.forEach(friendId => {
        this.userModel.updateUserPopularityScore(friendId);
      });
    }
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    return this.userModel.deleteUser(id);
  }

  createRelationship(userId: string, friendId: string): void {
    this.userModel.createRelationship(userId, friendId);
    // Update popularity scores for both users
    this.userModel.updateUserPopularityScore(userId);
    this.userModel.updateUserPopularityScore(friendId);
  }

  removeRelationship(userId: string, friendId: string): void {
    this.userModel.removeRelationship(userId, friendId);
    // Update popularity scores for both users
    this.userModel.updateUserPopularityScore(userId);
    this.userModel.updateUserPopularityScore(friendId);
  }

  getGraphData(): any {
    return this.userModel.getGraphData();
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