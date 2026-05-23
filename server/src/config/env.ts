import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  wsPort: parseInt(process.env.WS_PORT || '5001', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
};
