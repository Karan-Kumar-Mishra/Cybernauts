import pool from "../../config/pool";
import invalidateUserCache from "../Cache/invalidateUserCache";
async function addHobby(name: string): Promise<void> {
    await pool.query(
        'INSERT INTO hobbies (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [name]
    );

    // Invalidate relevant caches
    await invalidateUserCache();
}
export default addHobby;