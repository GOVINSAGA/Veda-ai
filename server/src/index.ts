import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import { initWebSocket } from './websocket';
import { startWorker } from './jobs/worker';
import assignmentRoutes from './routes/assignment.routes';

async function main() {
  // Connect to MongoDB
  await connectDatabase();

  // Initialize Redis
  getRedisClient();

  // Initialize WebSocket server
  initWebSocket();

  // Start BullMQ worker
  startWorker();

  // Create Express app
  const app = express();

  // Middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Routes
  app.use('/api/assignments', assignmentRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Start server
  app.listen(config.port, () => {
    console.log(`🚀 VedaAI Server running on port ${config.port}`);
    console.log(`📡 WebSocket server on port ${config.wsPort}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
