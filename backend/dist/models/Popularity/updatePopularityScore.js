"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const calculatePopularityScore_1 = __importDefault(require("./calculatePopularityScore"));
const redis_1 = require("../../config/redis");
const pool_1 = __importDefault(require("../../config/pool"));
async function updatePopularityScore(userId) {
    try {
        const score = await (0, calculatePopularityScore_1.default)(userId);
        await pool_1.default.query('UPDATE users SET popularity_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [score, userId]);
        await redis_1.redisClient.del(`user:${userId}`);
    }
    catch (error) {
        console.error(`Error updating popularity score for user ${userId}:`, error);
    }
}
exports.default = updatePopularityScore;
