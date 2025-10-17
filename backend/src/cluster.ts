import cluster from 'cluster';
import os from 'os';
import { initializeDatabase } from './config/database';
import { redisClient } from './config/redis';
import app from './app';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < Math.min(numCPUs, 4); i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Replace the dead worker
  });
} else {
  // Workers can share any TCP connection
  const initializeWorker = async () => {
    try {
      await initializeDatabase();
      await redisClient.connect();
      
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
      });
    } catch (error) {
      console.error(`Worker ${process.pid} failed to start:`, error);
      process.exit(1);
    }
  };

  initializeWorker();
}