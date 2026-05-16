import { PrismaClient, UserRole, TaskStatus, TaskPriority } from '@prisma/client/index';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../src/lib/auth';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- High-Fidelity Seeding Started ---');

    // 1. Users
    // CEO (dashboard) and Admin (admin dashboard) — requested credentials
    const ceoPassword = await hashPassword('ceo@1234');
    const ceo = await prisma.user.upsert({
        where: { email: 'ceo@revoticai.com' },
        update: { passwordHash: ceoPassword, name: 'Sayab', role: UserRole.CEO },
        create: {
            email: 'ceo@revoticai.com',
            name: 'Sayab',
            passwordHash: ceoPassword,
            role: UserRole.CEO,
        },
    });

    const adminPassword = await hashPassword('admin@123');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@revoticai.com' },
        update: { passwordHash: adminPassword },
        create: {
            email: 'admin@revoticai.com',
            name: 'Administrator',
            passwordHash: adminPassword,
            role: UserRole.ADMIN,
        },
    });

    // Legacy seed user (keep for existing data)
    const adminLegacyPassword = await hashPassword('admin');
    await prisma.user.upsert({
        where: { email: 'admin@workflow.com' },
        update: { passwordHash: adminLegacyPassword },
        create: {
            email: 'admin@workflow.com',
            name: 'Administrator (Legacy)',
            passwordHash: adminLegacyPassword,
            role: UserRole.ADMIN,
        },
    });

    const pmPassword = await hashPassword('pm_password_123');
    const pm = await prisma.user.upsert({
        where: { email: 'pm@workflow.com' },
        update: { passwordHash: pmPassword },
        create: {
            email: 'pm@workflow.com',
            name: 'Sarah Smith (Project Manager)',
            passwordHash: pmPassword,
            role: UserRole.PROJECT_MANAGER,
        },
    });

    const devPassword = await hashPassword('dev_password_123');
    const developer = await prisma.user.upsert({
        where: { email: 'dev@workflow.com' },
        update: { passwordHash: devPassword },
        create: {
            email: 'dev@workflow.com',
            name: 'Alex Johnson (Lead Developer)',
            passwordHash: devPassword,
            role: UserRole.TEAM_MEMBER,
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

    // 6. Teams Data
    const tenant = await prisma.tenant.upsert({
        where: { id: 'default-tenant' },
        update: {},
        create: {
            id: 'default-tenant',
            name: 'Default Tenant',
            domain: 'localhost',
        },
    });

    // Create teams
    const productTeam = await prisma.team.create({
        data: {
            name: 'Product Development',
            description: 'Core product development team',
            slug: 'product-dev',
            tenantId: tenant.id,
        },
    });

    const designTeam = await prisma.team.create({
        data: {
            name: 'Design Team',
            description: 'UI/UX and design systems',
            slug: 'design',
            tenantId: tenant.id,
        },
    });

    const engineeringTeam = await prisma.team.create({
        data: {
            name: 'Engineering',
            description: 'Backend and infrastructure',
            slug: 'engineering',
            tenantId: tenant.id,
        },
    });

    // Add members to teams
    await prisma.teamMember.createMany({
        data: [
            { teamId: productTeam.id, userId: admin.id, role: 'ADMIN' },
            { teamId: productTeam.id, userId: pm.id, role: 'MANAGER' },
            { teamId: productTeam.id, userId: developer.id, role: 'MEMBER' },
            { teamId: designTeam.id, userId: admin.id, role: 'ADMIN' },
            { teamId: designTeam.id, userId: developer.id, role: 'MEMBER' },
            { teamId: engineeringTeam.id, userId: pm.id, role: 'ADMIN' },
            { teamId: engineeringTeam.id, userId: developer.id, role: 'MEMBER' },
        ],
    });

    // Create spaces for product team
    const backlogSpace = await prisma.teamSpace.create({
        data: {
            name: 'Backlog',
            icon: '📋',
            color: '#6366f1',
            teamId: productTeam.id,
        },
    });

    const sprintSpace = await prisma.teamSpace.create({
        data: {
            name: 'Current Sprint',
            icon: '🚀',
            color: '#10b981',
            teamId: productTeam.id,
        },
    });

    const reviewSpace = await prisma.teamSpace.create({
        data: {
            name: 'In Review',
            icon: '👀',
            color: '#f59e0b',
            teamId: productTeam.id,
        },
    });

    // Create lists within spaces
    await prisma.teamList.createMany({
        data: [
            { name: 'To Do', type: 'TASKS', spaceId: backlogSpace.id },
            { name: 'In Progress', type: 'TASKS', spaceId: sprintSpace.id },
            { name: 'Done', type: 'TASKS', spaceId: sprintSpace.id },
            { name: 'Design Assets', type: 'ASSETS', spaceId: reviewSpace.id },
        ],
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
