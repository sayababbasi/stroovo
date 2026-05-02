import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting RBAC Seed...');
        
        const permissions = [
            // USERS
            { module: 'USERS', action: 'READ', key: 'users.read', description: 'View user list and profiles' },
            { module: 'USERS', action: 'CREATE', key: 'users.create', description: 'Invite new users' },
            { module: 'USERS', action: 'UPDATE', key: 'users.update', description: 'Edit user details' },
            { module: 'USERS', action: 'DELETE', key: 'users.delete', description: 'Suspend or remove users' },
            
            // TASKS
            { module: 'TASKS', action: 'READ', key: 'tasks.read', description: 'View tasks' },
            { module: 'TASKS', action: 'CREATE', key: 'tasks.create', description: 'Create new tasks' },
            { module: 'TASKS', action: 'UPDATE', key: 'tasks.update', description: 'Edit existing tasks' },
            { module: 'TASKS', action: 'DELETE', key: 'tasks.delete', description: 'Remove tasks' },
            { module: 'TASKS', action: 'EXECUTE', key: 'tasks.assign', description: 'Assign tasks to team members' },

            // TEAMS
            { module: 'TEAMS', action: 'READ', key: 'teams.read', description: 'View teams' },
            { module: 'TEAMS', action: 'UPDATE', key: 'teams.manage', description: 'Manage team settings and members' },

            // AI
            { module: 'AI', action: 'EXECUTE', key: 'ai.use', description: 'Use AI assistant features' },
            { module: 'AI', action: 'EXECUTE', key: 'ai.auto_execute', description: 'Allow AI to run autonomous tasks' },

            // ADMIN
            { module: 'ADMIN', action: 'READ', key: 'admin.access', description: 'Access admin dashboard' },
            { module: 'ADMIN', action: 'UPDATE', key: 'admin.settings', description: 'Change system-wide settings' },

            // ANALYTICS
            { module: 'ANALYTICS', action: 'READ', key: 'analytics.view', description: 'View performance analytics' },
        ];

        // 1. Seed Permissions
        for (const p of permissions) {
            await prisma.permission.upsert({
                where: { key: p.key },
                update: p,
                create: p
            });
        }

        // 2. Seed System Roles
        const systemRoles = [
            { name: 'Admin', description: 'Full system access', isSystem: true },
            { name: 'Manager', description: 'Project and team management', isSystem: true },
            { name: 'Team Lead', description: 'Task assignment and monitoring', isSystem: true },
            { name: 'Member', description: 'Basic workspace access', isSystem: true },
        ];

        for (const r of systemRoles) {
            await prisma.role.upsert({
                where: { name: r.name },
                update: { description: r.description },
                create: r
            });
        }

        // 3. Assign All Permissions to Admin
        const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
        const allPermissions = await prisma.permission.findMany();
        
        if (adminRole) {
            await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
            await prisma.rolePermission.createMany({
                data: allPermissions.map(p => ({
                    roleId: adminRole.id,
                    permissionId: p.id
                }))
            });
        }

        console.log('Seed Successful');
    } catch (error) {
        console.error('Seed Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
