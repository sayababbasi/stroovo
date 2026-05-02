import { prisma } from '@/lib/prisma';
import { TeamAutomationService } from './automation-service';
import { AssignmentService } from './assignment-service';
import { teamEventBus } from '@/events/team-events';

export class AutoExecutionService {
  /**
   * Run the semi-autonomous engine for a team.
   */
  public static async runAutoPilot(teamId: string, tenantId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { tasks: true }
    });

    if (!team || team.autoMode === 'OFF') return { status: 'SKIPPED', reason: 'Auto-pilot is disabled' };

    console.log(`[AutoPilot] Running for team: ${team.name} (Mode: ${team.autoMode})`);

    // 1. Detect Risks
    const risks = await TeamAutomationService.detectRisks(teamId, tenantId);
    if (risks.length === 0) return { status: 'IDLE', message: 'No risks detected' };

    // 2. Get Optimization Suggestions
    const suggestions = await TeamAutomationService.optimizeTeam(teamId, tenantId);

    const executions = [];

    // 3. Process suggestions based on rules
    for (const suggestion of suggestions) {
      // RULE: Only auto-execute if score is high (>80) or if in FULL AUTO mode
      const shouldExecute = team.autoMode === 'AUTO' || (team.autoMode === 'SUGGEST' && suggestion.score >= 90);

      if (shouldExecute) {
        const execution = await this.executeAssignment(suggestion, teamId, tenantId);
        executions.push(execution);
      }
    }

    return {
      status: 'COMPLETED',
      executions,
      riskCount: risks.length,
      suggestionCount: suggestions.length
    };
  }

  /**
   * Execute a specific assignment optimization with safety checks.
   */
  private static async executeAssignment(suggestion: any, teamId: string, tenantId: string) {
    try {
      // SAFETY CHECK: Don't override if task was manually assigned by Admin recently
      // (This would require a TaskAssignmentHistory check, but for now we'll check recent history)
      const recentAssignment = await prisma.taskAssignmentHistory.findFirst({
        where: { taskId: suggestion.taskId },
        orderBy: { timestamp: 'desc' }
      });

      if (recentAssignment && recentAssignment.performedBy !== 'SYSTEM_AUTO' && 
          (new Date().getTime() - recentAssignment.timestamp.getTime() < 3600000)) {
        return { taskId: suggestion.taskId, status: 'BLOCKED', reason: 'Manual override safety (assigned recently)' };
      }

      // Record BEFORE state
      const beforeState = { assigneeId: suggestion.fromUserId };

      // EXECUTE
      await AssignmentService.assignUsers(
        suggestion.taskId, 
        [suggestion.toUserId], 
        'SYSTEM_AUTO', 
        tenantId
      );

      // Record AFTER state
      const afterState = { assigneeId: suggestion.toUserId };

      // LOG EXECUTION
      const log = await prisma.autoActionLog.create({
        data: {
          teamId,
          actionType: 'REASSIGN',
          reason: suggestion.reason,
          details: { 
            taskId: suggestion.taskId, 
            taskTitle: suggestion.taskTitle,
            score: suggestion.score 
          },
          beforeState,
          afterState,
          undoData: { taskId: suggestion.taskId, originalAssigneeId: suggestion.fromUserId }
        }
      });

      await teamEventBus.emitTeamEvent({
        type: 'TEAM_ACTION_EXECUTED',
        teamId,
        userId: 'SYSTEM_AUTO',
        tenantId,
        timestamp: new Date(),
        data: { action: 'AUTO_REASSIGN', logId: log.id, taskTitle: suggestion.taskTitle }
      });

      return { taskId: suggestion.taskId, status: 'SUCCESS', logId: log.id };
    } catch (error: any) {
      console.error(`[AutoPilot] Execution failed for task ${suggestion.taskId}:`, error);
      return { taskId: suggestion.taskId, status: 'FAILED', error: error.message };
    }
  }

  /**
   * Rollback an autonomous action.
   */
  public static async rollbackAction(logId: string, tenantId: string) {
    const log = await prisma.autoActionLog.findUnique({ where: { id: logId } });
    if (!log || log.isUndone) throw new Error('Action not found or already undone');

    const undoData: any = log.undoData;
    if (!undoData || !undoData.taskId) throw new Error('Invalid undo data');

    // Revert assignment
    await AssignmentService.assignUsers(
      undoData.taskId,
      undoData.originalAssigneeId ? [undoData.originalAssigneeId] : [],
      'SYSTEM_ROLLBACK',
      tenantId
    );

    // Mark as undone
    await prisma.autoActionLog.update({
      where: { id: logId },
      data: { isUndone: true }
    });

    return { status: 'SUCCESS', taskId: undoData.taskId };
  }
}
