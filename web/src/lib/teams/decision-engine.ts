import prisma from '@/lib/prisma';
import { WorkloadEngine } from './workload-engine';
import { teamEventBus } from '@/events/team-events';

// ──────────────────────────────────────
// DecisionEngine
// Deterministic logic for task assignment optimization.
// ──────────────────────────────────────

export interface AssignmentSuggestion {
  userId: string;
  userName: string;
  score: number;
  reason: string;
}

export class DecisionEngine {
  // Configurable weights for the scoring model
  private static readonly WEIGHTS = {
    WORKLOAD: 0.4,       // 40% weight to low workload
    EFFICIENCY: 0.4,     // 40% weight to high efficiency/completion
    OVERDUE: 0.2         // 20% penalty for overdue tasks
  };

  /**
   * Find the best assignee for a task within a team.
   */
  public static async getBestAssignee(taskId: string, teamId: string, tenantId: string): Promise<AssignmentSuggestion> {
    const workloadData = await WorkloadEngine.calculateTeamWorkload(teamId, tenantId);
    
    if (workloadData.members.length === 0) {
      throw new Error('No members in team to assign');
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { priority: true }
    });

    const suggestions: AssignmentSuggestion[] = workloadData.members.map(member => {
      // 1. Workload Score (Inverse of workload percentage)
      const workloadScore = 100 - member.workloadPercentage;

      // 2. Efficiency Score (From WorkloadEngine)
      const efficiencyScore = member.efficiencyScore;

      // 3. Overdue Penalty
      const overduePenalty = (1 - member.overdueRatio) * 100;

      // Calculate base score
      let finalScore = (workloadScore * this.WEIGHTS.WORKLOAD) + 
                       (efficiencyScore * this.WEIGHTS.EFFICIENCY) + 
                       (overduePenalty * this.WEIGHTS.OVERDUE);

      // Priority Adjustment: If task is URGENT, favor high efficiency even more
      if (task?.priority === 'URGENT') {
        finalScore = (finalScore * 0.7) + (efficiencyScore * 0.3);
      }

      // Generate human-readable reason
      let reason = "Balanced workload and good performance";
      if (member.workloadPercentage < 20 && member.efficiencyScore > 80) {
        reason = "Very low workload + exceptional efficiency";
      } else if (member.workloadPercentage < 50 && member.overdueTasks === 0) {
        reason = "Available bandwidth + no overdue tasks";
      } else if (member.efficiencyScore > 90) {
        reason = "Highest team performer";
      } else if (member.workloadPercentage === 0) {
        reason = "Currently idle (best candidate for immediate start)";
      }

      return {
        userId: member.userId,
        userName: member.userName,
        score: Math.round(finalScore),
        reason
      };
    });

    // Sort by score descending
    suggestions.sort((a, b) => b.score - a.score);

    const best = suggestions[0];

    // Fallback: If score is too low, pick the least loaded user regardless of efficiency
    if (best.score < 30) {
      const leastLoaded = workloadData.members.sort((a, b) => a.activeTasks - b.activeTasks)[0];
      return {
        userId: leastLoaded.userId,
        userName: leastLoaded.userName,
        score: best.score,
        reason: "Fallback: Member with least active tasks"
      };
    }

    await teamEventBus.emitTeamEvent({
      type: 'TASK_SUGGESTED',
      teamId,
      userId: 'SYSTEM',
      tenantId,
      timestamp: new Date(),
      data: { taskId, suggestedUserId: best.userId, score: best.score }
    });

    return best;
  }

  /**
   * Automatically assign a task to the best candidate.
   */
  public static async autoAssign(taskId: string, teamId: string, tenantId: string, performedBy: string) {
    const best = await this.getBestAssignee(taskId, teamId, tenantId);

    const { AssignmentService } = await import('./assignment-service');
    
    await AssignmentService.assignUsers(taskId, [best.userId], performedBy, tenantId);

    await prisma.task.update({
      where: { id: taskId },
      data: { aiInsights: { autoAssigned: true, score: best.score, reason: best.reason } as any }
    });

    return {
      taskId,
      assignedTo: best.userId,
      userName: best.userName,
      score: best.score,
      reason: best.reason
    };
  }
}
