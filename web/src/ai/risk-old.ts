export interface Risk {
  type: "DEADLINE" | "WORKLOAD" | "BLOCKED";
  level: RiskLevel;
  message: string;
  taskId?: string;
  userId?: string;
  suggestion: string;
}

export interface TaskRiskData {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: string;
  deadline?: string;
  dependencies?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface UserWorkloadData {
  userId: string;
  userName: string;
  activeTasks: number;
  totalHours: number;
  capacity: number;
  skills: string[];
}

export class RiskEngine {
  detectOverdueTasks(tasks: TaskRiskData[]): Risk[] {
    const risks: Risk[] = [];
    const now = new Date();

    tasks.forEach(task => {
      if (task.deadline && task.status !== 'COMPLETED') {
        const deadline = new Date(task.deadline);
        const daysOverdue = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOverdue > 0) {
          let severity: Risk['severity'] = 'LOW';
          if (daysOverdue > 7) severity = 'CRITICAL';
          else if (daysOverdue > 3) severity = 'HIGH';
          else if (daysOverdue > 1) severity = 'MEDIUM';

          risks.push({
            id: `overdue-${task.id}`,
            type: 'OVERDUE',
            severity,
            title: `Task "${task.title}" is ${daysOverdue} days overdue`,
            description: `Task was due on ${deadline.toLocaleDateString()} and is still ${task.status}`,
            affectedItems: [task.id],
            recommendation: daysOverdue > 3 
              ? `Immediately reassess priority and resources for this task`
              : `Review task progress and consider extending deadline or reassigning`,
            createdAt: now,
          });
        }
      }
    });

    return risks;
  }

  detectBlockedTasks(tasks: TaskRiskData[]): Risk[] {
    const risks: Risk[] = [];
    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'BLOCKED') {
        const severity = task.priority === 'URGENT' || task.priority === 'HIGH' ? 'HIGH' : 'MEDIUM';

        risks.push({
          id: `blocked-${task.id}`,
          type: 'BLOCKED',
          severity,
          title: `Task "${task.title}" is blocked`,
          description: `Task with ${task.priority} priority is currently blocked and not progressing`,
          affectedItems: [task.id],
          recommendation: `Identify and resolve blocking issues immediately. Consider alternative approaches or reassign if necessary.`,
          createdAt: now,
        });
      }
    });

    return risks;
  }

  detectOverloadedUsers(users: UserWorkloadData[]): Risk[] {
    const risks: Risk[] = [];
    const now = new Date();

    users.forEach(user => {
      const overloadPercentage = (user.activeTasks / user.capacity) * 100;
      
      if (overloadPercentage > 100) {
        let severity: Risk['severity'] = 'MEDIUM';
        if (overloadPercentage > 150) severity = 'CRITICAL';
        else if (overloadPercentage > 125) severity = 'HIGH';

        risks.push({
          id: `overloaded-${user.userId}`,
          type: 'OVERLOADED',
          severity,
          title: `${user.userName} is overloaded with ${user.activeTasks} tasks`,
          description: `User has ${overloadPercentage.toFixed(0)}% workload utilization exceeding ${user.capacity} task capacity`,
          affectedItems: [user.userId],
          recommendation: overloadPercentage > 125 
            ? `Immediately redistribute tasks and consider bringing in additional resources`
            : `Rebalance workload by reassigning lower priority tasks`,
          createdAt: now,
        });
      }
    });

    return risks;
  }

  detectDependencyRisks(tasks: TaskRiskData[]): Risk[] {
    const risks: Risk[] = [];
    const now = new Date();
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        const blockedByDependencies = task.dependencies.some(depId => {
          const depTask = taskMap.get(depId);
          return depTask && depTask.status !== 'COMPLETED';
        });

        if (blockedByDependencies && task.status !== 'BLOCKED') {
          const severity = task.priority === 'URGENT' ? 'HIGH' : 'MEDIUM';

          risks.push({
            id: `dependency-${task.id}`,
            type: 'DEPENDENCY',
            severity,
            title: `Task "${task.title}" has uncompleted dependencies`,
            description: `Task cannot proceed until dependencies are completed`,
            affectedItems: [task.id, ...(task.dependencies || [])],
            recommendation: `Prioritize completing dependencies or update task status to BLOCKED`,
            createdAt: now,
          });
        }
      }
    });

    return risks;
  }

  detectResourceRisks(tasks: TaskRiskData[], users: UserWorkloadData[]): Risk[] {
    const risks: Risk[] = [];
    const now = new Date();

    const highPriorityUnassigned = tasks.filter(
      task => (task.priority === 'HIGH' || task.priority === 'URGENT') && 
              !task.assignee && 
              task.status !== 'COMPLETED'
    );

    if (highPriorityUnassigned.length > 0) {
      risks.push({
        id: 'resource-unassigned',
        type: 'RESOURCE',
        severity: 'HIGH',
        title: `${highPriorityUnassigned.length} high-priority tasks unassigned`,
        description: `Critical tasks without assigned resources may cause delays`,
        affectedItems: highPriorityUnassigned.map(t => t.id),
        recommendation: `Immediately assign these tasks to appropriate team members based on skills and availability`,
        createdAt: now,
      });
    }

    return risks;
  }

  analyzeAllRisks(tasks: TaskRiskData[], users: UserWorkloadData[]): Risk[] {
    const allRisks: Risk[] = [];

    allRisks.push(...this.detectOverdueTasks(tasks));
    allRisks.push(...this.detectBlockedTasks(tasks));
    allRisks.push(...this.detectOverloadedUsers(users));
    allRisks.push(...this.detectDependencyRisks(tasks));
    allRisks.push(...this.detectResourceRisks(tasks, users));

    return allRisks.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  generateRiskSummary(risks: Risk[]): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  } {
    const summary = {
      total: risks.length,
      critical: risks.filter(r => r.severity === 'CRITICAL').length,
      high: risks.filter(r => r.severity === 'HIGH').length,
      medium: risks.filter(r => r.severity === 'MEDIUM').length,
      low: risks.filter(r => r.severity === 'LOW').length,
      byType: risks.reduce((acc, risk) => {
        acc[risk.type] = (acc[risk.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return summary;
  }
}

export const riskEngine = new RiskEngine();
