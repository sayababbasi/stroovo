import redis from './redis';

const CACHE_TTL = 300; // 5 minutes
const REDIS_ENABLED = Boolean(process.env.REDIS_URL);

export const cache = {
    async get<T>(key: string): Promise<T | null> {
        if (!redis || !REDIS_ENABLED) return null;
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            if (process.env.NODE_ENV !== 'development') {
                console.error('Redis Get Error:', error);
            }
            return null;
        }
    },

    async set(key: string, value: any, ttl: number = CACHE_TTL): Promise<void> {
        if (!redis || !REDIS_ENABLED) return;
        try {
            await redis.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (error) {
            if (process.env.NODE_ENV !== 'development') {
                console.error('Redis Set Error:', error);
            }
        }
    },

    async del(key: string): Promise<void> {
        if (!redis || !REDIS_ENABLED) return;
        try {
            await redis.del(key);
        } catch (error) {
            if (process.env.NODE_ENV !== 'development') {
                console.error('Redis Del Error:', error);
            }
        }
    }
};
