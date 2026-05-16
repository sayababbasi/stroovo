export enum Permission {
    // System permissions
    CREATE_PROJECT = 'CREATE_PROJECT',
    DELETE_PROJECT = 'DELETE_PROJECT',
    MANAGE_USERS = 'MANAGE_USERS',
    VIEW_ANALYTICS = 'VIEW_ANALYTICS',
    MANAGE_BILLING = 'MANAGE_BILLING',
    EXECUTE_AUTOMATIONS = 'EXECUTE_AUTOMATIONS',
    
    // Team permissions
    CREATE_TEAM = 'CREATE_TEAM',
    DELETE_TEAM = 'DELETE_TEAM',
    MANAGE_TEAM = 'MANAGE_TEAM',
    VIEW_TEAM = 'VIEW_TEAM',
    INVITE_MEMBERS = 'INVITE_MEMBERS',
    REMOVE_MEMBERS = 'REMOVE_MEMBERS',
    MANAGE_ROLES = 'MANAGE_ROLES',
    
    // Space permissions
    CREATE_SPACE = 'CREATE_SPACE',
    DELETE_SPACE = 'DELETE_SPACE',
    MANAGE_SPACE = 'MANAGE_SPACE',
    VIEW_SPACE = 'VIEW_SPACE',
    
    // List permissions
    CREATE_LIST = 'CREATE_LIST',
    DELETE_LIST = 'DELETE_LIST',
    MANAGE_LIST = 'MANAGE_LIST',
    VIEW_LIST = 'VIEW_LIST',
    
    // Task permissions
    CREATE_TASK = 'CREATE_TASK',
    DELETE_TASK = 'DELETE_TASK',
    EDIT_TASK = 'EDIT_TASK',
    ASSIGN_TASK = 'ASSIGN_TASK',
    VIEW_TASK = 'VIEW_TASK',
    COMPLETE_TASK = 'COMPLETE_TASK',
    
    // Chat permissions
    SEND_MESSAGE = 'SEND_MESSAGE',
    EDIT_MESSAGE = 'EDIT_MESSAGE',
    DELETE_MESSAGE = 'DELETE_MESSAGE',
    VIEW_CHAT = 'VIEW_CHAT',
    
    // AI permissions
    USE_AI_INSIGHTS = 'USE_AI_INSIGHTS',
    GENERATE_AI_SUGGESTIONS = 'GENERATE_AI_SUGGESTIONS',
    VIEW_AI_ANALYTICS = 'VIEW_AI_ANALYTICS'
}

// Team role hierarchy
export enum TeamRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER', 
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER'
}

// System role permissions
const SYSTEM_ROLE_PERMISSIONS: Record<string, Permission[]> = {
    ADMIN: Object.values(Permission),
    PROJECT_MANAGER: [
        Permission.CREATE_PROJECT,
        Permission.VIEW_ANALYTICS,
        Permission.EXECUTE_AUTOMATIONS,
        Permission.CREATE_TEAM,
        Permission.MANAGE_TEAM,
        Permission.INVITE_MEMBERS,
        Permission.MANAGE_ROLES,
        Permission.USE_AI_INSIGHTS,
        Permission.GENERATE_AI_SUGGESTIONS,
        Permission.VIEW_AI_ANALYTICS
    ],
    TEAM_MEMBER: [
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_TEAM,
        Permission.VIEW_SPACE,
        Permission.VIEW_LIST,
        Permission.VIEW_TASK,
        Permission.CREATE_TASK,
        Permission.EDIT_TASK,
        Permission.COMPLETE_TASK,
        Permission.SEND_MESSAGE,
        Permission.EDIT_MESSAGE,
        Permission.VIEW_CHAT,
        Permission.USE_AI_INSIGHTS
    ],
    USER: [
        Permission.VIEW_TEAM,
        Permission.VIEW_SPACE,
        Permission.VIEW_LIST,
        Permission.VIEW_TASK,
        Permission.SEND_MESSAGE,
        Permission.VIEW_CHAT
    ]
};

// Team role permissions (within a team context)
const TEAM_ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
    [TeamRole.ADMIN]: Object.values(Permission),
    [TeamRole.MANAGER]: [
        Permission.MANAGE_TEAM,
        Permission.INVITE_MEMBERS,
        Permission.REMOVE_MEMBERS,
        Permission.MANAGE_ROLES,
        Permission.CREATE_SPACE,
        Permission.DELETE_SPACE,
        Permission.MANAGE_SPACE,
        Permission.CREATE_LIST,
        Permission.DELETE_LIST,
        Permission.MANAGE_LIST,
        Permission.CREATE_TASK,
        Permission.DELETE_TASK,
        Permission.EDIT_TASK,
        Permission.ASSIGN_TASK,
        Permission.VIEW_TASK,
        Permission.COMPLETE_TASK,
        Permission.SEND_MESSAGE,
        Permission.EDIT_MESSAGE,
        Permission.DELETE_MESSAGE,
        Permission.VIEW_CHAT,
        Permission.USE_AI_INSIGHTS,
        Permission.GENERATE_AI_SUGGESTIONS,
        Permission.VIEW_AI_ANALYTICS,
        Permission.VIEW_TEAM,
        Permission.VIEW_SPACE,
        Permission.VIEW_LIST
    ],
    [TeamRole.MEMBER]: [
        Permission.CREATE_TASK,
        Permission.EDIT_TASK,
        Permission.VIEW_TASK,
        Permission.COMPLETE_TASK,
        Permission.SEND_MESSAGE,
        Permission.EDIT_MESSAGE,
        Permission.VIEW_CHAT,
        Permission.USE_AI_INSIGHTS,
        Permission.VIEW_TEAM,
        Permission.VIEW_SPACE,
        Permission.VIEW_LIST
    ],
    [TeamRole.VIEWER]: [
        Permission.VIEW_TASK,
        Permission.VIEW_CHAT,
        Permission.VIEW_TEAM,
        Permission.VIEW_SPACE,
        Permission.VIEW_LIST
    ]
};

export function can(userRole: string, permission: Permission): boolean {
    const permissions = SYSTEM_ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
}

export function canInTeam(teamRole: TeamRole, permission: Permission): boolean {
    const permissions = TEAM_ROLE_PERMISSIONS[teamRole] || [];
    return permissions.includes(permission);
}

export function hasPermission(
    userRole: string, 
    teamRole: TeamRole | null, 
    permission: Permission,
    context: 'system' | 'team' = 'system'
): boolean {
    if (context === 'team' && teamRole) {
        return canInTeam(teamRole, permission);
    }
    return can(userRole, permission);
}

export function getTeamPermissions(teamRole: TeamRole): Permission[] {
    return TEAM_ROLE_PERMISSIONS[teamRole] || [];
}

export function getSystemPermissions(userRole: string): Permission[] {
    return SYSTEM_ROLE_PERMISSIONS[userRole] || [];
}

// Permission levels for UI components
export enum PermissionLevel {
    READ = 'READ',
    WRITE = 'WRITE', 
    ADMIN = 'ADMIN'
}

export function getPermissionLevel(teamRole: TeamRole): PermissionLevel {
    switch (teamRole) {
        case TeamRole.ADMIN:
            return PermissionLevel.ADMIN;
        case TeamRole.MANAGER:
            return PermissionLevel.WRITE;
        case TeamRole.MEMBER:
            return PermissionLevel.WRITE;
        case TeamRole.VIEWER:
            return PermissionLevel.READ;
        default:
            return PermissionLevel.READ;
    }
}

// Check if user can perform action on specific resource
export function canPerformAction(
    userRole: string,
    teamRole: TeamRole | null,
    action: string,
    resourceType: string,
    context: 'system' | 'team' = 'team'
): boolean {
    const permission = `${action}_${resourceType.toUpperCase()}` as Permission;
    return hasPermission(userRole, teamRole, permission, context);
}
