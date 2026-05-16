import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('[PRISMA] DATABASE_URL is missing!');
}

const globalForPrisma = globalThis as unknown as {
  prisma_final: PrismaClient | undefined;
  prismaPool_final: Pool | undefined;
};

const pool =
  globalForPrisma.prismaPool_final ||
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Common setting for Neon when using pg driver in some environments
    }
  });

const adapter = new PrismaPg(pool as any);

export const prisma =
  globalForPrisma.prisma_final ||
  new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma_final = prisma;
  globalForPrisma.prismaPool_final = pool;
}

export default prisma;
