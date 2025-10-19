"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../../config/redis");
async function invalidateUserCache() {
    const cacheKeys = ['users:all', 'graph:data'];
    for (const key of cacheKeys) {
        try {
            await redis_1.redisClient.del(key);
        }
        catch (error) {
            console.warn(`Failed to invalidate cache key: ${key}`);
        }
    }
}
exports.default = invalidateUserCache;
