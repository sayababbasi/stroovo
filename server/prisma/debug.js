console.log('Seeding starts...');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});

async function run() {
    console.log('Connecting to:', process.env.DATABASE_URL);
    try {
        await prisma.$connect();
        console.log('Connected');
        await prisma.$disconnect();
        console.log('Disconnected');
    } catch (e) {
        console.error('Connection failed:', e);
    }
}
run();
