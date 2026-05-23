import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis';

export const generationQueue = new Queue('question-generation', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 50,
    },
  },
});

console.log('✅ BullMQ queue initialized');
