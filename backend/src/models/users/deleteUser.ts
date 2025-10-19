import pool from "../../config/pool";

import invalidateUserCache from "../Cache/invalidateUserCache";
import { redisClient } from "../../config/redis";
async function deleteUser(id: string): Promise<boolean> {
    // Check if user has relationships
    const relationshipsResult = await pool.query(
      'SELECT COUNT(*) FROM relationships WHERE user_id = $1 OR friend_id = $1',
      [id]
    );

    const relationshipCount = parseInt(relationshipsResult.rows[0].count);
    if (relationshipCount > 0) {
      throw new Error('Cannot delete user with active relationships');
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    const deleted = result.rows.length > 0;

    if (deleted) {
      // Invalidate cache
      await invalidateUserCache();
      await redisClient.del(`user:${id}`);
    }

    return deleted;
  }
  export default deleteUser;