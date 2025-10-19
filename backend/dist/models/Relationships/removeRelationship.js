"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
const redis_1 = require("../../config/redis");
const invalidateUserCache_1 = __importDefault(require("../Cache/invalidateUserCache"));
const updatePopularityScore_1 = __importDefault(require("../Popularity/updatePopularityScore"));
async function removeRelationship(userId, friendId) {
    await pool_1.default.query('BEGIN');
    try {
        await pool_1.default.query('DELETE FROM relationships WHERE user_id = $1 AND friend_id = $2', [userId, friendId]);
        await pool_1.default.query('DELETE FROM relationships WHERE user_id = $1 AND friend_id = $2', [friendId, userId]);
        await pool_1.default.query('COMMIT');
    }
    catch (error) {
        await pool_1.default.query('ROLLBACK');
        throw error;
    }
    await (0, updatePopularityScore_1.default)(userId);
    await (0, updatePopularityScore_1.default)(friendId);
    await (0, invalidateUserCache_1.default)();
    await redis_1.redisClient.del(`user:${userId}`);
    await redis_1.redisClient.del(`user:${friendId}`);
}
exports.default = removeRelationship;
