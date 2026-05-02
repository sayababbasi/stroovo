import prisma from '@/lib/prisma';
import aiService from './service';
import { TaskEventFactory, taskEventBus } from '@/events/task-events';
import { RealtimeEmitter } from '@/realtime/websocket-manager';

const ACTIVE_TASK_STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED'] as const;
const AI_TIMEOUT_MS = 250;

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

type DeterministicFactor = {
  key: string;
  score: number;
  reason: string;
  recommendation?: string;
};

type StoredRiskAnalysis = {
  riskLevel: RiskLevel;
  delayProbability: number;
  reasons: string[];
  recommendations: string[];
  factors: Array<{
    key: string;
    score: number;
    reason: string;
  }>;
  aiEnhanced: boolean;
  evaluatedAt: string;
  version: 'risk-engine-v2';
};

export interface RiskAnalysis {
  riskScore: number;
  delayProbability: number;
  insights: StoredRiskAnalysis;
}

type RiskTaskRecord = Awaited<ReturnType<typeof fetchTaskForRisk>>;

async function fetchTaskForRisk(taskId: string) {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: {
        include: {
          tasks: {
            where: {
              status: { in: [...ACTIVE_TASK_STATUSES] },
            },
            select: {
              id: true,
              priority: true,
              dueDate: true,
              status: true,
            },
          },
        },
      },
      subTasks: {
        select: {
          id: true,
          status: true,
        },
      },
      taskDependencies: {
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
        },
      },
      project: {
        include: {
          tasks: {
            where: {
              status: 'DONE',
              dueDate: { not: null },
            },
            select: {
              id: true,
              updatedAt: true,
              dueDate: true,
              assigneeId: true,
            },
          },
        },
      },
    },
  });
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalizeReason(text: string) {
  return text.trim().replace(/\.$/, '');
}

function uniqueText(items: string[]) {
  return Array.from(new Set(items.map(normalizeReason).filter(Boolean)));
}

function daysBetween(from: Date, to: Date) {
  return Math.ceil((to.getTime() - from.getTime()) / 86400000);
}

function buildDeterministicFactors(task: NonNullable<RiskTaskRecord>): DeterministicFactor[] {
  const now = new Date();
  const factors: DeterministicFactor[] = [];

  if (!task.dueDate) {
    factors.push({
      key: 'deadline',
      score: 12,
      reason: 'Task has no due date, which makes delay risk harder to manage',
      recommendation: 'Set a concrete due date and interim checkpoints',
    });
  } else {
    const daysUntilDue = daysBetween(now, task.dueDate);
    if (daysUntilDue < 0) {
      factors.push({
        key: 'deadline',
        score: 35,
        reason: `Task is overdue by ${Math.abs(daysUntilDue)} day(s)`,
        recommendation: 'Escalate immediately or renegotiate the deadline',
      });
    } else if (daysUntilDue <= 2) {
      factors.push({
        key: 'deadline',
        score: 26,
        reason: `Deadline is within ${daysUntilDue} day(s)`,
        recommendation: 'Reduce scope or assign focused execution time now',
      });
    } else if (daysUntilDue <= 5) {
      factors.push({
        key: 'deadline',
        score: 16,
        reason: 'Deadline is approaching within this work week',
        recommendation: 'Review blockers and confirm delivery plan',
      });
    }
  }

  const priorityWeight: Record<string, number> = {
    LOW: 4,
    MEDIUM: 8,
    HIGH: 14,
    URGENT: 18,
  };
  factors.push({
    key: 'priority',
    score: priorityWeight[task.priority] ?? 8,
    reason: `${task.priority} priority raises delivery sensitivity`,
    recommendation: task.priority === 'URGENT' ? 'Limit parallel work for the assignee until this task stabilizes' : undefined,
  });

  if (!task.assigneeId) {
    factors.push({
      key: 'assignee',
      score: 18,
      reason: 'Task does not have an assignee',
      recommendation: 'Assign an owner to establish accountability',
    });
  } else if (task.assignee) {
    const activeTasks = task.assignee.tasks.filter((candidate) => candidate.id !== task.id);
    const weightedWorkload = activeTasks.reduce((total, candidate) => {
      const priorityScore = candidate.priority === 'URGENT' ? 2.5 : candidate.priority === 'HIGH' ? 2 : 1;
      const dueScore = candidate.dueDate ? (daysBetween(now, candidate.dueDate) <= 3 ? 1.5 : 1) : 1;
      return total + priorityScore * dueScore;
    }, 0);

    if (weightedWorkload >= 10) {
      factors.push({
        key: 'workload',
        score: 22,
        reason: `Assignee workload is high (${activeTasks.length} active task(s))`,
        recommendation: 'Rebalance the assignee workload or defer lower-priority work',
      });
    } else if (weightedWorkload >= 6) {
      factors.push({
        key: 'workload',
        score: 12,
        reason: `Assignee is carrying moderate parallel work (${activeTasks.length} active task(s))`,
        recommendation: 'Confirm current capacity before adding more scope',
      });
    }
  }

  const historicalTasks = task.project.tasks.filter(
    (candidate) => !task.assigneeId || candidate.assigneeId === task.assigneeId
  );
  if (historicalTasks.length >= 3) {
    const delayedCount = historicalTasks.filter((candidate) => candidate.dueDate && candidate.updatedAt > candidate.dueDate).length;
    const delayRate = delayedCount / historicalTasks.length;

    if (delayRate >= 0.5) {
      factors.push({
        key: 'history',
        score: 18,
        reason: `Historical delay rate is elevated (${Math.round(delayRate * 100)}%)`,
        recommendation: 'Add buffer and increase execution check-ins',
      });
    } else if (delayRate >= 0.25) {
      factors.push({
        key: 'history',
        score: 10,
        reason: `Historical delivery variance is noticeable (${Math.round(delayRate * 100)}%)`,
        recommendation: 'Track milestone completion more tightly',
      });
    }
  }

  const unresolvedDependencies = task.taskDependencies.filter((dependency) => dependency.status !== 'DONE');
  if (unresolvedDependencies.length > 0) {
    const dependencyScore = unresolvedDependencies.length >= 3 ? 22 : 14;
    factors.push({
      key: 'dependencies',
      score: dependencyScore,
      reason: `${unresolvedDependencies.length} dependency task(s) are still open`,
      recommendation: 'Follow up on dependency owners and sequence work explicitly',
    });
  }

  if (task.status === 'BLOCKED') {
    factors.push({
      key: 'blocked',
      score: 25,
      reason: 'Task is currently blocked',
      recommendation: 'Resolve the blocker before further execution work',
    });
  }

  if (task.subTasks.length > 0 && task.status === 'IN_PROGRESS') {
    const completed = task.subTasks.filter((item) => item.status === 'DONE').length;
    const completionRate = completed / task.subTasks.length;

    if (completionRate < 0.25) {
      factors.push({
        key: 'execution',
        score: 10,
        reason: 'Subtask completion is low for an in-progress task',
        recommendation: 'Break the next milestone into smaller finishable steps',
      });
    }
  }

  return factors;
}

function buildDeterministicAnalysis(task: NonNullable<RiskTaskRecord>): RiskAnalysis {
  const factors = buildDeterministicFactors(task);
  const riskScore = clamp(Math.round(factors.reduce((sum, factor) => sum + factor.score, 0)));
  const delayProbability = clamp(
    Math.round(
      riskScore * 0.7 +
      (task.status === 'BLOCKED' ? 12 : 0) +
      (task.dueDate && task.dueDate < new Date() ? 10 : 0)
    )
  );

  const riskLevel: RiskLevel =
    riskScore >= 70 || delayProbability >= 75 ? 'HIGH' :
    riskScore >= 40 || delayProbability >= 45 ? 'MEDIUM' :
    'LOW';

  const reasons = uniqueText(factors.map((factor) => factor.reason));
  const recommendations = uniqueText(
    factors
      .map((factor) => factor.recommendation)
      .filter((item): item is string => Boolean(item))
  );

  return {
    riskScore,
    delayProbability,
    insights: {
      riskLevel,
      delayProbability,
      reasons,
      recommendations,
      factors: factors.map((factor) => ({
        key: factor.key,
        score: factor.score,
        reason: factor.reason,
      })),
      aiEnhanced: false,
      evaluatedAt: new Date().toISOString(),
      version: 'risk-engine-v2',
    },
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

async function buildAiEnhancement(task: NonNullable<RiskTaskRecord>, baseline: RiskAnalysis) {
  const aiResult = await withTimeout(
    aiService.complete(
      `
      You are a delivery risk analyst. Improve the risk analysis for this task.
      Return strict JSON with:
      {
        "riskLevel": "LOW|MEDIUM|HIGH",
        "delayProbability": number,
        "reasons": string[],
        "recommendations": string[]
      }

      Task:
      ${JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeName: task.assignee?.name,
        dependencyTitles: task.taskDependencies.map((dependency) => ({
          title: dependency.title,
          status: dependency.status,
        })),
        subtaskCount: task.subTasks.length,
      })}

      Deterministic baseline:
      ${JSON.stringify(baseline)}
      `
    ),
    AI_TIMEOUT_MS
  );

  if (!aiResult || (aiResult as { fallback?: boolean }).fallback) {
    return null;
  }

  const payload = aiResult as {
    riskLevel?: RiskLevel;
    delayProbability?: number;
    reasons?: string[];
    recommendations?: string[];
  };

  if (!payload.riskLevel || !Array.isArray(payload.reasons) || !Array.isArray(payload.recommendations)) {
    return null;
  }

  return {
    riskLevel: payload.riskLevel,
    delayProbability: clamp(Number(payload.delayProbability ?? baseline.delayProbability)),
    reasons: uniqueText([...baseline.insights.reasons, ...payload.reasons]).slice(0, 6),
    recommendations: uniqueText([...baseline.insights.recommendations, ...payload.recommendations]).slice(0, 6),
  };
}

async function persistRiskAnalysis(
  task: NonNullable<RiskTaskRecord>,
  analysis: RiskAnalysis,
  triggeredByUserId = 'system'
) {
  const previousRiskScore = task.riskScore ?? 0;

  const aiInsights = {
    ...(typeof task.aiInsights === 'object' && task.aiInsights ? (task.aiInsights as Record<string, unknown>) : {}),
    riskAnalysis: analysis.insights,
    riskLevel: analysis.insights.riskLevel,
    reasons: analysis.insights.reasons,
    recommendations: analysis.insights.recommendations,
    delayProbability: analysis.delayProbability,
  };

  await prisma.task.update({
    where: { id: task.id },
    data: {
      riskScore: analysis.riskScore,
      delayProbability: analysis.delayProbability,
      aiInsights,
    },
  });

  await taskEventBus.emitTaskEvent(
    TaskEventFactory.createTaskRiskChangedEvent(
      task.id,
      triggeredByUserId,
      previousRiskScore,
      analysis.riskScore,
      analysis.insights.reasons,
      analysis.insights.recommendations,
      task.tenantId ?? undefined
    )
  );

  RealtimeEmitter.emitRiskUpdate(
    task.id,
    {
      taskId: task.id,
      riskLevel: analysis.insights.riskLevel,
      delayProbability: analysis.delayProbability,
      reasons: analysis.insights.reasons,
      recommendations: analysis.insights.recommendations,
    },
    task.tenantId ?? undefined
  );
}

export class RiskEngine {
  static async evaluateTaskRisk(taskId: string, options?: { triggeredByUserId?: string }): Promise<RiskAnalysis> {
    const task = await fetchTaskForRisk(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status === 'DONE') {
      const completed: RiskAnalysis = {
        riskScore: 0,
        delayProbability: 0,
        insights: {
          riskLevel: 'LOW',
          delayProbability: 0,
          reasons: ['Task is already completed'],
          recommendations: ['No action required'],
          factors: [],
          aiEnhanced: false,
          evaluatedAt: new Date().toISOString(),
          version: 'risk-engine-v2',
        },
      };
      await persistRiskAnalysis(task, completed, options?.triggeredByUserId);
      return completed;
    }

    const baseline = buildDeterministicAnalysis(task);
    const enhancement = await buildAiEnhancement(task, baseline);
    const analysis: RiskAnalysis = enhancement
      ? {
          riskScore: baseline.riskScore,
          delayProbability: enhancement.delayProbability,
          insights: {
            ...baseline.insights,
            riskLevel: enhancement.riskLevel,
            delayProbability: enhancement.delayProbability,
            reasons: enhancement.reasons,
            recommendations: enhancement.recommendations,
            aiEnhanced: true,
            evaluatedAt: new Date().toISOString(),
          },
        }
      : baseline;

    await persistRiskAnalysis(task, analysis, options?.triggeredByUserId);
    return analysis;
  }

  static scheduleTaskRiskEvaluation(taskId: string, triggeredByUserId?: string) {
    void this.evaluateTaskRisk(taskId, { triggeredByUserId }).catch((error) => {
      console.error(`[RiskEngine] failed to evaluate risk for task ${taskId}`, error);
    });
  }

  static async evaluateAllActiveTasks(): Promise<void> {
    const tasks = await prisma.task.findMany({
      where: {
        status: { in: [...ACTIVE_TASK_STATUSES] },
      },
      select: { id: true },
    });

    await Promise.all(tasks.map((task) => this.evaluateTaskRisk(task.id)));
  }
}

export default RiskEngine;
