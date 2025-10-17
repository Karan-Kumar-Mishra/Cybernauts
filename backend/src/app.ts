import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { initializeDatabase, pool } from './config/database'; // Add pool import
import { redisClient } from './config/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database and Redis
const initializeApp = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);

// Health check with database and Redis status
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    const dbStatus = 'connected';

    // Check Redis connection
    const redisStatus = redisClient.isReady() ? 'connected' : 'disconnected';

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      redis: redisStatus
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      redis: redisClient.isReady() ? 'connected' : 'disconnected'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisClient.disconnect();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisClient.disconnect();
  await pool.end();
  process.exit(0);
});

export default app;