import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
console.log('Prisma Lib: Initializing with DATABASE_URL:', connectionString ? 'DEFINED' : 'UNDEFINED');

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });

console.log('Prisma Lib: PrismaClient instance created');

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
