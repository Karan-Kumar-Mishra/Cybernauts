import { redisClient } from "../../config/redis";
async function invalidateUserCache(): Promise<void> {
    const cacheKeys = ['users:all', 'graph:data'];

    for (const key of cacheKeys) {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.warn(`Failed to invalidate cache key: ${key}`);
        }
    }
}
export default invalidateUserCache;