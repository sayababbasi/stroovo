import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
    const hash = await hashPassword('ceo@1234');
    
    await prisma.user.update({
        where: { email: 'ceo@revoticai.com' },
        data: { 
            passwordHash: hash,
        },
    });
    console.log('Password reset successfully for ceo@revoticai.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
