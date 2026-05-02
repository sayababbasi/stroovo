const Redis = require('ioredis');
require('dotenv').config();

async function main() {
  const redis = new Redis(process.env.REDIS_URL);
  
  // Clear all project related keys
  const keys = await redis.keys('projects:*');
  console.log(`Found ${keys.length} cache keys to delete:`, keys);
  
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log('Project cache cleared.');
  }

  await redis.quit();
}

main().catch(console.error);
