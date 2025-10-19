import { redisClient } from '../../config/redis';

export async function deleteUser(userId: string) {
  try {
    await redisClient.del(`user:${userId}`);
  } catch (error:any) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}