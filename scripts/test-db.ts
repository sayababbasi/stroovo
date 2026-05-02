import prisma from '../src/lib/prisma';

async function test() {
    console.log('Testing DB connection...');
    try {
        const count = await prisma.user.count();
        console.log(`Connected successfully. User count: ${count}`);
    } catch (error) {
        console.error('Failed to connect to DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
