export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface Risk {
  type: "DEADLINE" | "WORKLOAD" | "BLOCKED";
  level: RiskLevel;
  message: string;
  taskId?: string;
  userId?: string;
  suggestion: string;
}

type RiskTask = {
  id?: string;
  title?: string;
  status?: string | null;
  dueDate?: string | Date | null;
  assigneeId?: string | null;
};

type RiskUser = {
  id?: string;
  name?: string | null;
};

const ACTIVE_TASK_STATUSES = new Set(["TODO", "BACKLOG", "IN_PROGRESS", "REVIEW", "BLOCKED"]);
const MAX_ACTIVE_TASKS_PER_USER = 5;

function normalizeTasks(tasks: any[]): RiskTask[] {
  return Array.isArray(tasks) ? tasks : [];
}

function normalizeUsers(users: any[]): RiskUser[] {
  return Array.isArray(users) ? users : [];
}

function getTaskLabel(task: RiskTask): string {
  return task.title?.trim() || "Untitled task";
}

function isOverdue(task: RiskTask, now: Date): number | null {
  if (!task.dueDate || task.status === "DONE") return null;

  const dueDate = new Date(task.dueDate);
  if (Number.isNaN(dueDate.getTime())) return null;

  const diffMs = now.getTime() - dueDate.getTime();
  if (diffMs <= 0) return null;

  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export async function detectRisks(context: {
  tasks: any[];
  users: any[];
}): Promise<Risk[]> {
  const now = new Date();
  const tasks = normalizeTasks(context.tasks);
  const users = normalizeUsers(context.users);
  const userNameById = new Map(users.map((user) => [user.id, user.name?.trim() || "User"]));

  const risks: Risk[] = [];

  for (const task of tasks) {
    const daysOverdue = isOverdue(task, now);

    if (daysOverdue) {
      risks.push({
        type: "DEADLINE",
        level: "HIGH",
        message: `Task "${getTaskLabel(task)}" is ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue.`,
        taskId: task.id,
        suggestion: "Review the deadline immediately, unblock the owner, or reassign the work to avoid further slippage.",
      });
    }

    if (task.status === "BLOCKED") {
      risks.push({
        type: "BLOCKED",
        level: "HIGH",
        message: `Task "${getTaskLabel(task)}" is blocked and needs intervention.`,
        taskId: task.id,
        suggestion: "Resolve the blocker, update dependencies, or escalate the issue if it cannot be cleared within the day.",
      });
    }
  }

  const activeTaskCounts = tasks.reduce<Record<string, number>>((accumulator, task) => {
    if (!task.assigneeId || !task.status || !ACTIVE_TASK_STATUSES.has(task.status)) {
      return accumulator;
    }

    accumulator[task.assigneeId] = (accumulator[task.assigneeId] || 0) + 1;
    return accumulator;
  }, {});

  for (const [userId, taskCount] of Object.entries(activeTaskCounts)) {
    if (taskCount <= MAX_ACTIVE_TASKS_PER_USER) continue;

    risks.push({
      type: "WORKLOAD",
      level: "MEDIUM",
      message: `${userNameById.get(userId) || "User"} has ${taskCount} active tasks, which is above the recommended limit.`,
      userId,
      suggestion: "Rebalance assignments or move lower-priority work out of the current sprint to reduce delivery risk.",
    });
  }

  return risks;
}
