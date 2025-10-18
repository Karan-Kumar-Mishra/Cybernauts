import { redisClient } from "../../config/redis";
async function invalidateGraphCache(): Promise<void> {
    const cacheKeys = ['graph:data', 'users:all'];

    console.log('Invalidating graph cache...');

    for (const key of cacheKeys) {
        try {
            if (redisClient.isReady()) {
                await redisClient.del(key);
                console.log(`Successfully invalidated cache key: ${key}`);
            }
        } catch (error) {
            console.warn(`Failed to invalidate cache key: ${key}`, error);
        }
    }
}
export default invalidateGraphCache;