import IORedis from 'ioredis';
import { config } from './env';

let redisClient: IORedis | null = null;

export function getRedisClient(): IORedis {
  if (!redisClient) {
    redisClient = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: null,
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });
  }
  return redisClient;
}

export function createRedisConnection(): IORedis {
  return new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
  });
}
