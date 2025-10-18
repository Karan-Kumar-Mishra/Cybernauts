import pool from "../../config/pool";
import invalidateUserCache from "../Cache/invalidateUserCache";
async function removeHobby(name: string): Promise<void> {
    await pool.query('DELETE FROM hobbies WHERE name = $1', [name]);
    await invalidateUserCache();
}
export default removeHobby;