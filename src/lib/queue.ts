import { Queue } from 'bullmq';
import redis from './redis';
import { startWorker } from './worker';

const QUEUE_NAME = 'stroovo-tasks';
const REDIS_ENABLED = Boolean(process.env.REDIS_URL);

let workerStarted = false;
let queueDisabledLogged = false;

export const taskQueue = REDIS_ENABLED
  ? new Queue(QUEUE_NAME, {
      connection: redis,
    })
  : null;

export const addJob = async (name: string, data: any) => {
  if (!taskQueue) {
    if (!queueDisabledLogged && process.env.NODE_ENV === 'development') {
      console.warn('Queue disabled: REDIS_URL is not configured. Background jobs are skipped.');
      queueDisabledLogged = true;
    }
    return null;
  }

  if (!workerStarted && process.env.NODE_ENV === 'development') {
    startWorker();
    workerStarted = true;
  }

  try {
    return await taskQueue.add(name, data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'development') {
      console.error('Failed to enqueue job:', error);
    }
    return null;
  }
};

export { startWorker };
