"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
const redis_1 = require("../../config/redis");
const CACHE_TTL_1 = __importDefault(require("../../config/CACHE_TTL"));
async function getAllUsers() {
    const cacheKey = 'users:all';
    try {
        const cachedUsers = await redis_1.redisClient.get(cacheKey);
        if (cachedUsers) {
            return cachedUsers;
        }
    }
    catch (error) {
        console.warn('Redis cache miss, falling back to database');
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
      ORDER BY popularity_score DESC
    `);
    const users = result.rows;
    // Cache the result
    try {
        await redis_1.redisClient.set(cacheKey, users, CACHE_TTL_1.default);
    }
    catch (error) {
        console.warn('Failed to cache users');
    }
    return users;
}
exports.default = getAllUsers;
