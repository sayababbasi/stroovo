import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Permission, Role, Task, User, TeamMember, ProjectAccess } from '@prisma/client';

export type EffectiveRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EXECUTIVE'
  | 'MANAGER'
  | 'TEAM_LEAD'
  | 'MEMBER';

type RoleWithPermissions = Role & { permissions: Array<{ permission: Permission }> };

type UserWithPermissions = User & {
  systemRole: RoleWithPermissions | null;
  additionalRoles?: Array<{ role: RoleWithPermissions }>;
  teamMembers?: Array<TeamMember & { role: RoleWithPermissions | null }>;
  projectAccesses?: Array<ProjectAccess & { role: RoleWithPermissions | null }>;
};

type PermissionContext = {
  user: UserWithPermissions;
  effectiveRole: EffectiveRole;
  permissionKeys: string[];
};

export interface AuthResult {
  success: boolean;
  user?: UserWithPermissions;
  effectiveRole?: EffectiveRole;
  permissionKeys?: string[];
  response?: NextResponse;
}

function normalizeRoleName(roleName?: string | null): EffectiveRole | null {
  if (!roleName) return null;

  const normalized = roleName.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const aliasMap: Record<string, EffectiveRole> = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    CEO: 'EXECUTIVE',
    CTO: 'EXECUTIVE',
    COO: 'EXECUTIVE',
    EXECUTIVE: 'EXECUTIVE',
    PROJECT_MANAGER: 'MANAGER',
    MANAGER: 'MANAGER',
    TEAM_LEAD: 'TEAM_LEAD',
    TEAM_MEMBER: 'MEMBER',
    MEMBER: 'MEMBER',
    USER: 'MEMBER',
  };

  return aliasMap[normalized] ?? null;
}

export function getEffectiveRole(user: Pick<UserWithPermissions, 'role' | 'systemRole'>): EffectiveRole {
  return normalizeRoleName(user.systemRole?.name) ?? normalizeRoleName(user.role) ?? 'MEMBER';
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function permissionSetForUser(user: UserWithPermissions): string[] {
  // Compute global permissions (Organization scope)
  let explicit = user.systemRole?.permissions.map((item) => item.permission.key) ?? [];

  if (user.additionalRoles) {
    for (const ar of user.additionalRoles) {
      if (ar.role && ar.role.permissions) {
        explicit = explicit.concat(ar.role.permissions.map((item) => item.permission.key));
      }
    }
  }

  // The caller might just check generic visibility (e.g. users.view)
  // We also aggregate ALL permissions across scopes for the UI boolean checks (can they view tasks AT ALL?)
  // If they have team-level tasks.view, they effectively have generic tasks.view for the nav menu.
  if (user.teamMembers) {
    for (const tm of user.teamMembers) {
      if (tm.role?.permissions) {
        explicit = explicit.concat(tm.role.permissions.map((item) => item.permission.key));
      }
    }
  }

  if (user.projectAccesses) {
    for (const pa of user.projectAccesses) {
      if (pa.role?.permissions) {
        explicit = explicit.concat(pa.role.permissions.map((item) => item.permission.key));
      }
    }
  }

  return dedupe(explicit);
}

// Check if a user has permission within a specific scope
export function hasPermission(
  user: UserWithPermissions | null | undefined, 
  permissionKey: string,
  scope?: { type: 'organization' | 'team' | 'project', id?: string }
): boolean {
  if (!user) return false;

  // 1. Check Global/Organization Level (Always takes precedence if granted globally)
  let globalPermissions = user.systemRole?.permissions.map(p => p.permission.key) ?? [];
  if (user.additionalRoles) {
    globalPermissions = globalPermissions.concat(
      user.additionalRoles.flatMap(ar => ar.role?.permissions.map(p => p.permission.key) || [])
    );
  }
  
  if (globalPermissions.includes('*') || globalPermissions.includes(permissionKey)) {
    return true;
  }

  if (!scope || scope.type === 'organization') {
    return false; // Already checked global
  }

  // 2. Check Team Level
  if (scope.type === 'team' && scope.id && user.teamMembers) {
    const membership = user.teamMembers.find(tm => tm.teamId === scope.id);
    if (membership && membership.role) {
      const teamPerms = membership.role.permissions.map(p => p.permission.key);
      if (teamPerms.includes(permissionKey) || teamPerms.includes('*')) return true;
    }
  }

  // 3. Check Project Level
  if (scope.type === 'project' && scope.id && user.projectAccesses) {
    const access = user.projectAccesses.find(pa => pa.projectId === scope.id);
    if (access && access.role) {
      const projPerms = access.role.permissions.map(p => p.permission.key);
      if (projPerms.includes(permissionKey) || projPerms.includes('*')) return true;
    }
  }

  return false;
}

export function explainPermission(
  user: UserWithPermissions, 
  permissionKey: string,
  scope?: { type: 'organization' | 'team' | 'project', id?: string }
): { granted: boolean; sources: string[] } {
  const sources: string[] = [];

  let globalPermissions = user.systemRole?.permissions.map(p => p.permission.key) ?? [];
  if (globalPermissions.includes('*') || globalPermissions.includes(permissionKey)) {
    sources.push(`Global Role: ${user.systemRole?.name}`);
  }

  if (user.additionalRoles) {
    for (const ar of user.additionalRoles) {
      const perms = ar.role?.permissions.map(p => p.permission.key) || [];
      if (perms.includes('*') || perms.includes(permissionKey)) {
        sources.push(`Additional Role: ${ar.role?.name}`);
      }
    }
  }

  if (scope?.type === 'team' && scope.id && user.teamMembers) {
    const membership = user.teamMembers.find(tm => tm.teamId === scope.id);
    if (membership?.role) {
      const perms = membership.role.permissions.map(p => p.permission.key);
      if (perms.includes(permissionKey) || perms.includes('*')) {
        sources.push(`Team Role: ${membership.role.name} on Team ${scope.id}`);
      }
    }
  }

  if (scope?.type === 'project' && scope.id && user.projectAccesses) {
    const access = user.projectAccesses.find(pa => pa.projectId === scope.id);
    if (access?.role) {
      const perms = access.role.permissions.map(p => p.permission.key);
      if (perms.includes(permissionKey) || perms.includes('*')) {
        sources.push(`Project Role: ${access.role.name} on Project ${scope.id}`);
      }
    }
  }

  return {
    granted: sources.length > 0,
    sources
  };
}

const userIncludes = {
  systemRole: {
    include: {
      permissions: { include: { permission: true } },
    },
  },
  additionalRoles: {
    include: {
      role: {
        include: { permissions: { include: { permission: true } } }
      }
    }
  },
  teamMembers: {
    include: {
      role: {
        include: { permissions: { include: { permission: true } } }
      }
    }
  },
  projectAccesses: {
    include: {
      role: {
        include: { permissions: { include: { permission: true } } }
      }
    }
  }
};

export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userIncludes,
  });

  if (!user) return [];
  return permissionSetForUser(user);
}

export async function loadUserFromRequest(request: Request): Promise<UserWithPermissions | null> {
  const userId = request.headers.get('x-user-id');
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: userIncludes,
  });
}

async function logSecurityEvent(
  user: UserWithPermissions | null,
  request: Request,
  permissionKey: string,
  reason: string
): Promise<void> {
  try {
    const tenantId = request.headers.get('x-tenant-id') ?? user?.tenantId ?? null;
    if (tenantId && user?.id) {
      await prisma.activityLog.create({
        data: {
          action: 'SECURITY_PERMISSION_DENIED',
          entity: 'AUTHORIZATION',
          entityId: user.id,
          tenantId,
          userId: user.id,
          metadata: {
            permissionKey,
            reason,
            path: new URL(request.url).pathname,
            method: request.method,
          },
        },
      });
    }
  } catch (error) {
    console.error('[authorization] failed to log security event', error);
  }
}

function forbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function requirePermission(permissionKey: string, scopeResolver?: (req: Request) => { type: 'organization'|'team'|'project', id?: string }) {
  return async (request: Request): Promise<AuthResult> => {
    const user = await loadUserFromRequest(request);
    if (!user || !user.isActive) {
      return { success: false, response: unauthorized('Unauthorized') };
    }

    const scope = scopeResolver ? scopeResolver(request) : undefined;

    if (!hasPermission(user, permissionKey, scope)) {
      await logSecurityEvent(user, request, permissionKey, 'permission_missing');
      return { success: false, response: forbidden('Forbidden: Insufficient permissions') };
    }

    return {
      success: true,
      user,
      effectiveRole: getEffectiveRole(user),
      permissionKeys: permissionSetForUser(user),
    };
  };
}

export async function canAccessTask(
  user: UserWithPermissions,
  task: Pick<Task, 'id' | 'assigneeId' | 'teamId' | 'tenantId' | 'parentId'> | null,
  action: 'read' | 'update' | 'delete' | 'assign'
): Promise<boolean> {
  if (!task) return false;

  const permMap = {
    'read': 'tasks.view',
    'update': 'tasks.edit',
    'delete': 'tasks.delete',
    'assign': 'tasks.assign'
  };
  const key = permMap[action];

  // Global check
  if (hasPermission(user, key)) return true;

  // Self check
  if (task.assigneeId === user.id) return true;

  // Team scope check
  if (task.teamId && hasPermission(user, key, { type: 'team', id: task.teamId })) {
    return true;
  }

  // Bubble up parent
  if (task.parentId) {
    const parentTask = await prisma.task.findUnique({
      where: { id: task.parentId },
      select: { id: true, assigneeId: true, teamId: true, tenantId: true, parentId: true }
    });
    if (parentTask) {
      return canAccessTask(user, parentTask, action);
    }
  }

  return false;
}

export async function canAccessUserDirectory(
  user: UserWithPermissions,
  scope: 'own' | 'team' | 'all'
): Promise<boolean> {
  return hasPermission(user, 'users.view');
}

export async function logAdminAction(params: {
  request: Request;
  user: UserWithPermissions;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const tenantId = params.request.headers.get('x-tenant-id') ?? params.user.tenantId;
    if (!tenantId) return;

    await prisma.activityLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        tenantId,
        userId: params.user.id,
        metadata: {
          role: getEffectiveRole(params.user),
          path: new URL(params.request.url).pathname,
          method: params.request.method,
          ...params.metadata,
        },
      },
    });
  } catch (error) {
    console.error('[authorization] failed to log admin action', error);
  }
}
