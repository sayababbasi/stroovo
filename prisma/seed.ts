import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../backend/src/lib/auth';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- High-Fidelity Seeding Started ---');

    // 1. Users
    // CEO (dashboard) and Admin (admin dashboard) — requested credentials
    const ceoPassword = await hashPassword('ceo@1234');
    const ceo = await prisma.user.upsert({
        where: { email: 'ceo@revoticai.com' },
        update: { password: ceoPassword, name: 'Sayab' },
        create: {
            email: 'ceo@revoticai.com',
            name: 'Sayab',
            password: ceoPassword,
            role: Role.ADMIN,
        },
    });

    const adminPassword = await hashPassword('admin@123');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@revoticai.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@revoticai.com',
            name: 'Administrator',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });

    // Legacy seed user (keep for existing data)
    const adminLegacyPassword = await hashPassword('admin');
    await prisma.user.upsert({
        where: { email: 'admin@workflow.com' },
        update: { password: adminLegacyPassword },
        create: {
            email: 'admin@workflow.com',
            name: 'Administrator (Legacy)',
            password: adminLegacyPassword,
            role: Role.ADMIN,
        },
    });

    const pmPassword = await hashPassword('pm_password_123');
    const pm = await prisma.user.upsert({
        where: { email: 'pm@workflow.com' },
        update: { password: pmPassword },
        create: {
            email: 'pm@workflow.com',
            name: 'Sarah Smith (Project Manager)',
            password: pmPassword,
            role: Role.PROJECT_MANAGER,
        },
    });

    const devPassword = await hashPassword('dev_password_123');
    const developer = await prisma.user.upsert({
        where: { email: 'dev@workflow.com' },
        update: { password: devPassword },
        create: {
            email: 'dev@workflow.com',
            name: 'Alex Johnson (Lead Developer)',
            password: devPassword,
            role: Role.TEAM_MEMBER,
        },
    });

    // 2. Strategic Goal (OKR)
    const marketGoal = await prisma.goal.create({
        data: {
            title: 'Dominance: SaaS Market 2026',
            description: 'Acquire 500+ enterprise clients across APAC and EU.',
            status: 'ON TRACK',
            progress: 35,
            targetDate: new Date('2026-12-31'),
            ownerId: admin.id,
        }
    });

    // 3. Projects under Goal
    const projectX = await prisma.project.create({
        data: {
            name: 'Quantum UI Overhaul',
            description: 'Redesigning the entire core experience for enterprise scale.',
            managerId: pm.id,
            goalId: marketGoal.id,
            startDate: new Date('2026-01-01'),
            status: 'ACTIVE',
        }
    });

    const cloudMigration = await prisma.project.create({
        data: {
            name: 'Edge Cloud Migration',
            description: 'Move all legacy infrastructure to global edge nodes for < 50ms latency.',
            managerId: pm.id,
            goalId: marketGoal.id,
            startDate: new Date('2026-02-15'),
            status: 'PLANNING',
        }
    });

    // 4. Tasks (Normal + Hierarchical)
    const parentTask = await prisma.task.create({
        data: {
            title: 'Design Language - Core tokens',
            description: 'Define typography, color variables, and spacing guides.',
            status: TaskStatus.DONE,
            priority: TaskPriority.HIGH,
            type: 'DESIGN',
            progress: 100,
            projectId: projectX.id,
            assigneeId: admin.id,
        }
    });

    const mainDevTask = await prisma.task.create({
        data: {
            title: 'Component Library Implementation',
            description: 'Build the React components using the new design language.',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.URGENT,
            type: 'STORY',
            progress: 45,
            projectId: projectX.id,
            assigneeId: developer.id,
        }
    });

    // Sub-tasks for Component Library
    await prisma.task.createMany({
        data: [
            {
                title: 'Build DataGrid w/ Inline Edit',
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.HIGH,
                type: 'FEATURE',
                projectId: projectX.id,
                assigneeId: developer.id,
                parentId: mainDevTask.id,
                progress: 20
            },
            {
                title: 'Timeline View (Gantt) Component',
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                type: 'FEATURE',
                projectId: projectX.id,
                parentId: mainDevTask.id,
            },
            {
                title: 'Accessibility Audit (v1)',
                status: TaskStatus.BACKLOG,
                priority: TaskPriority.LOW,
                type: 'TASK',
                projectId: projectX.id,
                parentId: mainDevTask.id,
            }
        ]
    });

    // 5. Blocked Task for demonstration
    await prisma.task.create({
        data: {
            title: 'API Integration: CRM Sync',
            description: 'Wait for the CRM team to provide final OAuth scopes.',
            status: TaskStatus.BLOCKED,
            priority: TaskPriority.URGENT,
            type: 'BUG',
            projectId: projectX.id,
            assigneeId: pm.id,
        }
    });

    console.log('--- Seeding Finished Successfully ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
