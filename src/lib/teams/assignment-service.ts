import prisma from '@/lib/prisma';
import { teamEventBus } from '@/events/team-events';
import { taskEventBus, TaskEventFactory } from '@/events/task-events';

// ──────────────────────────────────────
// AssignmentService
// Handles multi-assignee task logic + history.
// ──────────────────────────────────────

export class AssignmentService {
  /**
   * Assign one or more users to a task.
   */
  public static async assignUsers(
    taskId: string,
    userIds: string[],
    assignedBy: string,
    tenantId?: string
  ) {
    if (!userIds || userIds.length === 0) {
      throw new Error('At least one user ID is required');
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: { select: { userId: true } },
        team: { include: { members: { select: { userId: true } } } },
      },
    });

    if (!task) throw new Error('Task not found');

    // If task belongs to a team, validate membership
    if (task.team) {
      const teamMemberIds = task.team.members.map(m => m.userId);
      const invalidUsers = userIds.filter(uid => !teamMemberIds.includes(uid));
      if (invalidUsers.length > 0) {
        throw new Error(`Users [${invalidUsers.join(', ')}] are not members of this team`);
      }
    }

    // Filter out already-assigned
    const existingAssigneeIds = task.assignments.map(a => a.userId);
    const newUserIds = userIds.filter(uid => !existingAssigneeIds.includes(uid));

    if (newUserIds.length === 0) {
      return { message: 'All users are already assigned', assignments: task.assignments };
    }

    // Create assignments and history
    const results = await prisma.$transaction(async (tx) => {
      const created = await Promise.all(
        newUserIds.map(userId =>
          tx.taskAssignment.create({
            data: { taskId, userId, assignedBy },
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          })
        )
      );

      // Create history records
      await Promise.all(
        newUserIds.map(userId =>
          tx.taskAssignmentHistory.create({
            data: {
              taskId,
              userId,
              action: 'ASSIGNED',
              performedBy: assignedBy
            }
          })
        )
      );

      // Set primary assignee to first assignee if none exists
      if (!task.assigneeId && newUserIds.length > 0) {
        await tx.task.update({
          where: { id: taskId },
          data: { assigneeId: newUserIds[0] },
        });
      }

      return created;
    });

    // Emit events
    for (const uid of newUserIds) {
      const assignEvent = TaskEventFactory.createTaskAssignedEvent(
        taskId,
        assignedBy,
        uid,
        undefined,
        assignedBy,
        task.priority,
        task.dueDate || undefined,
        tenantId
      );
      await taskEventBus.emitTaskEvent(assignEvent);
    }

    if (task.teamId) {
      await teamEventBus.emitTeamEvent({
        type: 'TEAM_TASK_ASSIGNED',
        teamId: task.teamId,
        userId: assignedBy,
        tenantId,
        timestamp: new Date(),
        data: { taskId, assigneeIds: newUserIds, assignedBy },
      });
    }

    return { success: true, assignments: results };
  }

  /**
   * Reassign a task (clear current and set new).
   */
  public static async reassignTask(
    taskId: string,
    newUserId: string,
    performedBy: string,
    tenantId?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // Get current assignments
      const current = await tx.taskAssignment.findMany({ where: { taskId } });
      
      // Delete all current assignments
      if (current.length > 0) {
        await tx.taskAssignment.deleteMany({ where: { taskId } });
        
        // Log unassignments in history
        await Promise.all(current.map(a => 
          tx.taskAssignmentHistory.create({
            data: { taskId, userId: a.userId, action: 'UNASSIGNED', performedBy }
          })
        ));
      }

      // Create new assignment
      const newAssign = await tx.taskAssignment.create({
        data: { taskId, userId: newUserId, assignedBy: performedBy },
        include: { user: { select: { id: true, name: true } } }
      });

      // Log new assignment as REASSIGNED
      await tx.taskAssignmentHistory.create({
        data: { taskId, userId: newUserId, action: 'REASSIGNED', performedBy }
      });

      // Update primary assignee
      await tx.task.update({
        where: { id: taskId },
        data: { assigneeId: newUserId }
      });

      return newAssign;
    });
  }

  /**
   * Get all assignees for a task.
   */
  public static async getAssignees(taskId: string) {
    return prisma.taskAssignment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            title: true
          }
        }
      },
      orderBy: { assignedAt: 'asc' }
    });
  }

  /**
   * Get assignment history.
   */
  public static async getAssignmentHistory(taskId: string) {
    return prisma.taskAssignmentHistory.findMany({
      where: { taskId },
      orderBy: { timestamp: 'desc' }
    });
  }

  /**
   * Remove a user from a task assignment.
   */
  public static async removeAssignee(taskId: string, userId: string, performedBy: string) {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.taskAssignment.delete({
        where: { taskId_userId: { taskId, userId } },
      });

      // Log in history
      await tx.taskAssignmentHistory.create({
        data: { taskId, userId, action: 'UNASSIGNED', performedBy }
      });

      // If this was the primary assignee, reassign
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (task && task.assigneeId === userId) {
        const nextAssignment = await tx.taskAssignment.findFirst({
          where: { taskId },
          orderBy: { assignedAt: 'asc' },
        });
        await tx.task.update({
          where: { id: taskId },
          data: { assigneeId: nextAssignment?.userId || null },
        });
      }
    });

    return { success: true };
  }
}
