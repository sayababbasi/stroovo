import { Queue } from 'bullmq';
import redis from '../redis';
import { EmailOptions } from './types';

const QUEUE_NAME = 'email-queue';
const REDIS_ENABLED = Boolean(process.env.REDIS_URL);

// Initialize the queue if Redis is configured
export const emailQueue = REDIS_ENABLED
  ? new Queue<EmailOptions>(QUEUE_NAME, {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    })
  : null;
