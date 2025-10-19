import pool from "../config/pool";
async function testDatabaseConnection(): Promise<void> {
    try {
        console.log(' Testing database connection...');

       
        const connectionTest = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Database connection test passed:', connectionTest.rows[0].current_time);

     
        const usersTest = await pool.query('SELECT COUNT(*) as user_count FROM users');
        console.log(`✅ Users table test passed: ${usersTest.rows[0].user_count} users`);

      
        const relationshipsTest = await pool.query('SELECT COUNT(*) as relationship_count FROM relationships');
        console.log(` Relationships table test passed: ${relationshipsTest.rows[0].relationship_count} relationships`);

    } catch (error) {
        console.error(' Database connection test failed:', error);
        throw error;
    }
}
export default testDatabaseConnection;