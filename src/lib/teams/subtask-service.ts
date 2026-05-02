import prisma from '@/lib/prisma';
import { taskEventBus } from '@/events/task-events';

// ──────────────────────────────────────
// SubTaskService
// Handles dedicated subtask logic.
// ──────────────────────────────────────

export class SubTaskService {
  /**
   * Create a subtask and update parent progress.
   */
  public static async createSubTask(taskId: string, title: string, tenantId?: string) {
    return await prisma.$transaction(async (tx) => {
      const subtask = await tx.subTask.create({
        data: {
          title,
          taskId
        }
      });

      // Update parent progress
      await this.syncParentProgress(taskId, tx);

      return subtask;
    });
  }

  /**
   * Toggle subtask completion.
   * Business Rule: Syncs parent task progress % automatically.
   */
  public static async toggleSubTask(subtaskId: string, isCompleted: boolean) {
    return await prisma.$transaction(async (tx) => {
      const subtask = await tx.subTask.update({
        where: { id: subtaskId },
        data: { isCompleted }
      });

      // Update parent progress
      await this.syncParentProgress(subtask.taskId, tx);

      // Emit event
      await taskEventBus.emitTaskEvent({
        type: 'TASK_UPDATED', // Reuse task updated for subtask changes
        taskId: subtask.taskId,
        userId: 'SYSTEM',
        timestamp: new Date(),
        data: {
          field: 'subtask_toggle',
          oldValue: !isCompleted,
          newValue: isCompleted,
          reason: `Subtask ${subtaskId} toggled`
        }
      });

      return subtask;
    });
  }

  /**
   * Sync parent task progress based on subtasks.
   */
  private static async syncParentProgress(taskId: string, tx: any) {
    const subtasks = await tx.subTask.findMany({
      where: { taskId }
    });

    if (subtasks.length === 0) return;

    const completed = subtasks.filter((s: any) => s.isCompleted).length;
    const progress = Math.round((completed / subtasks.length) * 100);

    await tx.task.update({
      where: { id: taskId },
      data: { progress }
    });
  }

  /**
   * Delete subtask.
   */
  public static async deleteSubTask(subtaskId: string) {
    return await prisma.$transaction(async (tx) => {
      const subtask = await tx.subTask.findUnique({ where: { id: subtaskId } });
      if (!subtask) return;

      await tx.subTask.delete({ where: { id: subtaskId } });
      await this.syncParentProgress(subtask.taskId, tx);
    });
  }
}
