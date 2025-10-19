"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUserById_1 = __importDefault(require("../users/getUserById"));
const pool_1 = __importDefault(require("../../config/pool"));
const redis_1 = require("../../config/redis");
const updatePopularityScore_1 = __importDefault(require("../Popularity/updatePopularityScore"));
const invalidateGraphCache_1 = __importDefault(require("../Cache/invalidateGraphCache"));
async function createRelationship(userId, friendId) {
    if (userId === friendId) {
        throw new Error('Cannot create relationship with self');
    }
    const [user, friend] = await Promise.all([
        (0, getUserById_1.default)(userId),
        (0, getUserById_1.default)(friendId)
    ]);
    if (!user || !friend) {
        throw new Error('User not found');
    }
    const existingRelationship = await pool_1.default.query(`
    SELECT id FROM relationships 
    WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
  `, [userId, friendId]);
    if (existingRelationship.rows.length > 0) {
        throw new Error('Relationship already exists');
    }
    await pool_1.default.query('BEGIN');
    try {
        const result1 = await pool_1.default.query('INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2) RETURNING id', [userId, friendId]);
        const result2 = await pool_1.default.query('INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2) RETURNING id', [friendId, userId]);
        await pool_1.default.query('COMMIT');
        console.log(`🎉 Successfully created bidirectional relationship between ${user.username} and ${friend.username}`);
    }
    catch (error) {
        await pool_1.default.query('ROLLBACK');
        console.error(' Failed to create relationship:', error);
        throw error;
    }
    await (0, updatePopularityScore_1.default)(userId);
    await (0, updatePopularityScore_1.default)(friendId);
    await (0, invalidateGraphCache_1.default)();
    await redis_1.redisClient.del(`user:${userId}`);
    await redis_1.redisClient.del(`user:${friendId}`);
}
exports.default = createRelationship;
