import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserModel {
  private users: Map<string, User> = new Map();
  private relationships: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleUsers: User[] = [
      {
        id: uuidv4(),
        username: 'Alice',
        age: 25,
        hobbies: ['reading', 'gaming'],
        friends: [],
        createdAt: new Date(),
        popularityScore: 0
      },
      {
        id: uuidv4(),
        username: 'Bob',
        age: 30,
        hobbies: ['sports', 'music'],
        friends: [],
        createdAt: new Date(),
        popularityScore: 0
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
      this.relationships.set(user.id, new Set());
    });
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(userData: CreateUserRequest): User {
    const id = uuidv4();
    const newUser: User = {
      id,
      ...userData,
      friends: [],
      createdAt: new Date(),
      popularityScore: 0
    };
    
    this.users.set(id, newUser);
    this.relationships.set(id, new Set());
    return newUser;
  }

  updateUser(id: string, updates: UpdateUserRequest): User | null {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    const userRelationships = this.relationships.get(id);
    if (userRelationships && userRelationships.size > 0) {
      throw new Error('Cannot delete user with active relationships');
    }

    this.relationships.delete(id);
    return this.users.delete(id);
  }

  createRelationship(userId: string, friendId: string): void {
    if (userId === friendId) {
      throw new Error('Cannot create relationship with self');
    }

    if (!this.users.has(userId) || !this.users.has(friendId)) {
      throw new Error('User not found');
    }

    const userRelationships = this.relationships.get(userId);
    const friendRelationships = this.relationships.get(friendId);

    if (userRelationships && friendRelationships) {
      // Check if relationship already exists (circular prevention)
      if (userRelationships.has(friendId) || friendRelationships.has(userId)) {
        throw new Error('Relationship already exists');
      }

      userRelationships.add(friendId);
      friendRelationships.add(userId);
    }
  }

  removeRelationship(userId: string, friendId: string): void {
    const userRelationships = this.relationships.get(userId);
    const friendRelationships = this.relationships.get(friendId);

    if (userRelationships) {
      userRelationships.delete(friendId);
    }
    if (friendRelationships) {
      friendRelationships.delete(userId);
    }
  }

  getFriends(userId: string): string[] {
    const relationships = this.relationships.get(userId);
    return relationships ? Array.from(relationships) : [];
  }

  calculatePopularityScore(userId: string): number {
    const user = this.users.get(userId);
    if (!user) return 0;

    const friends = this.getFriends(userId);
    const uniqueFriends = new Set(friends).size;

    // Calculate shared hobbies with friends
    let totalSharedHobbies = 0;
    friends.forEach(friendId => {
      const friend = this.users.get(friendId);
      if (friend) {
        const sharedHobbies = user.hobbies.filter(hobby => 
          friend.hobbies.includes(hobby)
        );
        totalSharedHobbies += sharedHobbies.length;
      }
    });

    return uniqueFriends + (totalSharedHobbies * 0.5);
  }

  updateUserPopularityScore(userId: string): void {
    const score = this.calculatePopularityScore(userId);
    const user = this.users.get(userId);
    if (user) {
      user.popularityScore = score;
    }
  }

  getGraphData(): any {
    const nodes = this.getAllUsers().map(user => ({
      id: user.id,
      type: user.popularityScore > 5 ? 'highScore' : 'lowScore',
      data: {
        label: `${user.username} (${user.age})`,
        username: user.username,
        age: user.age,
        popularityScore: user.popularityScore,
        hobbies: user.hobbies
      },
      position: { x: Math.random() * 500, y: Math.random() * 500 }
    }));

    const edges: any[] = [];
    this.relationships.forEach((friends, userId) => {
      friends.forEach(friendId => {
        // Only create edge once to prevent duplicates
        if (userId < friendId) {
          edges.push({
            id: `${userId}-${friendId}`,
            source: userId,
            target: friendId,
            type: 'smoothstep'
          });
        }
      });
    });

    return { nodes, edges };
  }
}