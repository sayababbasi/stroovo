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
        console.log('Seeding Default Users with Adapter...');
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 12);

        const users = [
            {
                name: 'Sayab (CEO)',
                email: 'ceo@stroovo.com',
                password: hashedPassword,
                role: 'CEO',
                department: 'Executive',
                designation: 'Chief Executive Officer'
            },
            {
                name: 'Admin User',
                email: 'admin@stroovo.com',
                password: hashedPassword,
                role: 'ADMIN',
                department: 'Operations',
                designation: 'System Administrator'
            },
            {
                name: 'Manager User',
                email: 'manager@stroovo.com',
                password: hashedPassword,
                role: 'PROJECT_MANAGER',
                department: 'Engineering',
                designation: 'Project Manager'
            },
            {
                name: 'Member User',
                email: 'member@stroovo.com',
                password: hashedPassword,
                role: 'TEAM_MEMBER',
                department: 'Design',
                designation: 'Product Designer'
            }
        ];

        for (const u of users) {
            await prisma.user.upsert({
                where: { email: u.email },
                update: {
                    name: u.name,
                    role: u.role,
                    department: u.department,
                    designation: u.designation
                },
                create: {
                    name: u.name,
                    email: u.email,
                    passwordHash: u.password,
                    role: u.role,
                    department: u.department,
                    designation: u.designation,
                    isActive: true,
                    isEmailVerified: true
                }
            });
        }

        console.log('Default users created successfully');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
