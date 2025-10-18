
import getUserById from "../users/getUserById";
import pool from "../../config/pool";
import { redisClient } from "../../config/redis";
import updatePopularityScore from "../Popularity/updatePopularityScore";
import invalidateGraphCache from "../Cache/invalidateGraphCache";

async function createRelationship(userId: string, friendId: string): Promise<void> {
    if (userId === friendId) {
      throw new Error('Cannot create relationship with self');
    }

    // Check if users exist
    const [user, friend] = await Promise.all([
      getUserById(userId),
      getUserById(friendId)
    ]);

    if (!user || !friend) {
      throw new Error('User not found');
    }

    console.log(`🔍 Checking for existing relationships between ${userId} and ${friendId}`);

    // Check if relationship already exists (in either direction)
    const existingRelationship = await pool.query(`
    SELECT id FROM relationships 
    WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
  `, [userId, friendId]);

    console.log(`📋 Existing relationships found: ${existingRelationship.rows.length}`);

    if (existingRelationship.rows.length > 0) {
      throw new Error('Relationship already exists');
    }

    // Create bidirectional relationship
    console.log(`🔄 Creating bidirectional relationship: ${userId} ↔ ${friendId}`);
    await pool.query('BEGIN');
    try {
      // First relationship: user -> friend
      const result1 = await pool.query(
        'INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2) RETURNING id',
        [userId, friendId]
      );
      console.log(`✅ Created relationship 1: ${userId} → ${friendId}, ID: ${result1.rows[0].id}`);

      // Second relationship: friend -> user (bidirectional)
      const result2 = await pool.query(
        'INSERT INTO relationships (user_id, friend_id) VALUES ($1, $2) RETURNING id',
        [friendId, userId]
      );
      console.log(`✅ Created relationship 2: ${friendId} → ${userId}, ID: ${result2.rows[0].id}`);

      await pool.query('COMMIT');
      console.log(`🎉 Successfully created bidirectional relationship between ${user.username} and ${friend.username}`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('❌ Failed to create relationship:', error);
      throw error;
    }

    // Update popularity scores
    await updatePopularityScore(userId);
    await updatePopularityScore(friendId);

    // Invalidate cache
    await invalidateGraphCache();
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`user:${friendId}`);
  }
  export default createRelationship;