import calculatePopularityScore from "./calculatePopularityScore";
import { redisClient } from "../../config/redis";
import pool from "../../config/pool";
async function updatePopularityScore(userId: string): Promise<void> {
  try {
    const score = await calculatePopularityScore(userId);

    await pool.query(
      'UPDATE users SET popularity_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [score, userId]
    );
    await redisClient.del(`user:${userId}`);
  } catch (error) {
    console.error(`Error updating popularity score for user ${userId}:`, error);
  }
}
export default updatePopularityScore;