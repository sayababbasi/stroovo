import * as dotenv from 'dotenv';
dotenv.config();

import prisma from './src/lib/prisma';

async function main() {
    try {
        console.log('Fetching all users and roles...');
        const users = await prisma.user.findMany({
            select: {
                email: true,
                role: true
            }
        });
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email}: ${u.role}`);
        });
        await prisma.$disconnect();
    } catch (error: any) {
        console.error('Prisma test failed:', error);
    }
}

main();
