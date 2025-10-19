import cluster from 'cluster';
import os from 'os';
import { initializeDatabase } from './config/database';
import { redisClient } from './config/redis';
import app from './app';
import dotenv from "dotenv";

const numCPUs = os.cpus().length;
dotenv.config();
function startCluster() {
  if (cluster.isPrimary) {
  for (let i = 0; i < Math.min(numCPUs, 4); i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); 
  });
} else {
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
  
}
export default startCluster;

