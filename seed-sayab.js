const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log('Ensuring Stroovo HQ Tenant exists...');
        const tenant = await prisma.tenant.upsert({
            where: { id: 'stroovo-hq' },
            update: {},
            create: {
                id: 'stroovo-hq',
                name: 'Stroovo HQ',
                domain: 'hq.stroovo.com'
            }
        });

        const hashedPassword = await bcrypt.hash('password123', 12);
        
        const users = [
            { email: 'sayab@stroovo.com', name: 'Sayab', role: 'CEO', designation: 'CEO', department: 'Executive' },
            { email: 'ceo@stroovo.com', name: 'CEO User', role: 'CEO', designation: 'CEO', department: 'Executive' },
            { email: 'admin@stroovo.com', name: 'Admin', role: 'ADMIN', designation: 'Administrator', department: 'IT' },
            { email: 'manager@stroovo.com', name: 'Manager', role: 'PROJECT_MANAGER', designation: 'Project Manager', department: 'Engineering' },
            { email: 'member@stroovo.com', name: 'Member', role: 'TEAM_MEMBER', designation: 'Software Engineer', department: 'Engineering' }
        ];

        console.log('Seeding users with Tenant ID...');
        for (const u of users) {
            await prisma.user.upsert({
                where: { email: u.email },
                update: {
                    tenantId: tenant.id,
                    role: u.role,
                    name: u.name,
                    designation: u.designation,
                    department: u.department
                },
                create: {
                    email: u.email,
                    name: u.name,
                    passwordHash: hashedPassword,
                    role: u.role,
                    tenantId: tenant.id,
                    designation: u.designation,
                    department: u.department,
                    isActive: true,
                    isEmailVerified: true
                }
            });
        }

        console.log('Seed with Tenant Complete');
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
