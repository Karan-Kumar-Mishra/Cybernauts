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

    console.log(`🔍 Checking for existing relationships between ${userId} and ${friendId}`);

    // Check if relationship already exists (in either direction)
    const existingRelationship = await pool.query(`
    SELECT id FROM relationships 
    WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
  `, [userId, friendId]);

    console.log(`📋 Existing relationships found: ${existingRelationship.rows.length}`);

    if (existingRelationship.rows.length > 0) {
      throw new Error('Relationship already exists');
    }

    // Create bidirectional relationship
    console.log(`🔄 Creating bidirectional relationship: ${userId} ↔ ${friendId}`);
    await pool.query('BEGIN');
    try {
      // First relationship: user -> friend
      const result1 = await pool.query(
        'INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2) RETURNING id',
        [userId, friendId]
      );
      console.log(`✅ Created relationship 1: ${userId} → ${friendId}, ID: ${result1.rows[0].id}`);

      // Second relationship: friend -> user (bidirectional)
      const result2 = await pool.query(
        'INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2) RETURNING id',
        [friendId, userId]
      );
      console.log(`✅ Created relationship 2: ${friendId} → ${userId}, ID: ${result2.rows[0].id}`);

      await pool.query('COMMIT');
      console.log(`🎉 Successfully created bidirectional relationship between ${user.username} and ${friend.username}`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('❌ Failed to create relationship:', error);
      throw error;
    }

    // Update popularity scores
    await this.updatePopularityScore(userId);
    await this.updatePopularityScore(friendId);

    // Invalidate cache
    await this.invalidateGraphCache();
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`user:${friendId}`);
  }
  async invalidateGraphCache(): Promise<void> {
    const cacheKeys = ['graph:data', 'users:all'];

    console.log('Invalidating graph cache...');

    for (const key of cacheKeys) {
      try {
        if (redisClient.isReady()) {
          await redisClient.del(key);
          console.log(`Successfully invalidated cache key: ${key}`);
        }
      } catch (error) {
        console.warn(`Failed to invalidate cache key: ${key}`, error);
      }
    }
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

    console.log(`Calculating popularity for ${user.username}: ${uniqueFriends} friends`);

    for (const friendId of friends) {
      const friend = await this.getUserById(friendId);
      if (friend) {
        const userHobbies = Array.isArray(user.hobbies) ? user.hobbies : [];
        const friendHobbies = Array.isArray(friend.hobbies) ? friend.hobbies : [];

        const sharedHobbies = userHobbies.filter(hobby =>
          friendHobbies.includes(hobby)
        );
        totalSharedHobbies += sharedHobbies.length;

        if (sharedHobbies.length > 0) {
          console.log(`  Shared ${sharedHobbies.length} hobbies with ${friend.username}: ${sharedHobbies.join(', ')}`);
        }
      }
    }

    const score = uniqueFriends + (totalSharedHobbies * 0.5);
    console.log(`Final popularity score for ${user.username}: ${score} (friends: ${uniqueFriends}, shared hobbies: ${totalSharedHobbies})`);

    return score;
  }

  async updatePopularityScore(userId: string): Promise<void> {
    try {
      const score = await this.calculatePopularityScore(userId);

      await pool.query(
        'UPDATE users SET popularity_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [score, userId]
      );

      console.log(`Updated popularity score for user ${userId} to ${score}`);

      // Invalidate cache for this user
      await redisClient.del(`user:${userId}`);
    } catch (error) {
      console.error(`Error updating popularity score for user ${userId}:`, error);
    }
  }

  async getGraphData(): Promise<any> {
    const cacheKey = 'graph:data';

    // Try cache first
    try {
      if (redisClient.isReady()) {
        const cachedGraph = await redisClient.get(cacheKey);
        if (cachedGraph) {
          console.log('Returning cached graph data');
          return cachedGraph;
        }
      }
    } catch (error) {
      console.warn('Redis cache miss for graph data');
    }

    console.log('🔄 Fetching fresh graph data from database');

    // Get all users with their calculated popularity scores
    const usersResult = await pool.query(`
    SELECT 
      id,
      username,
      age,
      hobbies,
      popularity_score as "popularityScore"
    FROM users
    ORDER BY username
  `);

    const users = usersResult.rows;
    console.log(`👥 Found ${users.length} users in database`);

    // Get all relationships - FIXED: Remove the WHERE clause that filters relationships
    const relationshipsResult = await pool.query(`
    SELECT 
      user_id as source,
      friend_id as target
    FROM relationships
    ORDER BY user_id, friend_id
  `);

    console.log(`🔗 Found ${relationshipsResult.rows.length} relationships in database:`);

    if (relationshipsResult.rows.length > 0) {
      relationshipsResult.rows.forEach((rel: any) => {
        console.log(`   ${rel.source} → ${rel.target}`);
      });
    } else {
      console.log('   No relationships found in database');
    }

    // Generate positions for nodes
    const nodes = users.map((user: any, index: number) => {
      const gridSize = Math.ceil(Math.sqrt(users.length));
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const popularityScore = parseFloat(user.popularityScore) || 0;

      return {
        id: user.id,
        type: popularityScore > 5 ? 'highScore' : 'lowScore',
        data: {
          label: `${user.username} (${user.age})`,
          username: user.username,
          age: user.age,
          popularityScore: popularityScore,
          hobbies: user.hobbies || []
        },
        position: {
          x: col * 200 + 50,
          y: row * 150 + 50
        }
      };
    });

    // Create edges - ensure we don't create duplicates
    const edgeMap = new Map();
    const edges = relationshipsResult.rows.map((rel: any, index: number) => {
      // Create a unique key for the edge to avoid duplicates
      const edgeKey = [rel.source, rel.target].sort().join('-');

      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, true);
        return {
          id: `edge-${rel.source}-${rel.target}-${index}`,
          source: rel.source,
          target: rel.target,
          type: 'smoothstep',
          style: { stroke: '#555', strokeWidth: 2 }
        };
      }
      return null;
    }).filter(Boolean); // Remove null entries

    console.log(`🎯 Final graph data: ${nodes.length} nodes, ${edges.length} edges`);

    const graphData = { nodes, edges };

    // Cache the graph data
    try {
      if (redisClient.isReady()) {
        await redisClient.set(cacheKey, graphData, this.CACHE_TTL);
        console.log('✅ Graph data cached successfully');
      }
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
  async testDatabaseConnection(): Promise<void> {
    try {
      console.log('🔍 Testing database connection...');

      // Test basic connection
      const connectionTest = await pool.query('SELECT NOW() as current_time');
      console.log('✅ Database connection test passed:', connectionTest.rows[0].current_time);

      // Test users table
      const usersTest = await pool.query('SELECT COUNT(*) as user_count FROM users');
      console.log(`✅ Users table test passed: ${usersTest.rows[0].user_count} users`);

      // Test relationships table
      const relationshipsTest = await pool.query('SELECT COUNT(*) as relationship_count FROM relationships');
      console.log(`✅ Relationships table test passed: ${relationshipsTest.rows[0].relationship_count} relationships`);

    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      throw error;
    }
  }
}