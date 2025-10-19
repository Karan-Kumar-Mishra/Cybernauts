"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../../config/redis");
async function invalidateGraphCache() {
    const cacheKeys = ['graph:data', 'users:all'];
    for (const key of cacheKeys) {
        try {
            if (redis_1.redisClient.isReady()) {
                await redis_1.redisClient.del(key);
                console.log(`Successfully invalidated cache key: ${key}`);
            }
        }
        catch (error) {
            console.warn(`Failed to invalidate cache key: ${key}`, error);
        }
    }
}
exports.default = invalidateGraphCache;
