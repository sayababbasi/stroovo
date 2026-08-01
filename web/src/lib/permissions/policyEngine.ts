import { PrismaClient, User } from '@prisma/client';
import { UserWithPermissions } from '../authorization';

const prisma = new PrismaClient();

export interface PolicyEvaluationResult {
  granted: boolean;
  reason?: string;
}

export async function evaluateAccessPolicies(
  user: UserWithPermissions,
  request: Request,
  permissionKey: string // e.g. 'users.view'
): Promise<PolicyEvaluationResult> {
  
  // 1. Parse resource from permissionKey
  // Assuming format `resource.action`
  const parts = permissionKey.split('.');
  const resource = parts[0];
  const action = parts.length > 1 ? parts.slice(1).join('.') : '*';

  // Extract user contextual IPs and teams/roles
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  
  const teamIds = user.teamMembers?.map((tm: any) => tm.teamId) || [];
  const roleIds = [user.roleId, ...(user.additionalRoles?.map((ar: any) => ar.roleId) || [])].filter(Boolean);

  // 2. Fetch Active Policies that might apply
  const activePolicies = await prisma.accessPolicy.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { appliesToAll: true },
        { users: { some: { userId: user.id } } },
        { roles: { some: { roleId: { in: roleIds as string[] } } } },
        { teams: { some: { teamId: { in: teamIds } } } }
      ],
      resources: {
        some: {
          resource: { in: [resource, '*'] }
        }
      }
    },
    include: {
      exceptions: true
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  // If no policies apply, we default to ALLOW (since RBAC already granted access)
  if (activePolicies.length === 0) {
    return { granted: true };
  }

  // 3. Evaluate policies
  for (const policy of activePolicies) {
    
    // Check Exceptions first
    const isException = policy.exceptions.some(ex => 
      (ex.userId === user.id) || 
      (ex.roleId && roleIds.includes(ex.roleId)) ||
      (ex.teamId && teamIds.includes(ex.teamId))
    );

    if (isException) {
      continue; // Skip this policy
    }

    // Check actions
    const policyAppliesToAction = policy.actions.length === 0 || policy.actions.includes('*') || policy.actions.includes(action);
    if (!policyAppliesToAction) {
      continue;
    }

    // Check Conditions
    
    // IP Condition
    if (policy.blockedIps.length > 0 && policy.blockedIps.includes(ip)) {
      return { granted: false, reason: `Blocked by Policy: ${policy.name} (IP Address)` };
    }
    if (policy.allowedIps.length > 0 && !policy.allowedIps.includes(ip)) {
      return { granted: false, reason: `Blocked by Policy: ${policy.name} (IP not allowed)` };
    }

    // MFA Condition
    if (policy.mfaRequired === 'REQUIRED' && !user.twoFactorEnabled) {
      return { granted: false, reason: `Blocked by Policy: ${policy.name} (MFA Required)` };
    }

    // Time Condition (Basic evaluation)
    if (policy.allowedDays.length > 0 || policy.startTime || policy.endTime) {
      const now = new Date();
      // UTC day (0-6)
      const day = now.getUTCDay(); 
      if (policy.allowedDays.length > 0 && !policy.allowedDays.includes(day)) {
        return { granted: false, reason: `Blocked by Policy: ${policy.name} (Outside allowed days)` };
      }
      
      // Basic Time check (ignoring timezone complexities for this scope, assuming UTC for simplicity)
      const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      if (policy.startTime) {
        const [h, m] = policy.startTime.split(':').map(Number);
        if (currentMinutes < h * 60 + m) return { granted: false, reason: `Blocked by Policy: ${policy.name} (Before start time)` };
      }
      if (policy.endTime) {
        const [h, m] = policy.endTime.split(':').map(Number);
        if (currentMinutes > h * 60 + m) return { granted: false, reason: `Blocked by Policy: ${policy.name} (After end time)` };
      }
    }

    // Expiration Dates
    const nowMs = Date.now();
    if (policy.startDate && nowMs < policy.startDate.getTime()) {
      continue; // Not active yet
    }
    if (policy.endDate && nowMs > policy.endDate.getTime()) {
      continue; // Expired
    }

    // If we reach here, the policy conditions matched.
    if (policy.effect === 'DENY') {
      return { granted: false, reason: `Explicit Deny by Policy: ${policy.name}` };
    }
    
    if (policy.readOnly && !action.includes('view') && !action.includes('read')) {
      return { granted: false, reason: `Policy enforces Read-Only access: ${policy.name}` };
    }
  }

  return { granted: true };
}
