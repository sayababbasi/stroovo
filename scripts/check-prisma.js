const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
  if (prisma.automation) {
    console.log('SUCCESS: automation model found');
  } else {
    console.log('FAILURE: automation model NOT found');
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
