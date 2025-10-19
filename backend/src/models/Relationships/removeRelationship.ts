import pool from "../../config/pool";
import { redisClient } from "../../config/redis";
import invalidateUserCache from "../Cache/invalidateUserCache";
import updatePopularityScore from "../Popularity/updatePopularityScore";
async function removeRelationship(userId: string, friendId: string): Promise<void> {
    await pool.query('BEGIN');
    try {
        await pool.query(
            'DELETE FROM relationships WHERE user_id = $1 AND friend_id = $2',
            [userId, friendId]
        );
        await pool.query(
            'DELETE FROM relationships WHERE user_id = $1 AND friend_id = $2',
            [friendId, userId]
        );
        await pool.query('COMMIT');
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }


    await updatePopularityScore(userId);
    await updatePopularityScore(friendId);


    await invalidateUserCache();
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`user:${friendId}`);
}
export default removeRelationship;