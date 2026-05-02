import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 200, 5000)
});

redis.on('error', (err) => {
  // Silent in dev to avoid log spam if Redis is unconfigured
  if (process.env.NODE_ENV !== 'development') {
    console.error('Redis error:', err);
  }
});

export default redis;
