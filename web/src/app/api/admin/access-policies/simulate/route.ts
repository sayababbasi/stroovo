import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getUserPermissions } from '@/lib/authorization';
import { evaluateAccessPolicies } from '@/lib/permissions/policyEngine';

export async function POST(request: Request) {
  const authResult = await requirePermission('teams.read.all')(request as any);
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json();
    const { userId, resource, action, context } = body;

    if (!userId || !resource || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Load the target user with all their relationships
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        systemRole: { include: { permissions: { include: { permission: true } } } },
        additionalRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        teamMembers: { include: { systemRole: { include: { permissions: { include: { permission: true } } } } } },
        projectAccesses: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const permissionKey = `${resource}.${action}`;

    // 1. Simulate RBAC Check
    // We normally use `hasPermission` but for the simulator we'll rely on our policies module or just call getPermissions directly
    const rbacPermissions = await getUserPermissions(userId);
    const rbacGranted = rbacPermissions.includes('*') || rbacPermissions.includes(permissionKey);

    // 2. Simulate Policy Engine Check
    // We construct a mock request object to inject simulated context like IP
    const mockRequest = new Request('http://localhost', {
      headers: new Headers({
        'x-forwarded-for': context?.ip || '127.0.0.1'
      })
    });

    const policyResult = await evaluateAccessPolicies(targetUser as any, mockRequest, permissionKey);

    const finalGranted = rbacGranted && policyResult.granted;

    return NextResponse.json({
      success: true,
      data: {
        granted: finalGranted,
        rbacGranted,
        policyGranted: policyResult.granted,
        reason: policyResult.reason || (rbacGranted ? 'Access Granted by RBAC and Policies' : 'Denied by RBAC (Missing Permission)'),
        simulatedPermission: permissionKey
      }
    });

  } catch (error: any) {
    console.error('[POST /api/admin/access-policies/simulate]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
