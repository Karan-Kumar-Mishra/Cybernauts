import { pool } from '../config/database';
import { redisClient } from '../config/redis';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserModel {
  private readonly CACHE_TTL = 300; // 5 minutes

  async getAllUsers(): Promise<User[]> {
    const cacheKey = 'users:all';
    
    // Try to get from cache first
    try {
      const cachedUsers = await redisClient.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }
    } catch (error) {
      console.warn('Redis cache miss, falling back to database');
    }

    // Get from database
    const result = await pool.query(`
      SELECT 
        id,
        username,
        age,
        hobbies,
        created_at as "createdAt",
        popularity_score as "popularityScore",
        (
          SELECT ARRAY_AGG(friend_id)
          FROM relationships 
          WHERE user_id = users.id
        ) as friends
      FROM users
      ORDER BY popularity_score DESC
    `);

    const users = result.rows;

    // Cache the result
    try {
      await redisClient.set(cacheKey, users, this.CACHE_TTL);
    } catch (error) {
      console.warn('Failed to cache users');
    }

    return users;
  }

  async getUserById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    
    // Try cache first
    try {
      const cachedUser = await redisClient.get(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }
    } catch (error) {
      console.warn('Redis cache miss for user:', id);
    }

    const result = await pool.query(`
      SELECT 
        id,
        username,
        age,
        hobbies,
        created_at as "createdAt",
        popularity_score as "popularityScore",
        (
          SELECT ARRAY_AGG(friend_id)
          FROM relationships 
          WHERE user_id = users.id
        ) as friends
      FROM users 
      WHERE id = $1
    `, [id]);

    const user = result.rows[0] || null;

    // Cache the user
    if (user) {
      try {
        await redisClient.set(cacheKey, user, this.CACHE_TTL);
      } catch (error) {
        console.warn('Failed to cache user:', id);
      }
    }

    return user;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const { username, age, hobbies } = userData;
    
    const result = await pool.query(`
      INSERT INTO users (username, age, hobbies, popularity_score)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id,
        username,
        age,
        hobbies,
        created_at as "createdAt",
        popularity_score as "popularityScore"
    `, [username, age, hobbies || [], 0]);

    const newUser = {
      ...result.rows[0],
      friends: []
    };

    // Invalidate cache
    await this.invalidateUserCache();

    return newUser;
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    const { username, age, hobbies } = updates;
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (username !== undefined) {
      setClauses.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (age !== undefined) {
      setClauses.push(`age = $${paramCount}`);
      values.push(age);
      paramCount++;
    }

    if (hobbies !== undefined) {
      setClauses.push(`hobbies = $${paramCount}`);
      values.push(hobbies);
      paramCount++;
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    if (setClauses.length === 0) {
      return this.getUserById(id);
    }

    values.push(id);

    const result = await pool.query(`
      UPDATE users 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        username,
        age,
        hobbies,
        created_at as "createdAt",
        popularity_score as "popularityScore"
    `, values);

    const updatedUser = result.rows[0] || null;

    if (updatedUser) {
      // Get friends for the updated user
      const friendsResult = await pool.query(
        'SELECT friend_id FROM relationships WHERE user_id = $1',
        [id]
      );
      updatedUser.friends = friendsResult.rows.map((row: any) => row.friend_id);

      // Invalidate cache
      await this.invalidateUserCache();
      await redisClient.del(`user:${id}`);
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    // Check if user has relationships
    const relationshipsResult = await pool.query(
      'SELECT COUNT(*) FROM relationships WHERE user_id = $1 OR friend_id = $1',
      [id]
    );

    const relationshipCount = parseInt(relationshipsResult.rows[0].count);
    if (relationshipCount > 0) {
      throw new Error('Cannot delete user with active relationships');
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    const deleted = result.rows.length > 0;

    if (deleted) {
      // Invalidate cache
      await this.invalidateUserCache();
      await redisClient.del(`user:${id}`);
    }

    return deleted;
  }

  async createRelationship(userId: string, friendId: string): Promise<void> {
    if (userId === friendId) {
      throw new Error('Cannot create relationship with self');
    }

    // Check if users exist
    const [user, friend] = await Promise.all([
      this.getUserById(userId),
      this.getUserById(friendId)
    ]);

    if (!user || !friend) {
      throw new Error('User not found');
    }

    // Check if relationship already exists (in either direction)
    const existingRelationship = await pool.query(`
      SELECT id FROM relationships 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `, [userId, friendId]);

    if (existingRelationship.rows.length > 0) {
      throw new Error('Relationship already exists');
    }

    // Create bidirectional relationship
    await pool.query('BEGIN');
    try {
      await pool.query(
        'INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2)',
        [userId, friendId]
      );
      await pool.query(
        'INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2)',
        [friendId, userId]
      );
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

    // Update popularity scores
    await this.updatePopularityScore(userId);
    await this.updatePopularityScore(friendId);

    // Invalidate cache
    await this.invalidateUserCache();
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`user:${friendId}`);
  }

  async removeRelationship(userId: string, friendId: string): Promise<void> {
    await pool.query('BEGIN');
    try {
      await pool.query(
        'DELETE FROM relationships WHERE user_id = $1 AND friend_id = $2',
        [userId, friendId]
      );
      await pool.query(
        'DELETE FROM relationships WHERE user_id = $1 AND friend_id = $2',
        [friendId, userId]
      );
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

    // Update popularity scores
    await this.updatePopularityScore(userId);
    await this.updatePopularityScore(friendId);

    // Invalidate cache
    await this.invalidateUserCache();
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`user:${friendId}`);
  }

  async getFriends(userId: string): Promise<string[]> {
    const result = await pool.query(
      'SELECT friend_id FROM relationships WHERE user_id = $1',
      [userId]
    );
    return result.rows.map((row: any) => row.friend_id);
  }

  async calculatePopularityScore(userId: string): Promise<number> {
    const user = await this.getUserById(userId);
    if (!user) return 0;

    const friends = await this.getFriends(userId);
    const uniqueFriends = new Set(friends).size;

    // Calculate shared hobbies with friends
    let totalSharedHobbies = 0;
    
    for (const friendId of friends) {
      const friend = await this.getUserById(friendId);
      if (friend) {
        const sharedHobbies = user.hobbies.filter((hobby: string) => 
          friend.hobbies.includes(hobby)
        );
        totalSharedHobbies += sharedHobbies.length;
      }
    }

    return uniqueFriends + (totalSharedHobbies * 0.5);
  }

  async updatePopularityScore(userId: string): Promise<void> {
    const score = await this.calculatePopularityScore(userId);
    
    await pool.query(
      'UPDATE users SET popularity_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [score, userId]
    );

    // Invalidate cache
    await redisClient.del(`user:${userId}`);
  }

  async getGraphData(): Promise<any> {
    const cacheKey = 'graph:data';
    
    // Try cache first
    try {
      const cachedGraph = await redisClient.get(cacheKey);
      if (cachedGraph) {
        return cachedGraph;
      }
    } catch (error) {
      console.warn('Redis cache miss for graph data');
    }

    // Get all users with their friends
    const usersResult = await pool.query(`
      SELECT 
        id,
        username,
        age,
        hobbies,
        popularity_score as "popularityScore"
      FROM users
    `);

    const users = usersResult.rows;

    // Get all relationships
    const relationshipsResult = await pool.query(`
      SELECT DISTINCT 
        LEAST(user_id, friend_id) as source,
        GREATEST(user_id, friend_id) as target
      FROM relationships
    `);

    const nodes = users.map((user: any) => ({
      id: user.id,
      type: user.popularityScore > 5 ? 'highScore' : 'lowScore',
      data: {
        label: `${user.username} (${user.age})`,
        username: user.username,
        age: user.age,
        popularityScore: parseFloat(user.popularityScore),
        hobbies: user.hobbies || []
      },
      position: { 
        x: Math.random() * 800, 
        y: Math.random() * 600 
      }
    }));

    const edges = relationshipsResult.rows.map((rel: any, index: number) => ({
      id: `edge-${index}`,
      source: rel.source,
      target: rel.target,
      type: 'smoothstep'
    }));

    const graphData = { nodes, edges };

    // Cache the graph data
    try {
      await redisClient.set(cacheKey, graphData, this.CACHE_TTL);
    } catch (error) {
      console.warn('Failed to cache graph data');
    }

    return graphData;
  }

  // Hobby management methods
  async getAllHobbies(): Promise<string[]> {
    const result = await pool.query('SELECT name FROM hobbies ORDER BY name');
    return result.rows.map((row: any) => row.name);
  }

  async addHobby(name: string): Promise<void> {
    await pool.query(
      'INSERT INTO hobbies (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [name]
    );
    
    // Invalidate relevant caches
    await this.invalidateUserCache();
  }

  async removeHobby(name: string): Promise<void> {
    await pool.query('DELETE FROM hobbies WHERE name = $1', [name]);
    
    // Invalidate relevant caches
    await this.invalidateUserCache();
  }

  private async invalidateUserCache(): Promise<void> {
    const cacheKeys = ['users:all', 'graph:data'];
    
    for (const key of cacheKeys) {
      try {
        await redisClient.del(key);
      } catch (error) {
        console.warn(`Failed to invalidate cache key: ${key}`);
      }
    }
  }
}