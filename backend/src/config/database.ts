import pool from './pool';

export const initializeDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    
    console.log('Testing database connection with SSL...');

    // Test connection first
    const result = await client.query('SELECT NOW()');
    console.log('Database connection successful at:', result.rows[0].now);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
        hobbies TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        popularity_score DECIMAL(10,2) DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Relationships table (for friendships)
    await client.query(`
      CREATE TABLE IF NOT EXISTS relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id),
        CHECK (user_id != friend_id)
      )
    `);

    // Hobbies table (for global hobby list)
    await client.query(`
      CREATE TABLE IF NOT EXISTS hobbies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_relationships_user_id ON relationships(user_id);
      CREATE INDEX IF NOT EXISTS idx_relationships_friend_id ON relationships(friend_id);
      CREATE INDEX IF NOT EXISTS idx_users_popularity ON users(popularity_score);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    console.log('Database tables and indexes created successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};