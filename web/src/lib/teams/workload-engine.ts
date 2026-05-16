import prisma from '@/lib/prisma';

// ──────────────────────────────────────
// WorkloadEngine (Upgraded)
// Calculates real-time workload and efficiency metrics.
// ──────────────────────────────────────

export interface MemberWorkload {
  userId: string;
  userName: string;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  efficiencyScore: number;
  workloadPercentage: number;
  status: 'low' | 'medium' | 'high';
  avgCompletionTimeHrs: number;
  overdueRatio: number;
}

export class WorkloadEngine {
  private static readonly HIGH_THRESHOLD = 8;
  private static readonly MEDIUM_THRESHOLD = 4;

  /**
   * Calculate detailed workload for a team.
   */
  public static async calculateTeamWorkload(teamId: string, tenantId: string) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, tenantId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
      },
    });

    if (!team) throw new Error('Team not found');

    const memberIds = team.members.map(m => m.userId);

    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: { in: memberIds } },
          { assignments: { some: { userId: { in: memberIds } } } },
        ],
      },
      select: { 
        status: true, 
        assigneeId: true, 
        dueDate: true, 
        createdAt: true, 
        updatedAt: true,
        assignments: { select: { userId: true } } 
      },
    });

    const memberWorkloads: MemberWorkload[] = team.members.map(member => {
      const memberTasks = tasks.filter(t =>
        t.assigneeId === member.userId ||
        t.assignments.some(a => a.userId === member.userId)
      );

      const activeTasks = memberTasks.filter(t => t.status !== 'DONE').length;
      const completedTasks = memberTasks.filter(t => t.status === 'DONE').length;
      
      const overdueTasks = memberTasks.filter(t => 
        t.status !== 'DONE' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      ).length;

      // Efficiency Calculation
      const completedTaskDetails = memberTasks.filter(t => t.status === 'DONE');
      let avgCompletionTimeHrs = 0;
      if (completedTaskDetails.length > 0) {
        const totalTime = completedTaskDetails.reduce((sum, t) => {
          const duration = t.updatedAt.getTime() - t.createdAt.getTime();
          return sum + (duration / (1000 * 60 * 60));
        }, 0);
        avgCompletionTimeHrs = totalTime / completedTaskDetails.length;
      }

      const overdueRatio = memberTasks.length > 0 ? overdueTasks / memberTasks.length : 0;
      
      // Efficiency score (0-100): High completion rate + Low overdue ratio
      const completionRate = memberTasks.length > 0 ? completedTasks / memberTasks.length : 1;
      let efficiencyScore = (completionRate * 70) + ((1 - overdueRatio) * 30);
      efficiencyScore = Math.round(Math.max(0, Math.min(100, efficiencyScore)));

      let status: 'low' | 'medium' | 'high' = 'low';
      if (activeTasks >= this.HIGH_THRESHOLD) status = 'high';
      else if (activeTasks >= this.MEDIUM_THRESHOLD) status = 'medium';

      return {
        userId: member.userId,
        userName: member.user.name || member.user.email,
        activeTasks,
        completedTasks,
        overdueTasks,
        efficiencyScore,
        avgCompletionTimeHrs: Math.round(avgCompletionTimeHrs * 10) / 10,
        overdueRatio: Math.round(overdueRatio * 100) / 100,
        workloadPercentage: Math.min(100, Math.round((activeTasks / this.HIGH_THRESHOLD) * 100)),
        status,
      };
    });

    const result = {
      teamId,
      teamName: team.name,
      members: memberWorkloads,
    };

    // Emit event for real-time updates
    const { teamEventBus } = await import('@/events/team-events');
    await teamEventBus.emitTeamEvent({
      type: 'WORKLOAD_CALCULATED',
      teamId,
      userId: 'SYSTEM_WORKLOAD',
      tenantId,
      timestamp: new Date(),
      data: {
        memberWorkloads: memberWorkloads.map(m => ({
          userId: m.userId,
          activeTasks: m.activeTasks,
          completedTasks: m.completedTasks,
          workloadPercentage: m.workloadPercentage
        }))
      }
    });

    return result;
  }
}
