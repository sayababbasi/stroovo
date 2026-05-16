import prisma from '@/lib/prisma';
import { teamEventBus } from '@/events/team-events';

// ──────────────────────────────────────
// TeamService — Core Team Business Logic
// ──────────────────────────────────────

export class TeamService {
  /**
   * Create a new team.
   */
  public static async createTeam(
    data: { name: string; description?: string },
    userId: string,
    tenantId: string
  ) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Team name is required');
    }

    const team = await prisma.team.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        tenantId,
        members: {
          create: {
            userId: userId,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      },
    });

    await teamEventBus.emitTeamEvent({
      type: 'TEAM_CREATED',
      teamId: team.id,
      userId,
      tenantId,
      timestamp: new Date(),
      data: { name: team.name, description: team.description || undefined },
    });

    await this.logActivity('TEAM_CREATE', 'TEAM', team.id, { name: team.name }, tenantId, userId);

    return team;
  }

  /**
   * Get all teams for a tenant.
   */
  public static async getTeams(tenantId: string, include?: string) {
    const includeSpaces = include?.includes('spaces');
    const includeLists = include?.includes('lists');
    return (prisma as any).team.findMany({
      where: { tenantId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true, isActive: true },
            },
          },
        },
        spaces: includeSpaces ? {
          include: {
            lists: includeLists ? true : undefined,
            _count: { select: { lists: true } }
          }
        } : undefined,
        _count: { select: { members: true, tasks: true, spaces: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single team with full details.
   */
  public static async getTeamById(teamId: string, tenantId: string) {
    const team = await (prisma as any).team.findFirst({
      where: { id: teamId, tenantId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true, name: true, email: true, image: true, isActive: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, image: true } },
            assignments: { include: { user: { select: { id: true, name: true, image: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { members: true, tasks: true } },
      },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    return team;
  }

  /**
   * Update a team's name/description.
   */
  public static async updateTeam(
    teamId: string,
    data: { name?: string; description?: string },
    userId: string,
    tenantId: string
  ) {
    const existing = await prisma.team.findFirst({ where: { id: teamId, tenantId } });
    if (!existing) throw new Error('Team not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;

    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      },
    });

    await teamEventBus.emitTeamEvent({
      type: 'TEAM_UPDATED',
      teamId,
      userId,
      tenantId,
      timestamp: new Date(),
      data: { field: 'details', oldValue: existing.name, newValue: team.name },
    });

    await this.logActivity('TEAM_UPDATE', 'TEAM', teamId, { changes: data }, tenantId, userId);

    return team;
  }

  /**
   * Delete a team.
   */
  public static async deleteTeam(teamId: string, userId: string, tenantId: string) {
    const existing = await prisma.team.findFirst({ where: { id: teamId, tenantId } });
    if (!existing) throw new Error('Team not found');

    await prisma.team.delete({ where: { id: teamId } });

    await teamEventBus.emitTeamEvent({
      type: 'TEAM_DELETED',
      teamId,
      userId,
      tenantId,
      timestamp: new Date(),
      data: { name: existing.name },
    });

    await this.logActivity('TEAM_DELETE', 'TEAM', teamId, { name: existing.name }, tenantId, userId);

    return { success: true };
  }

  // ── Member Management ────────────────

  /**
   * List members of a team with their workload data.
   */
  public static async getMembers(teamId: string, tenantId: string) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, tenantId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!team) throw new Error('Team not found');

    // Enrich with task counts
    const memberIds = team.members.map(m => m.userId);
    const taskCounts = await prisma.task.groupBy({
      by: ['assigneeId', 'status'],
      where: { assigneeId: { in: memberIds } },
      _count: true,
    });

    return team.members.map(member => {
      const memberTasks = taskCounts.filter(tc => tc.assigneeId === member.userId);
      const activeTasks = memberTasks.filter(tc => tc.status !== 'DONE').reduce((s, tc) => s + tc._count, 0);
      const completedTasks = memberTasks.filter(tc => tc.status === 'DONE').reduce((s, tc) => s + tc._count, 0);
      const totalTasks = activeTasks + completedTasks;

      return {
        ...member,
        activeTasks,
        completedTasks,
        totalTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    });
  }

  /**
   * Add a member to a team.
   */
  public static async addMember(teamId: string, userId: string, role: string = 'MEMBER', requestingUserId: string, tenantId: string) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, tenantId },
      include: { members: { select: { userId: true } } },
    });
    if (!team) throw new Error('Team not found');

    // Prevent duplicates
    if (team.members.some(m => m.userId === userId)) {
      throw new Error('User is already a member of this team');
    }

    // Validate user belongs to same tenant
    const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new Error('User not found in this tenant');

    const newMember = await prisma.teamMember.create({
      data: {
        teamId: teamId,
        userId: userId,
        role: role
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    await teamEventBus.emitTeamEvent({
      type: 'MEMBER_ADDED',
      teamId,
      userId: requestingUserId,
      tenantId,
      timestamp: new Date(),
      data: { memberId: userId, memberName: user.name || user.email, role: role },
    });

    await this.logActivity('MEMBER_ADD', 'TEAM', teamId, { memberId: userId, memberName: user.name, role: role }, tenantId, requestingUserId);

    return { success: true, member: newMember };
  }

  /**
   * Update member role.
   */
  public static async updateMemberRole(teamId: string, userId: string, role: string, requestingUserId: string, tenantId: string) {
    const team = await prisma.team.findFirst({ where: { id: teamId, tenantId } });
    if (!team) throw new Error('Team not found');

    const member = await prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { role }
    });

    await teamEventBus.emitTeamEvent({
      type: 'MEMBER_UPDATED',
      teamId,
      userId: requestingUserId,
      tenantId,
      timestamp: new Date(),
      data: { memberId: userId, field: 'role', newValue: role },
    });

    return member;
  }

  /**
   * Remove a member from a team.
   */
  public static async removeMember(teamId: string, memberId: string, requestingUserId: string, tenantId: string) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, tenantId },
      include: {
        members: {
          where: { userId: memberId },
          include: { user: { select: { name: true } } }
        }
      },
    });
    if (!team || team.members.length === 0) throw new Error('User is not a member of this team');

    const memberName = team.members[0].user.name;

    await prisma.$transaction(async (tx) => {
      // Remove team member record
      await tx.teamMember.delete({
        where: { teamId_userId: { teamId, userId: memberId } },
      });

      // Unassign from team-scoped tasks
      await tx.taskAssignment.deleteMany({
        where: {
          userId: memberId,
          task: { teamId },
        },
      });

      // Clear primary assignee on team tasks
      await tx.task.updateMany({
        where: { teamId, assigneeId: memberId },
        data: { assigneeId: null },
      });
    });

    await teamEventBus.emitTeamEvent({
      type: 'MEMBER_REMOVED',
      teamId,
      userId: requestingUserId,
      tenantId,
      timestamp: new Date(),
      data: { memberId, memberName: memberName || '' },
    });

    await this.logActivity('MEMBER_REMOVE', 'TEAM', teamId, { memberId, memberName: memberName }, tenantId, requestingUserId);

    return { success: true };
  }

  // ── Helper ───────────────────────────

  private static async logActivity(
    action: string,
    entity: string,
    entityId: string,
    metadata: Record<string, any>,
    tenantId: string,
    userId: string
  ) {
    try {
      await prisma.activityLog.create({
        data: { action, entity, entityId, metadata, tenantId, userId },
      });
    } catch (err) {
      console.error('[TeamService] Activity log failed:', err);
    }
  }
}
