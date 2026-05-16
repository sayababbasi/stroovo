import { UserRole } from '@prisma/client';

export interface UserWithPermissions {
    id: string;
    email: string;
    role: UserRole;
    systemRole?: {
        name: string;
        permissions: {
            permission: {
                key: string;
            };
        }[];
    } | null;
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: UserWithPermissions | null | undefined, permissionKey: string): boolean {
    if (!user) return false;

    // Admin bypass (optional, depends on policy)
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'CEO') {
        return true;
    }

    // Check system permissions if integrated
    if (user.systemRole && user.systemRole.permissions) {
        return user.systemRole.permissions.some(p => p.permission.key === permissionKey);
    }

    // Fallback for legacy logic
    const legacyPermissions: Record<UserRole, string[]> = {
        'ADMIN': ['*'],
        'SUPER_ADMIN': ['*'],
        'CEO': ['*'],
        'EXECUTIVE': ['admin.access', 'analytics.view', 'users.read', 'tasks.read'],
        'PROJECT_MANAGER': ['tasks.create', 'tasks.update', 'tasks.delete', 'tasks.assign', 'users.read', 'teams.read'],
        'TEAM_MEMBER': ['tasks.read', 'tasks.update'],
        'USER': ['tasks.read']
    };

    const userPerms = legacyPermissions[user.role] || [];
    return userPerms.includes('*') || userPerms.includes(permissionKey);
}
