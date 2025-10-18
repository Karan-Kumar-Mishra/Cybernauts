import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();
const databaseUrl = process.env.DB_URL;
const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
        rejectUnauthorized: false, 
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20,
});
export default pool;
