import pool from "../../config/pool";
import { CreateUserRequest } from "../../types";
import { User } from "../../types";
import invalidateUserCache from "../Cache/invalidateUserCache";

async function createUser(userData: CreateUserRequest): Promise<User> {
    const { username, age, hobbies } = userData;
    const result = await pool.query(`
      INSERT INTO users (username, age, hobbies, popularity_score)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id,
        username,
        age,
        hobbies,
        created_at as "createdAt",
        popularity_score as "popularityScore"
    `, [username, age, hobbies || [], 0]);

    const newUser = {
      ...result.rows[0],
      friends: []
    };

    // Invalidate cache
    await invalidateUserCache();

    return newUser;
  }
  export default createUser;