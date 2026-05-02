const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log('Cleaning up users...');
        await prisma.user.deleteMany({});
        console.log('All users deleted.');
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
