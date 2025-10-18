import { UserModel } from '../models/UserModel';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
    this.userModel.testDatabaseConnection();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.getAllUsers();
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    this.validateUserData(userData);
    const user = await this.userModel.createUser(userData);
    await this.userModel.updatePopularityScore(user.id);
    await this.userModel.invalidateGraphCache();
    return user;
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    if (updates.hobbies) {
      this.validateHobbies(updates.hobbies);
    }
    
    const updatedUser = await this.userModel.updateUser(id, updates);
    if (updatedUser) {
      await this.userModel.updatePopularityScore(id);
      const friends = await this.userModel.getFriends(id);
      console.log(`Updating popularity scores for ${friends.length} friends of user ${id}`);
      
      for (const friendId of friends) {
        await this.userModel.updatePopularityScore(friendId);
      }
      await this.userModel.invalidateGraphCache();
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.deleteUser(id);
    if (result) {
      await this.userModel.invalidateGraphCache();
    }
    return result;
  }

  async createRelationship(userId: string, friendId: string): Promise<void> {
    await this.userModel.createRelationship(userId, friendId);
    await this.userModel.updatePopularityScore(userId);
    await this.userModel.updatePopularityScore(friendId);
    const [userFriends, friendFriends] = await Promise.all([
      this.userModel.getFriends(userId),
      this.userModel.getFriends(friendId)
    ]);
    const allAffectedUsers = new Set([...userFriends, ...friendFriends]);
    console.log(`Updating popularity scores for ${allAffectedUsers.size} affected users`);
    for (const affectedUserId of allAffectedUsers) {
      await this.userModel.updatePopularityScore(affectedUserId);
    }
    await this.userModel.invalidateGraphCache();
  }

  async removeRelationship(userId: string, friendId: string): Promise<void> {
    await this.userModel.removeRelationship(userId, friendId);
    await this.userModel.updatePopularityScore(userId);
    await this.userModel.updatePopularityScore(friendId);
    const [userFriends, friendFriends] = await Promise.all([
      this.userModel.getFriends(userId),
      this.userModel.getFriends(friendId)
    ]);
    const allAffectedUsers = new Set([...userFriends, ...friendFriends]);
    console.log(`Updating popularity scores for ${allAffectedUsers.size} affected users`);
    
    for (const affectedUserId of allAffectedUsers) {
      await this.userModel.updatePopularityScore(affectedUserId);
    }
    await this.userModel?.invalidateGraphCache();
  }

  async getGraphData(): Promise<any> {
    return await this.userModel.getGraphData();
  }

  async getAllHobbies(): Promise<string[]> {
    return await this.userModel.getAllHobbies();
  }

  async addHobby(name: string): Promise<void> {
    await this.userModel.addHobby(name);
    await this.userModel.invalidateGraphCache();
  }

  async removeHobby(name: string): Promise<void> {
    await this.userModel.removeHobby(name);
    await this.userModel.invalidateGraphCache();
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