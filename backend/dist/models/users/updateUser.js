"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
const invalidateUserCache_1 = __importDefault(require("../Cache/invalidateUserCache"));
const redis_1 = require("../../config/redis");
const getUserById_1 = __importDefault(require("./getUserById"));
async function updateUser(id, updates) {
    const { username, age, hobbies } = updates;
    const setClauses = [];
    const values = [];
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
        return (0, getUserById_1.default)(id);
    }
    values.push(id);
    const result = await pool_1.default.query(`
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
        const friendsResult = await pool_1.default.query('SELECT friend_id FROM relationships WHERE user_id = $1', [id]);
        updatedUser.friends = friendsResult.rows.map((row) => row.friend_id);
        // Invalidate cache
        await (0, invalidateUserCache_1.default)();
        await redis_1.redisClient.del(`user:${id}`);
    }
    return updatedUser;
}
exports.default = updateUser;
