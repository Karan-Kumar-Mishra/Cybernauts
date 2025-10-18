import pool from "../../config/pool";
async function getAllHobbies(): Promise<string[]> {
    const result = await pool.query('SELECT name FROM hobbies ORDER BY name');
    return result.rows.map((row: any) => row.name);
}
export default getAllHobbies;