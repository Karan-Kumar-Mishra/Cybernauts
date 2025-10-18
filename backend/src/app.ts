import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/userRoutes';
import { redisClient } from './config/redis';
import pool from './config/pool';
import startCluster from './cluster';


const app = express();

startCluster();

app.use(helmet());
app.use(cors());
app.use(express.json());


app.use('/api', userRoutes);

app.get('/health', async (req, res) => {
  try {

    await pool.query('SELECT 1');
    const dbStatus = 'connected';
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


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});




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