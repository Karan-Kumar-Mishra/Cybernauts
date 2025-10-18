import pool from "../../config/pool";
import { CreateUserRequest } from "../../types";
import { User } from "../../types";
import invalidateUserCache from "../Cache/invalidateUserCache";
import { redisClient } from "../../config/redis";

import { UpdateUserRequest } from "../../types";
import getUserById from "./getUserById";

async function updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    const { username, age, hobbies } = updates;
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (username !== undefined) {
      setClauses.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (age !== undefined) {
      setClauses.push(`age = $${paramCount}`);
      values.push(age);
      paramCount++;
    }

    if (hobbies !== undefined) {
      setClauses.push(`hobbies = $${paramCount}`);
      values.push(hobbies);
      paramCount++;
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    if (setClauses.length === 0) {
      return getUserById(id);
    }

    values.push(id);

    const result = await pool.query(`
      UPDATE users 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        username,
        age,
        hobbies,
        created_at as "createdAt",
        popularity_score as "popularityScore"
    `, values);

    const updatedUser = result.rows[0] || null;

    if (updatedUser) {
      // Get friends for the updated user
      const friendsResult = await pool.query(
        'SELECT friend_id FROM relationships WHERE user_id = $1',
        [id]
      );
      updatedUser.friends = friendsResult.rows.map((row: any) => row.friend_id);

      // Invalidate cache
      await invalidateUserCache();
      await redisClient.del(`user:${id}`);
    }

    return updatedUser;
  }
  export default updateUser;