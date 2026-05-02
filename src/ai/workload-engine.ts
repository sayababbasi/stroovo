import prisma from '@/lib/prisma';
import { taskEventBus } from '@/events/task-events';

// Define enums locally since they're not exported from Prisma client
enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface WorkloadAnalysis {
  userId: string;
  activeTaskCount: number;
  urgentTaskCount: number;
  utilizationRate: number; // 0 - 100+
  status: 'UNDERUTILIZED' | 'OPTIMAL' | 'OVERLOADED';
  recommendations: string[];
}

export class WorkloadEngine {
  // Configurable thresholds
  private static readonly OPTIMAL_MAX_TASKS = 5;
  private static readonly MAX_URGENT_TASKS = 2;

  /**
   * Evaluates the workload for a specific user.
   */
  public static async evaluateUserWorkload(userId: string): Promise<WorkloadAnalysis> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: {
          where: {
            status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW] }
          }
        }
      }
    });

    if (!user) throw new Error('User not found');

    const activeTasks = user.tasks;
    const activeTaskCount = activeTasks.length;
    const urgentTaskCount = activeTasks.filter(t => t.priority === TaskPriority.URGENT || t.priority === TaskPriority.HIGH).length;

    // Simple heuristic for utilization: each task adds 20%, urgent tasks add +10%
    let utilizationRate = (activeTaskCount * 20) + (urgentTaskCount * 10);
    
    let status: 'UNDERUTILIZED' | 'OPTIMAL' | 'OVERLOADED' = 'OPTIMAL';
    const recommendations: string[] = [];

    if (utilizationRate >= 100 || activeTaskCount > this.OPTIMAL_MAX_TASKS || urgentTaskCount > this.MAX_URGENT_TASKS) {
      status = 'OVERLOADED';
      recommendations.push(`Reassign at least ${Math.max(1, activeTaskCount - this.OPTIMAL_MAX_TASKS)} tasks to other team members.`);
      if (urgentTaskCount > this.MAX_URGENT_TASKS) {
        recommendations.push(`High risk: User has ${urgentTaskCount} urgent/high priority tasks. Distribute critical tasks.`);
      }
    } else if (utilizationRate <= 40) {
      status = 'UNDERUTILIZED';
      recommendations.push('Capacity available. Can take on more tasks.');
    } else {
      recommendations.push('Workload is currently optimal.');
    }

    // You could optionally store this in a UserWorkload table or fire a notification event
    if (status === 'OVERLOADED') {
       // In a real enterprise system, we'd fire an internal event or notification here.
       console.log(`[WorkloadEngine] WARNING: User ${user.name} is overloaded.`);
    }

    return {
      userId,
      activeTaskCount,
      urgentTaskCount,
      utilizationRate,
      status,
      recommendations
    };
  }

  /**
   * Suggests the best assignee for a task based on current workload.
   */
  public static async suggestAssignee(teamId?: string): Promise<{userId: string, name: string} | null> {
    // In a complete system, we'd filter by team. For now, fetch all active users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        tasks: {
          where: {
            status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW] }
          }
        }
      }
    });

    if (users.length === 0) return null;

    // Map users to their task count and sort ascending
    const workloads = users.map(u => {
      const activeTaskCount = u.tasks.length;
      const urgentTaskCount = u.tasks.filter(t => t.priority === TaskPriority.URGENT).length;
      return {
        user: { userId: u.id, name: u.name || 'Unknown' },
        score: (activeTaskCount * 10) + (urgentTaskCount * 20)
      };
    });

    workloads.sort((a, b) => a.score - b.score);

    // Return the user with the lowest score (most capacity)
    return workloads[0].user;
  }
}
