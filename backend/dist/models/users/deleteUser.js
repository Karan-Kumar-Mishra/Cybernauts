"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
const invalidateUserCache_1 = __importDefault(require("../Cache/invalidateUserCache"));
const redis_1 = require("../../config/redis");
async function deleteUser(id) {
    // Check if user has relationships
    const relationshipsResult = await pool_1.default.query('SELECT COUNT(*) FROM relationships WHERE user_id = $1 OR friend_id = $1', [id]);
    const relationshipCount = parseInt(relationshipsResult.rows[0].count);
    if (relationshipCount > 0) {
        throw new Error('Cannot delete user with active relationships');
    }
    const result = await pool_1.default.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    const deleted = result.rows.length > 0;
    if (deleted) {
        // Invalidate cache
        await (0, invalidateUserCache_1.default)();
        await redis_1.redisClient.del(`user:${id}`);
    }
    return deleted;
}
exports.default = deleteUser;
