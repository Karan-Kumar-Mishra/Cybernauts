import pool from "../../config/pool";
import { CreateUserRequest } from "../../types";
import { User } from "../../types";
import invalidateUserCache from "../Cache/invalidateUserCache";
import { redisClient } from "../../config/redis";
import CACHE_TTL from "../../config/CACHE_TTL";

async function getUserById(id: string): Promise<User | null> {
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
        await redisClient.set(cacheKey, user, CACHE_TTL);
      } catch (error) {
        console.warn('Failed to cache user:', id);
      }
    }

    return user;
  }
  export default getUserById;