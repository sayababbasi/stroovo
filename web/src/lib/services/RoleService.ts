import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export interface PermissionDefinition {
    module: string;
    action: string;
    key: string;
    description?: string;
}

export class RoleService {
    /**
     * Get all roles with permission count and user count
     */
    static async getAllRoles() {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[RoleService.getAllRoles] Fetching roles for user:', userId);
        
        const roles = await prisma.role.findMany({
            include: {
                _count: {
                    select: {
                        permissions: true,
                        users: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        console.log(`[RoleService.getAllRoles] Found ${roles.length} roles`);
        return roles;
    }

    /**
     * Get role by ID with full permissions
     */
    static async getRoleById(id: string) {
        return prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                },
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    /**
     * Create a new role
     */
    static async createRole(data: { name: string; description?: string }) {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[RoleService.createRole] Creating role:', data.name, 'by user:', userId);
        
        try {
            const role = await prisma.role.create({
                data: {
                    ...data,
                    isSystem: false
                }
            });
            
            console.log('[RoleService.createRole] Role created successfully:', role.id);
            return role;
        } catch (error: any) {
            console.error('[RoleService.createRole] Error creating role:', error);
            throw error;
        }
    }

    /**
     * Update role
     */
    static async updateRole(id: string, data: { name?: string; description?: string }) {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[RoleService.updateRole] Updating role:', id, 'by user:', userId);
        
        try {
            const role = await prisma.role.update({
                where: { id },
                data
            });
            
            console.log('[RoleService.updateRole] Role updated successfully:', role.id);
            return role;
        } catch (error: any) {
            console.error('[RoleService.updateRole] Error updating role:', error);
            throw error;
        }
    }

    /**
     * Delete role
     */
    static async deleteRole(id: string) {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[RoleService.deleteRole] Deleting role:', id, 'by user:', userId);
        
        try {
            const role = await prisma.role.findUnique({ where: { id } });
            if (role?.isSystem) {
                throw new Error('System roles cannot be deleted');
            }
            
            const deletedRole = await prisma.role.delete({ where: { id } });
            console.log('[RoleService.deleteRole] Role deleted successfully:', deletedRole.id);
            return deletedRole;
        } catch (error: any) {
            console.error('[RoleService.deleteRole] Error deleting role:', error);
            throw error;
        }
    }

    /**
     * Clone a role
     */
    static async cloneRole(id: string, newName: string) {
        const sourceRole = await this.getRoleById(id);
        if (!sourceRole) throw new Error('Source role not found');

        const newRole = await prisma.role.create({
            data: {
                name: newName,
                description: `Clone of ${sourceRole.name}`,
                isSystem: false
            }
        });

        // Copy permissions
        if (sourceRole.permissions.length > 0) {
            await prisma.rolePermission.createMany({
                data: sourceRole.permissions.map(p => ({
                    roleId: newRole.id,
                    permissionId: p.permissionId
                }))
            });
        }

        return newRole;
    }

    /**
     * Get all available permissions
     */
    static async getAllPermissions() {
        return prisma.permission.findMany({
            orderBy: [
                { module: 'asc' },
                { action: 'asc' }
            ]
        });
    }

    /**
     * Sync permissions for a role
     */
    static async updateRolePermissions(roleId: string, permissionKeys: string[]) {
        // Get permission IDs for the keys
        const permissions = await prisma.permission.findMany({
            where: {
                key: { in: permissionKeys }
            }
        });

        const permissionIds = permissions.map(p => p.id);

        // Transaction to update permissions
        return prisma.$transaction([
            // Remove old mappings
            prisma.rolePermission.deleteMany({
                where: { roleId }
            }),
            // Add new mappings
            prisma.rolePermission.createMany({
                data: permissionIds.map(pid => ({
                    roleId,
                    permissionId: pid
                }))
            })
        ]);
    }

    /**
     * Assign role to user
     */
    static async assignRoleToUser(userId: string, roleId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { roleId }
        });
    }

    /**
     * Seed initial permissions and roles
     */
    static async seedInitialRBAC() {
        const permissions: PermissionDefinition[] = [
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

        console.log('RBAC Seeding complete');
    }
}
