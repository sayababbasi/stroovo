import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function verify() {
    console.log('--- DB Verification Start ---');
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@workflow.com' }
        });

        if (!user) {
            console.log('ERROR: User admin@workflow.com not found in database.');
            return;
        }

        console.log('User found:', user.email);
        console.log('Stored Hash:', user.password);

        const isMatch = await bcrypt.compare('admin', user.password);
        console.log('Password "admin" match test:', isMatch ? 'SUCCESS' : 'FAILED');

        // Test if a fresh hash matches
        const freshHash = await bcrypt.hash('admin', 10);
        const testMatch = await bcrypt.compare('admin', freshHash);
        console.log('Fresh bcrypt hash match test:', testMatch ? 'SUCCESS' : 'FAILED');

    } catch (error) {
        console.error('Verification error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
