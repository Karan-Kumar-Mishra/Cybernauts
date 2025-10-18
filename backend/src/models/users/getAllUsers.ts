import pool from "../../config/pool";
import { CreateUserRequest } from "../../types";
import { User } from "../../types";
import invalidateUserCache from "../Cache/invalidateUserCache";
import { redisClient } from "../../config/redis";
import CACHE_TTL from "../../config/CACHE_TTL";
async function getAllUsers(): Promise<User[]> {
    const cacheKey = 'users:all';
    try {
      const cachedUsers = await redisClient.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }
    } catch (error) {
      console.warn('Redis cache miss, falling back to database');
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
      ORDER BY popularity_score DESC
    `);

    const users = result.rows;

    // Cache the result
    try {
      await redisClient.set(cacheKey, users, CACHE_TTL);
    } catch (error) {
      console.warn('Failed to cache users');
    }

    return users;
  }
  export default getAllUsers;