import { PrismaClient } from '@prisma/client';
// DB Sync: 2026-04-26-18-53
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('[PRISMA] DATABASE_URL is missing!');
}

const globalForPrisma = globalThis as unknown as {
  prisma2: PrismaClient | undefined;
  prismaPool2: Pool | undefined;
};

const pool =
  globalForPrisma.prismaPool2 ||
  new Pool({
    connectionString,
  });

const adapter = new PrismaPg(pool as any);

export const prisma =
  globalForPrisma.prisma2 ||
  new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma2 = prisma;
  globalForPrisma.prismaPool2 = pool;
}

export default prisma;
