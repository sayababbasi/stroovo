import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from './tokens';
import { User, UserRole } from '@prisma/client/index';
import prisma from '@/lib/prisma';

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  PROJECT_MANAGER: 60,
  TEAM_MEMBER: 40,
  USER: 20,
  CEO: 90,
  EXECUTIVE: 85,
};

// Permission definitions
export interface Permission {
  resource: string;
  action: string;
  conditions?: string[];
}

// Resource permissions mapping
const RESOURCE_PERMISSIONS: Record<string, Record<UserRole, string[]>> = {
  // User Management
  'users': {
    SUPER_ADMIN: ['create', 'read', 'update', 'delete', 'manage_roles', 'activate', 'deactivate'],
    ADMIN: ['create', 'read', 'update', 'delete', 'activate', 'deactivate'],
    PROJECT_MANAGER: ['read', 'update'],
    TEAM_MEMBER: ['read'],
    USER: ['read'],
    CEO: ['create', 'read', 'update', 'delete', 'manage_roles', 'activate', 'deactivate'],
    EXECUTIVE: ['create', 'read', 'update', 'delete', 'activate', 'deactivate'],
  },
  
  // Project Management
  'projects': {
    SUPER_ADMIN: ['create', 'read', 'update', 'delete', 'manage'],
    ADMIN: ['create', 'read', 'update', 'delete', 'manage'],
    PROJECT_MANAGER: ['create', 'read', 'update', 'delete', 'manage'],
    TEAM_MEMBER: ['read', 'update'],
    USER: ['read'],
    CEO: ['create', 'read', 'update', 'delete', 'manage'],
    EXECUTIVE: ['create', 'read', 'update', 'delete', 'manage'],
  },
  
  // Tasks Management
  'tasks': {
    SUPER_ADMIN: ['create', 'read', 'update', 'delete', 'assign'],
    ADMIN: ['create', 'read', 'update', 'delete', 'assign'],
    PROJECT_MANAGER: ['create', 'read', 'update', 'delete', 'assign'],
    TEAM_MEMBER: ['create', 'read', 'update'],
    USER: ['read', 'update'],
    CEO: ['create', 'read', 'update', 'delete', 'assign'],
    EXECUTIVE: ['create', 'read', 'update', 'delete', 'assign'],
  },
  
  // Team Management
  'teams': {
    SUPER_ADMIN: ['create', 'read', 'update', 'delete', 'manage_members'],
    ADMIN: ['create', 'read', 'update', 'delete', 'manage_members'],
    PROJECT_MANAGER: ['create', 'read', 'update', 'manage_members'],
    TEAM_MEMBER: ['read'],
    USER: ['read'],
    CEO: ['create', 'read', 'update', 'delete', 'manage_members'],
    EXECUTIVE: ['create', 'read', 'update', 'delete', 'manage_members'],
  },
  
  // Settings & Configuration
  'settings': {
    SUPER_ADMIN: ['read', 'update'],
    ADMIN: ['read', 'update'],
    PROJECT_MANAGER: ['read'],
    TEAM_MEMBER: ['read'],
    USER: ['read'],
    CEO: ['read', 'update'],
    EXECUTIVE: ['read', 'update'],
  },
  
  // Analytics & Reports
  'analytics': {
    SUPER_ADMIN: ['read', 'export'],
    ADMIN: ['read', 'export'],
    PROJECT_MANAGER: ['read'],
    TEAM_MEMBER: ['read'],
    USER: ['read'],
    CEO: ['read', 'export'],
    EXECUTIVE: ['read', 'export'],
  },
  
  // Security & Audit
  'security': {
    SUPER_ADMIN: ['read', 'update', 'manage'],
    ADMIN: ['read'],
    PROJECT_MANAGER: ['read'],
    TEAM_MEMBER: [],
    USER: [],
    CEO: ['read', 'update', 'manage'],
    EXECUTIVE: ['read', 'update'],
  },
  
  // Notifications
  'notifications': {
    SUPER_ADMIN: ['read', 'send', 'manage'],
    ADMIN: ['read', 'send', 'manage'],
    PROJECT_MANAGER: ['read', 'send'],
    TEAM_MEMBER: ['read'],
    USER: ['read'],
    CEO: ['read', 'send', 'manage'],
    EXECUTIVE: ['read', 'send', 'manage'],
  },
};

// RBAC context interface
export interface RBACContext {
  user: User;
  permissions: Permission[];
  tenantId?: string | null;
  sessionId: string;
}

// Authentication middleware
export async function authenticateRequest(request: NextRequest): Promise<{
  user?: User;
  error?: string;
  sessionId?: string;
}> {
  try {
    // Extract token from header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('accessToken')?.value;
    
    const token = extractTokenFromHeader(authHeader) || cookieToken;
    
    if (!token) {
      return { error: 'Authentication required' };
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return { error: 'Invalid or expired token' };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        securitySettings: true,
      }
    });

    if (!user || !user.isActive) {
      return { error: 'User not found or inactive' };
    }

    // Validate session if sessionId is present in token
    if (payload.sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId }
      });

      if (!session || session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
        return { error: 'Session expired or invalid' };
      }
    }

    return { 
      user, 
      sessionId: payload.sessionId || 'unknown'
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed' };
  }
}

// Permission checking
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  userPermissions?: Permission[]
): boolean {
  // Check role-based permissions
  const rolePermissions = RESOURCE_PERMISSIONS[resource]?.[userRole];
  if (rolePermissions?.includes(action)) {
    return true;
  }

  // Check additional permissions if provided
  if (userPermissions) {
    return userPermissions.some(perm => 
      perm.resource === resource && 
      perm.action === action
    );
  }

  return false;
}

// Check if user has sufficient role level
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

// Resource ownership checking
export async function checkResourceOwnership(
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case 'projects':
        const project = await prisma.project.findUnique({
          where: { id: resourceId }
        });
        return project?.managerId === userId;

      case 'tasks':
        const task = await prisma.task.findUnique({
          where: { id: resourceId }
        });
        return task?.assigneeId === userId;

      case 'goals':
        const goal = await prisma.goal.findUnique({
          where: { id: resourceId }
        });
        return goal?.ownerId === userId;

      case 'comments':
        const comment = await prisma.comment.findUnique({
          where: { id: resourceId }
        });
        return comment?.userId === userId;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
}

// Tenant access checking
export async function checkTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    return user?.tenantId === tenantId || user?.role === UserRole.SUPER_ADMIN;
  } catch (error) {
    console.error('Error checking tenant access:', error);
    return false;
  }
}

// RBAC middleware factory
export function requireAuth() {
  return async (request: NextRequest): Promise<{
    user?: User;
    error?: string;
    context?: RBACContext;
  }> => {
    const authResult = await authenticateRequest(request);
    
    if (authResult.error) {
      return { error: authResult.error };
    }

    const context: RBACContext = {
      user: authResult.user!,
      permissions: [], // Could be loaded from database if needed
      tenantId: authResult.user!.tenantId,
      sessionId: authResult.sessionId!,
    };

    return { user: authResult.user, context };
  };
}

// Role-based access middleware
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest): Promise<{
    user?: User;
    error?: string;
    context?: RBACContext;
  }> => {
    const authResult = await authenticateRequest(request);
    
    if (authResult.error) {
      return { error: authResult.error };
    }

    if (!allowedRoles.includes(authResult.user!.role as UserRole)) {
      return { error: 'Insufficient permissions' };
    }

    const context: RBACContext = {
      user: authResult.user!,
      permissions: [],
      tenantId: authResult.user!.tenantId,
      sessionId: authResult.sessionId!,
    };

    return { user: authResult.user, context };
  };
}

// Permission-based access middleware
export function requirePermission(resource: string, action: string) {
  return async (request: NextRequest): Promise<{
    user?: User;
    error?: string;
    context?: RBACContext;
  }> => {
    const authResult = await authenticateRequest(request);
    
    if (authResult.error) {
      return { error: authResult.error };
    }

    const hasAccess = hasPermission(
      authResult.user!.role as UserRole,
      resource,
      action
    );

    if (!hasAccess) {
      return { error: `Insufficient permissions for ${action} on ${resource}` };
    }

    const context: RBACContext = {
      user: authResult.user!,
      permissions: [{ resource, action }],
      tenantId: authResult.user!.tenantId,
      sessionId: authResult.sessionId!,
    };

    return { user: authResult.user, context };
  };
}

// Resource ownership middleware
export function requireOwnership(resourceType: string, resourceIdParam: string = 'id') {
  return async (request: NextRequest): Promise<{
    user?: User;
    error?: string;
    context?: RBACContext;
  }> => {
    const authResult = await authenticateRequest(request);
    
    if (authResult.error) {
      return { error: authResult.error };
    }

    // Extract resource ID from URL
    const url = new URL(request.url);
    const resourceId = url.pathname.split('/').pop() || 
                      url.searchParams.get(resourceIdParam);

    if (!resourceId) {
      return { error: 'Resource ID not found' };
    }

    // Check ownership or admin privileges
    const isAdmin = authResult.user!.role === UserRole.ADMIN || 
                   authResult.user!.role === UserRole.SUPER_ADMIN;
    
    const isOwner = await checkResourceOwnership(
      authResult.user!.id,
      resourceType,
      resourceId
    );

    if (!isAdmin && !isOwner) {
      return { error: 'Access denied: resource ownership required' };
    }

    const context: RBACContext = {
      user: authResult.user!,
      permissions: [],
      tenantId: authResult.user!.tenantId,
      sessionId: authResult.sessionId!,
    };

    return { user: authResult.user, context };
  };
}

// Tenant access middleware
export function requireTenantAccess() {
  return async (request: NextRequest): Promise<{
    user?: User;
    error?: string;
    context?: RBACContext;
  }> => {
    const authResult = await authenticateRequest(request);
    
    if (authResult.error) {
      return { error: authResult.error };
    }

    // Extract tenant ID from URL or body
    const url = new URL(request.url);
    let tenantId = url.searchParams.get('tenantId');

    if (!tenantId && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.clone().json();
        tenantId = body.tenantId;
      } catch {
        // Ignore JSON parsing errors
      }
    }

    if (!tenantId) {
      // Use user's tenant if no specific tenant requested
      tenantId = authResult.user!.tenantId;
    }

    if (!tenantId) {
      return { error: 'Tenant ID required' };
    }

    const hasAccess = await checkTenantAccess(authResult.user!.id, tenantId);
    if (!hasAccess) {
      return { error: 'Access denied: tenant access required' };
    }

    const context: RBACContext = {
      user: authResult.user!,
      permissions: [],
      tenantId,
      sessionId: authResult.sessionId!,
    };

    return { user: authResult.user, context };
  };
}

// Higher-order middleware wrapper
export function withRBAC(
  middleware: (request: NextRequest) => Promise<{
    user?: User;
    error?: string;
    context?: RBACContext;
  }>
) {
  return (handler: (request: NextRequest, context: RBACContext) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const result = await middleware(request);
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 401 }
        );
      }

      if (!result.user || !result.context) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }

      return handler(request, result.context);
    };
  };
}

// Utility functions for checking permissions in components
export function canUserAccess(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  return hasPermission(userRole, resource, action);
}

export function getUserRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role];
}

export function getRolePermissions(role: UserRole): Record<string, string[]> {
  const permissions: Record<string, string[]> = {};
  
  for (const [resource, rolePerms] of Object.entries(RESOURCE_PERMISSIONS)) {
    if (rolePerms[role]) {
      permissions[resource] = rolePerms[role];
    }
  }
  
  return permissions;
}

// Role validation
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

// Permission audit logging
export async function logPermissionCheck(
  userId: string,
  resource: string,
  action: string,
  granted: boolean,
  context: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
  }
): Promise<void> {
  try {
    await prisma.authLog.create({
      data: {
        userId,
        action: 'ROLE_CHECK' as any,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        status: granted ? 'SUCCESS' as any : 'FAILED' as any,
        details: `${resource}:${action}`,
        metadata: {
          resource,
          action,
          granted,
          sessionId: context.sessionId,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Failed to log permission check:', error);
  }
}
