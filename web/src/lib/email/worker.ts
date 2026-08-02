import { Worker, Job } from 'bullmq';
import redis from '../redis';
import { emailService } from './service';
import { EmailOptions } from './types';

const QUEUE_NAME = 'email-queue';
const REDIS_ENABLED = Boolean(process.env.REDIS_URL);

let emailWorker: Worker | null = null;

export const startEmailWorker = () => {
  if (!REDIS_ENABLED) return;
  if (emailWorker) return;

  emailWorker = new Worker(
    QUEUE_NAME,
    async (job: Job<EmailOptions>) => {
      console.log(`[Email Worker] Processing job ${job.id} for ${job.data.to}`);
      
      const response = await emailService.processEmail(job.data);
      
      if (!response.success) {
        // Throwing an error will cause BullMQ to retry the job based on the backoff settings
        throw new Error(response.error as string);
      }
      
      return response;
    },
    { 
      connection: redis,
      concurrency: 5 // Process up to 5 emails concurrently
    }
  );

  emailWorker.on('completed', (job) => {
    console.log(`[Email Worker] Job ${job.id} completed successfully`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`[Email Worker] Job ${job?.id} failed with error: ${err.message}`);
  });
};
