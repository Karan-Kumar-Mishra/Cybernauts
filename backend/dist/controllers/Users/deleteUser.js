"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = deleteUser;
const redis_1 = require("../../config/redis");
async function deleteUser(userId) {
    try {
        await redis_1.redisClient.del(`user:${userId}`);
    }
    catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
}
