import pool from "../../config/pool";
import { CreateUserRequest } from "../../types";
import { User } from "../../types";
import invalidateUserCache from "../Cache/invalidateUserCache";
import { redisClient } from "../../config/redis";
import CACHE_TTL from "../../config/CACHE_TTL";
async function getFriends(userId: string): Promise<string[]> {
    const result = await pool.query(
        'SELECT friend_id FROM relationships WHERE user_id = $1',
        [userId]
    );
    return result.rows.map((row: any) => row.friend_id);
}
export default getFriends;