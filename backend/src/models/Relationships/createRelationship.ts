
import getUserById from "../users/getUserById";
import pool from "../../config/pool";
import { redisClient } from "../../config/redis";
import updatePopularityScore from "../Popularity/updatePopularityScore";
import invalidateGraphCache from "../Cache/invalidateGraphCache";

async function createRelationship(userId: string, friendId: string): Promise<void> {
    if (userId === friendId) {
      throw new Error('Cannot create relationship with self');
    }


    const [user, friend] = await Promise.all([
      getUserById(userId),
      getUserById(friendId)
    ]);

    if (!user || !friend) {
      throw new Error('User not found');
    }

 

    const existingRelationship = await pool.query(`
    SELECT id FROM relationships 
    WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
  `, [userId, friendId]);

  
    if (existingRelationship.rows.length > 0) {
      throw new Error('Relationship already exists');
    }

    await pool.query('BEGIN');
    try {
    
      const result1 = await pool.query(
        'INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2) RETURNING id',
        [userId, friendId]
      );
  
      const result2 = await pool.query(
        'INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2) RETURNING id',
        [friendId, userId]
      );
   
      await pool.query('COMMIT');
      console.log(`🎉 Successfully created bidirectional relationship between ${user.username} and ${friend.username}`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(' Failed to create relationship:', error);
      throw error;
    }


    await updatePopularityScore(userId);
    await updatePopularityScore(friendId);


    await invalidateGraphCache();
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`user:${friendId}`);
  }
  export default createRelationship;