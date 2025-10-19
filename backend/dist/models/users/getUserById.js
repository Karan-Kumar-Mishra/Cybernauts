"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
const redis_1 = require("../../config/redis");
const CACHE_TTL_1 = __importDefault(require("../../config/CACHE_TTL"));
async function getUserById(id) {
    const cacheKey = `user:${id}`;
    // Try cache first
    try {
        const cachedUser = await redis_1.redisClient.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }
    }
    catch (error) {
        console.warn('Redis cache miss for user:', id);
    }
    const result = await pool_1.default.query(`
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
            await redis_1.redisClient.set(cacheKey, user, CACHE_TTL_1.default);
        }
        catch (error) {
            console.warn('Failed to cache user:', id);
        }
    }
    return user;
}
exports.default = getUserById;
