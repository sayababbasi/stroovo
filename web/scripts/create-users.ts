import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
    const users = [
        { email: 'ceo@revoticai.com', name: 'Sayab', enumRole: UserRole.CEO, systemRoleName: 'CEO', pwd: 'ceo_password_123' },
        { email: 'cto@revoticai.com', name: 'Hasaan', enumRole: UserRole.EXECUTIVE, systemRoleName: 'CTO', pwd: 'cto_password_123' },
        { email: 'manager@revoticai.com', name: 'Asad', enumRole: UserRole.PROJECT_MANAGER, systemRoleName: 'Manager', pwd: 'manager_password_123' }
    ];

    for (const u of users) {
        // Look up the system role for this user
        const systemRole = await prisma.role.findFirst({
            where: { name: { equals: u.systemRoleName, mode: 'insensitive' } }
        });

        const hash = await hashPassword(u.pwd);
        
        await prisma.user.upsert({
            where: { email: u.email },
            update: { 
                name: u.name, 
                role: u.enumRole, 
                passwordHash: hash,
                roleId: systemRole?.id || null 
            },
            create: { 
                email: u.email, 
                name: u.name, 
                role: u.enumRole, 
                passwordHash: hash,
                roleId: systemRole?.id || null 
            }
        });
        console.log('Created/Updated', u.email, 'with enumRole', u.enumRole, 'and systemRole', systemRole?.name || 'none');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
