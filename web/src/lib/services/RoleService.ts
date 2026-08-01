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
                        users: true,
                        additionalUsers: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        // Sum users and additionalUsers for member count
        const formattedRoles = roles.map((r: any) => ({
            ...r,
            memberCount: r._count.users + r._count.additionalUsers
        }));

        console.log(`[RoleService.getAllRoles] Found ${roles.length} roles`);
        return formattedRoles;
    }

    /**
     * Get role by ID with full permissions and assigned members
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
                        email: true,
                        image: true,
                        isActive: true,
                        createdAt: true
                    }
                }
            }
        });
    }

    /**
     * Create a new role
     */
    static async createRole(data: { name: string; description?: string; cloneFromRoleId?: string }) {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[RoleService.createRole] Creating role:', data.name, 'by user:', userId);
        
        try {
            const role = await prisma.role.create({
                data: {
                    name: data.name,
                    description: data.description,
                    isSystem: false
                }
            });
            
            // If cloning, copy permissions
            if (data.cloneFromRoleId) {
                const sourceRole = await this.getRoleById(data.cloneFromRoleId);
                if (sourceRole && sourceRole.permissions.length > 0) {
                    await prisma.rolePermission.createMany({
                        data: sourceRole.permissions.map((p: any) => ({
                            roleId: role.id,
                            permissionId: p.permissionId
                        }))
                    });
                }
            }
            
            console.log('[RoleService.createRole] Role created successfully:', role.id);
            return role;
        } catch (error: any) {
            console.error('[RoleService.createRole] Error creating role:', error);
            throw error;
        }
    }

    /**
     * Update role details
     */
    static async updateRole(id: string, data: { name?: string; description?: string }) {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[RoleService.updateRole] Updating role:', id, 'by user:', userId);
        
        try {
            // Cannot rename system roles, but description could potentially be updated
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
     * Delete custom role
     */
    static async deleteRole(id: string) {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        
        console.log('[RoleService.deleteRole] Deleting role:', id, 'by user:', userId);
        
        try {
            const role = await prisma.role.findUnique({ 
                where: { id },
                include: { _count: { select: { users: true } } }
            });

            if (!role) throw new Error('Role not found');
            if (role.isSystem) {
                throw new Error('System roles cannot be deleted');
            }
            if (role._count.users > 0) {
                throw new Error('Cannot delete role with assigned members. Reassign them first.');
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
     * Get all available permissions grouped by module
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
     * Sync permissions for a role (The entire set)
     */
    static async updateRolePermissions(roleId: string, permissionKeys: string[]) {
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) throw new Error('Role not found');
        
        // Safety: Do not allow stripping all permissions from Super Admin
        if (role.name === 'Super Admin' && permissionKeys.length === 0) {
            throw new Error('Cannot strip all permissions from Super Admin');
        }

        const permissions = await prisma.permission.findMany({
            where: {
                key: { in: permissionKeys }
            }
        });

        const permissionIds = permissions.map((p: any) => p.id);

        return prisma.$transaction([
            prisma.rolePermission.deleteMany({
                where: { roleId }
            }),
            prisma.rolePermission.createMany({
                data: permissionIds.map((pid: string) => ({
                    roleId,
                    permissionId: pid
                }))
            })
        ]);
    }

    /**
     * Assign role to user globally (Organization Scope)
     */
    static async assignRoleToUser(userId: string, roleId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { roleId }
        });
    }

    /**
     * Scoped Role Assignment
     */
    static async assignRoleScoped(userId: string, roleId: string, scopeType: 'organization' | 'team' | 'project', scopeId?: string) {
        if (scopeType === 'organization') {
            return this.assignRoleToUser(userId, roleId);
        } else if (scopeType === 'team' && scopeId) {
            // Upsert team membership with role
            return prisma.teamMember.upsert({
                where: { teamId_userId: { userId, teamId: scopeId } },
                update: { roleId },
                create: { userId, teamId: scopeId, roleId }
            });
        } else if (scopeType === 'project' && scopeId) {
            // Upsert project access with role
            return prisma.projectAccess.upsert({
                where: { projectId_userId: { userId, projectId: scopeId } },
                update: { roleId },
                create: { userId, projectId: scopeId, roleId }
            });
        }
        throw new Error('Invalid scope parameters');
    }

    /**
     * Remove user from role (Sets to generic TEAM_MEMBER or null)
     */
    static async removeUserFromRole(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { roleId: null, role: 'TEAM_MEMBER' }
        });
    }

    static async seedInitialRBAC() {
        const permissions: PermissionDefinition[] = [
            // ORGANIZATION
            { module: 'Organization', action: 'View', key: 'organization.view' },
            { module: 'Organization', action: 'Edit', key: 'organization.edit' },
            { module: 'Organization', action: 'Settings', key: 'organization.settings' },
            { module: 'Organization', action: 'Analytics', key: 'organization.analytics' },
            { module: 'Organization', action: 'Delete', key: 'organization.delete' },

            // USERS
            { module: 'Users', action: 'View', key: 'users.view' },
            { module: 'Users', action: 'Invite', key: 'users.invite' },
            { module: 'Users', action: 'Edit', key: 'users.edit' },
            { module: 'Users', action: 'Suspend', key: 'users.suspend' },
            { module: 'Users', action: 'Restore', key: 'users.restore' },
            { module: 'Users', action: 'Delete', key: 'users.delete' },
            { module: 'Users', action: 'Impersonate', key: 'users.impersonate' },

            // TEAMS
            { module: 'Teams', action: 'View', key: 'teams.view' },
            { module: 'Teams', action: 'Create', key: 'teams.create' },
            { module: 'Teams', action: 'Edit', key: 'teams.edit' },
            { module: 'Teams', action: 'Delete', key: 'teams.delete' },
            { module: 'Teams', action: 'Archive', key: 'teams.archive' },
            { module: 'Teams', action: 'Restore', key: 'teams.restore' },
            { module: 'Teams', action: 'Manage Members', key: 'teams.manage_members' },
            { module: 'Teams', action: 'Manage Roles', key: 'teams.manage_roles' },

            // MEMBERS
            { module: 'Members', action: 'View', key: 'members.view' },
            { module: 'Members', action: 'Invite', key: 'members.invite' },
            { module: 'Members', action: 'Edit', key: 'members.edit' },
            { module: 'Members', action: 'Remove', key: 'members.remove' },
            { module: 'Members', action: 'Suspend', key: 'members.suspend' },
            { module: 'Members', action: 'Restore', key: 'members.restore' },
            { module: 'Members', action: 'Assign Role', key: 'members.assign_role' },
            { module: 'Members', action: 'Assign Team', key: 'members.assign_team' },

            // PROJECTS
            { module: 'Projects', action: 'View', key: 'projects.view' },
            { module: 'Projects', action: 'Create', key: 'projects.create' },
            { module: 'Projects', action: 'Edit', key: 'projects.edit' },
            { module: 'Projects', action: 'Delete', key: 'projects.delete' },
            { module: 'Projects', action: 'Archive', key: 'projects.archive' },
            { module: 'Projects', action: 'Restore', key: 'projects.restore' },
            { module: 'Projects', action: 'Manage Members', key: 'projects.manage_members' },
            { module: 'Projects', action: 'Manage Access', key: 'projects.manage_access' },

            // TASKS
            { module: 'Tasks', action: 'View', key: 'tasks.view' },
            { module: 'Tasks', action: 'Create', key: 'tasks.create' },
            { module: 'Tasks', action: 'Edit', key: 'tasks.edit' },
            { module: 'Tasks', action: 'Delete', key: 'tasks.delete' },
            { module: 'Tasks', action: 'Assign', key: 'tasks.assign' },
            { module: 'Tasks', action: 'Reassign', key: 'tasks.reassign' },
            { module: 'Tasks', action: 'Complete', key: 'tasks.complete' },
            { module: 'Tasks', action: 'Archive', key: 'tasks.archive' },

            // ROLES
            { module: 'Roles', action: 'View', key: 'roles.view' },
            { module: 'Roles', action: 'Create', key: 'roles.create' },
            { module: 'Roles', action: 'Edit', key: 'roles.edit' },
            { module: 'Roles', action: 'Delete', key: 'roles.delete' },
            { module: 'Roles', action: 'Duplicate', key: 'roles.duplicate' },
            { module: 'Roles', action: 'Assign', key: 'roles.assign' },

            // PERMISSIONS
            { module: 'Permissions', action: 'View', key: 'permissions.view' },
            { module: 'Permissions', action: 'Manage', key: 'permissions.manage' },
            { module: 'Permissions', action: 'Grant', key: 'permissions.grant' },
            { module: 'Permissions', action: 'Revoke', key: 'permissions.revoke' },

            // AUDIT
            { module: 'Audit', action: 'View', key: 'audit.view' },
            { module: 'Audit', action: 'Export', key: 'audit.export' },
            { module: 'Audit', action: 'Filter', key: 'audit.filter' },
            { module: 'Audit', action: 'Delete', key: 'audit.delete' },

            // SECURITY
            { module: 'Security', action: 'View', key: 'security.view' },
            { module: 'Security', action: 'Manage', key: 'security.manage' },
            { module: 'Security', action: 'Sessions', key: 'security.sessions' },
            { module: 'Security', action: 'MFA', key: 'security.mfa' },
            { module: 'Security', action: 'Policies', key: 'security.policies' },
            { module: 'Security', action: 'Override', key: 'security.override' },

            // BILLING
            { module: 'Billing', action: 'View', key: 'billing.view' },
            { module: 'Billing', action: 'Manage', key: 'billing.manage' },
            { module: 'Billing', action: 'Invoices', key: 'billing.invoices' },
            { module: 'Billing', action: 'Payment Methods', key: 'billing.payment_methods' },

            // INTEGRATIONS
            { module: 'Integrations', action: 'View', key: 'integrations.view' },
            { module: 'Integrations', action: 'Connect', key: 'integrations.connect' },
            { module: 'Integrations', action: 'Configure', key: 'integrations.configure' },
            { module: 'Integrations', action: 'Disconnect', key: 'integrations.disconnect' },

            // SYSTEM
            { module: 'System', action: 'Settings', key: 'system.settings' },
            { module: 'System', action: 'Logs', key: 'system.logs' },
            { module: 'System', action: 'Health', key: 'system.health' },
            { module: 'System', action: 'Configuration', key: 'system.configuration' },
            { module: 'System', action: 'Reset', key: 'system.reset' },
            
            // REPORTS
            { module: 'Reports', action: 'View', key: 'reports.view' },
            { module: 'Reports', action: 'Export', key: 'reports.export' },
            
            // FINANCIAL
            { module: 'Financial', action: 'Analytics', key: 'financial.analytics' },
            
            // EXECUTIVE (Virtual/UI only markers)
            { module: 'Executive', action: 'Dashboard Access', key: 'executive.dashboard' },
            { module: 'Admin', action: 'Dashboard Access', key: 'admin.dashboard' }
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
            { name: 'Super Admin', description: 'Everything.', isSystem: true },
            { name: 'Admin', description: 'Organization administration but subject to protected system controls.', isSystem: true },
            { name: 'CEO', description: 'Executive-level access.', isSystem: true },
            { name: 'CTO', description: 'Technical/engineering access.', isSystem: true },
            { name: 'COO', description: 'Operations access.', isSystem: true },
            { name: 'Manager', description: 'Team/project/task management.', isSystem: true },
            { name: 'Team Lead', description: 'Team collaboration management.', isSystem: true },
            { name: 'Employee', description: 'Basic access.', isSystem: true },
        ];

        for (const r of systemRoles) {
            await prisma.role.upsert({
                where: { name: r.name },
                update: { description: r.description },
                create: r
            });
        }

        // 3. Retrieve all roles and permissions
        const dbRoles = await prisma.role.findMany();
        const allPermissions = await prisma.permission.findMany();
        
        const getPerms = (keys: string[]) => allPermissions.filter((p: any) => keys.includes(p.key)).map((p: any) => p.id);
        const getAllButDestructive = () => allPermissions.filter((p: any) => 
            !['organization.delete', 'system.reset', 'security.override', 'users.impersonate'].includes(p.key)
        ).map((p: any) => p.id);

        const roleAssignments: Record<string, string[]> = {
            'Super Admin': allPermissions.map((p: any) => p.id),
            'Admin': getAllButDestructive(),
            'CEO': getPerms([
                'executive.dashboard', 'organization.view', 'organization.analytics', 'teams.view', 'members.view', 
                'projects.view', 'projects.manage_access', 'projects.manage_members', 'projects.edit', 'tasks.view', 'financial.analytics', 
                'reports.view', 'reports.export', 'audit.view'
            ]),
            'CTO': getPerms([
                'executive.dashboard', 'organization.view', 'teams.view', 'teams.manage_members', 'projects.view', 'projects.create', 'projects.edit', 
                'projects.manage_members', 'integrations.view', 'integrations.configure', 'integrations.connect', 
                'system.health', 'system.logs', 'reports.view'
            ]),
            'COO': getPerms([
                'executive.dashboard', 'organization.view', 'teams.view', 'teams.manage_members', 'teams.edit', 'members.view', 
                'members.edit', 'projects.view', 'projects.edit', 'tasks.view', 'tasks.assign', 'reports.view', 'reports.export'
            ]),
            'Manager': getPerms([
                'teams.view', 'members.view', 'projects.view', 'projects.edit', 'projects.manage_members', 'tasks.view', 'tasks.create', 
                'tasks.edit', 'tasks.assign', 'tasks.reassign'
            ]),
            'Team Lead': getPerms([
                'teams.view', 'members.view', 'projects.view', 'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign'
            ]),
            'Employee': getPerms([
                'teams.view', 'members.view', 'projects.view', 'tasks.view', 'tasks.create', 'tasks.edit'
            ])
        };

        // 4. Assign Permissions
        for (const role of dbRoles) {
            const perms = roleAssignments[role.name];
            if (perms) {
                await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
                if (perms.length > 0) {
                    await prisma.rolePermission.createMany({
                        data: perms.map(pid => ({
                            roleId: role.id,
                            permissionId: pid
                        }))
                    });
                }
            }
        }

        console.log('RBAC Seeding complete');
    }
}
