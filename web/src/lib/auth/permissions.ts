import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Permission, Role, Task, User } from '@prisma/client';

export type EffectiveRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EXECUTIVE'
  | 'MANAGER'
  | 'TEAM_LEAD'
  | 'MEMBER';

type UserWithPermissions = User & {
  systemRole: (Role & { permissions: Array<{ permission: Permission }> }) | null;
};

type PermissionContext = {
  user: UserWithPermissions;
  effectiveRole: EffectiveRole;
  permissionKeys: string[];
};

type PermissionResult = NextResponse | PermissionContext;

const DEFAULT_ROLE_PERMISSIONS: Record<EffectiveRole, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['*'],
  EXECUTIVE: [
    'analytics.read',
    'projects.read',
    'tasks.read.all',
    'teams.read',
    'users.read.all',
    'system.logs.read',
    'ai.use',
  ],
  MANAGER: [
    'analytics.read',
    'projects.read',
    'projects.update',
    'tasks.create',
    'tasks.read.all',
    'tasks.update.all',
    'tasks.assign',
    'teams.read',
    'teams.manage',
    'users.read.all',
    'ai.use',
  ],
  TEAM_LEAD: [
    'projects.read',
    'tasks.create',
    'tasks.read.team',
    'tasks.read.own',
    'tasks.update.team',
    'tasks.update.own',
    'tasks.assign.team',
    'teams.read',
    'users.read.team',
    'ai.use',
  ],
  MEMBER: [
    'projects.read',
    'tasks.create',
    'tasks.read.own',
    'tasks.update.own',
    'users.read.own',
    'ai.use',
  ],
};

function normalizeRoleName(roleName?: string | null): EffectiveRole | null {
  if (!roleName) return null;

  const normalized = roleName.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const aliasMap: Record<string, EffectiveRole> = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    CEO: 'ADMIN',
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

function getDerivedPermissions(role: EffectiveRole): string[] {
  const base = DEFAULT_ROLE_PERMISSIONS[role] ?? [];
  const expanded = new Set<string>(base);

  for (const permission of base) {
    const parts = permission.split('.');
    if (parts.length < 2) continue;

    const [resource, action, scope] = parts;
    if (scope === 'all') {
      expanded.add(`${resource}.${action}`);
      expanded.add(`${resource}.${action}.team`);
      expanded.add(`${resource}.${action}.own`);
    } else if (scope === 'team') {
      expanded.add(`${resource}.${action}`);
      expanded.add(`${resource}.${action}.own`);
    } else if (!scope) {
      expanded.add(`${resource}.${action}.own`);
    }
  }

  return Array.from(expanded);
}

function permissionVariants(permissionKey: string): string[] {
  const parts = permissionKey.split('.');
  if (parts.length < 2) return [permissionKey];

  const [resource, action, scope] = parts;
  if (!scope) {
    return [
      permissionKey,
      `${resource}.${action}.own`,
      `${resource}.${action}.team`,
      `${resource}.${action}.all`,
    ];
  }

  if (scope === 'own') {
    return [permissionKey, `${resource}.${action}`, `${resource}.${action}.team`, `${resource}.${action}.all`];
  }

  if (scope === 'team') {
    return [permissionKey, `${resource}.${action}`, `${resource}.${action}.all`];
  }

  return [permissionKey];
}

export function permissionSetForUser(user: UserWithPermissions): string[] {
  const effectiveRole = getEffectiveRole(user);
  const explicit = user.systemRole?.permissions.map((item) => item.permission.key) ?? [];
  return dedupe([...getDerivedPermissions(effectiveRole), ...explicit]);
}

export function hasPermission(user: UserWithPermissions | null | undefined, permissionKey: string): boolean {
  if (!user) return false;

  const permissions = permissionSetForUser(user);
  if (permissions.includes('*')) return true;

  return permissionVariants(permissionKey).some((candidate) => permissions.includes(candidate));
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      systemRole: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!user) return [];
  return permissionSetForUser(user);
}

async function loadUserFromRequest(request: Request): Promise<UserWithPermissions | null> {
  const userId = request.headers.get('x-user-id');
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      systemRole: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
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
    console.error('[permissions] failed to log security event', error);
  }
}

function forbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function requirePermission(permissionKey: string) {
  return async (request: Request): Promise<PermissionResult> => {
    const user = await loadUserFromRequest(request);
    if (!user || !user.isActive) {
      return unauthorized('Unauthorized');
    }

    if (!hasPermission(user, permissionKey)) {
      await logSecurityEvent(user, request, permissionKey, 'permission_missing');
      return forbidden('Forbidden: Insufficient permissions');
    }

    return {
      user,
      effectiveRole: getEffectiveRole(user),
      permissionKeys: permissionSetForUser(user),
    };
  };
}

export async function canAccessTask(
  user: UserWithPermissions,
  task: Pick<Task, 'id' | 'assigneeId' | 'teamId' | 'tenantId'> | null,
  action: 'read' | 'update' | 'delete' | 'assign'
): Promise<boolean> {
  if (!task) return false;
  if (hasPermission(user, `tasks.${action}.all`) || hasPermission(user, `tasks.${action}`)) return true;

  if (task.assigneeId === user.id && hasPermission(user, `tasks.${action}.own`)) {
    return true;
  }

  if (task.teamId && hasPermission(user, `tasks.${action}.team`)) {
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: task.teamId, userId: user.id },
    });
    if (membership) return true;
  }

  return false;
}

export async function canAccessUserDirectory(
  user: UserWithPermissions,
  scope: 'own' | 'team' | 'all'
): Promise<boolean> {
  return hasPermission(user, `users.read.${scope}`) || hasPermission(user, 'users.read');
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
    console.error('[permissions] failed to log admin action', error);
  }
}
