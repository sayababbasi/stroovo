import prisma from '@/lib/prisma';
import { WorkloadEngine } from './workload-engine';
import { DecisionEngine } from './decision-engine';

// ──────────────────────────────────────
// TeamAutomationService
// Advanced logic for proactive team management.
// ──────────────────────────────────────

export interface TeamRisk {
  type: 'OVERLOAD' | 'OVERDUE' | 'BOTTLENECK' | 'LOW_EFFICIENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  affectedUserId?: string;
  affectedTaskIds?: string[];
  recommendation: string;
}

export class TeamAutomationService {
  /**
   * Detect risks in a team's workflow.
   */
  public static async detectRisks(teamId: string, tenantId: string) {
    const workload = await WorkloadEngine.calculateTeamWorkload(teamId, tenantId);
    const risks: TeamRisk[] = [];

    for (const member of workload.members) {
      // 1. Overload Detection
      if (member.status === 'high' || member.workloadPercentage >= 90) {
        risks.push({
          type: 'OVERLOAD',
          severity: member.workloadPercentage > 100 ? 'CRITICAL' : 'HIGH',
          message: `${member.userName} is heavily overloaded (${member.workloadPercentage}%).`,
          affectedUserId: member.userId,
          recommendation: 'Reassign some active tasks to members with lower workload.'
        });
      }

      // 2. Efficiency Risks
      if (member.efficiencyScore < 40 && member.activeTasks > 0) {
        risks.push({
          type: 'LOW_EFFICIENCY',
          severity: 'MEDIUM',
          message: `${member.userName} has a low efficiency score (${member.efficiencyScore}).`,
          affectedUserId: member.userId,
          recommendation: 'Check for blockers or provide support to improve completion rate.'
        });
      }

      // 3. Overdue Risks
      if (member.overdueTasks > 2) {
        risks.push({
          type: 'OVERDUE',
          severity: member.overdueTasks > 5 ? 'HIGH' : 'MEDIUM',
          message: `${member.userName} has ${member.overdueTasks} overdue tasks.`,
          affectedUserId: member.userId,
          recommendation: 'Prioritize overdue items or adjust due dates.'
        });
      }
    }

    // 4. Bottleneck Detection
    const totalActiveTasks = workload.members.reduce((sum, m) => sum + m.activeTasks, 0);
    if (totalActiveTasks > 0) {
        const topMember = [...workload.members].sort((a, b) => b.activeTasks - a.activeTasks)[0];
        const concentration = topMember.activeTasks / totalActiveTasks;
        if (concentration > 0.6 && workload.members.length > 2) {
            risks.push({
                type: 'BOTTLENECK',
                severity: 'HIGH',
                message: `Task concentration is too high on ${topMember.userName} (${Math.round(concentration * 100)}% of team work).`,
                affectedUserId: topMember.userId,
                recommendation: 'Distribute tasks more evenly across the team to prevent single-point-of-failure.'
            });
        }
    }

    return risks;
  }

  /**
   * Suggest optimizations for a team.
   */
  public static async optimizeTeam(teamId: string, tenantId: string) {
    const risks = await this.detectRisks(teamId, tenantId);
    const suggestions = [];

    for (const risk of risks) {
        if (risk.type === 'OVERLOAD' || risk.type === 'BOTTLENECK') {
            // Find a task to reassign
            const taskToReassign = await prisma.task.findFirst({
                where: { 
                    teamId, 
                    assigneeId: risk.affectedUserId,
                    status: { not: 'DONE' }
                },
                orderBy: { priority: 'desc' } // Keep high priority for the current member? Or move low priority?
            });

            if (taskToReassign) {
                try {
                    const bestCandidate = await DecisionEngine.getBestAssignee(taskToReassign.id, teamId, tenantId);
                    if (bestCandidate.userId !== risk.affectedUserId) {
                        suggestions.push({
                            taskId: taskToReassign.id,
                            taskTitle: taskToReassign.title,
                            fromUserId: risk.affectedUserId,
                            toUserId: bestCandidate.userId,
                            toUserName: bestCandidate.userName,
                            reason: `Optimizing ${risk.type.toLowerCase()}: ${risk.message}`,
                            score: bestCandidate.score
                        });
                    }
                } catch (e) {
                    // Skip if no candidate found
                }
            }
        }
    }

    return suggestions;
  }

  /**
   * Automatically rebalance workload if "Auto Action" is enabled.
   */
  public static async rebalanceWorkload(teamId: string, tenantId: string, performedBy: string) {
    const optimizations = await this.optimizeTeam(teamId, tenantId);
    const results = [];

    for (const opt of optimizations) {
        // Only rebalance if the suggestion is strong
        if (opt.score > 70) {
            const { AssignmentService } = await import('./assignment-service');
            await AssignmentService.reassignTask(opt.taskId, opt.toUserId, performedBy, tenantId);
            results.push({
                taskId: opt.taskId,
                reassignedTo: opt.toUserName,
                reason: opt.reason
            });
        }
    }

    return {
        rebalancedCount: results.length,
        actions: results
    };
  }
}
