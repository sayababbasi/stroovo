import { TaskStatus } from '@prisma/client';
import { taskEventBus, TaskEventFactory } from '@/events/task-events';
import { TaskStateMachine } from './state-machine';

// Smart Features System for Enterprise Task Management
// Automatic progress calculation, dependency management, and intelligent status updates

export interface SmartFeatureConfig {
  autoProgressCalculation: boolean;
  dependencyBlocking: boolean;
  autoStatusUpdate: boolean;
  riskBasedAlerts: boolean;
  workloadBalancing: boolean;
  deadlineReminders: boolean;
}

export interface ProgressCalculation {
  taskId: string;
  currentProgress: number;
  calculatedProgress: number;
  factors: {
    subtasksCompleted: number;
    totalSubtasks: number;
    timeSpent: number;
    estimatedTime: number;
    dependenciesCompleted: number;
    totalDependencies: number;
  };
  confidence: number; // 0-100%
}

export interface DependencyAnalysis {
  taskId: string;
  status: 'CLEAR' | 'BLOCKED' | 'AT_RISK';
  blockedBy: string[];
  blocking: string[];
  criticalPath: boolean;
  estimatedDelay: number; // days
  recommendations: string[];
}

export interface AutoStatusUpdate {
  taskId: string;
  currentStatus: TaskStatus;
  recommendedStatus: TaskStatus;
  reason: string;
  confidence: number; // 0-100%
  requiresApproval: boolean;
}

export class SmartFeaturesEngine {
  private config: SmartFeatureConfig;
  private stateMachine: TaskStateMachine;

  constructor(config: Partial<SmartFeatureConfig> = {}) {
    this.config = {
      autoProgressCalculation: true,
      dependencyBlocking: true,
      autoStatusUpdate: true,
      riskBasedAlerts: true,
      workloadBalancing: true,
      deadlineReminders: true,
      ...config
    };
    this.stateMachine = new TaskStateMachine();
  }

  /**
   * Calculate automatic progress based on multiple factors
   */
  public async calculateProgress(task: any): Promise<ProgressCalculation> {
    const factors = {
      subtasksCompleted: 0,
      totalSubtasks: task.subTasks?.length || 0,
      timeSpent: task.actualHours || 0,
      estimatedTime: task.estimatedHours || 8,
      dependenciesCompleted: 0,
      totalDependencies: task.dependencyIds?.length || 0
    };

    // Calculate subtask progress
    if (factors.totalSubtasks > 0) {
      factors.subtasksCompleted = task.subTasks?.filter((st: any) => st.done).length || 0;
    }

    // Calculate dependency progress
    if (factors.totalDependencies > 0) {
      // Would fetch dependency tasks and check their status
      factors.dependenciesCompleted = await this.getCompletedDependenciesCount(task.dependencyIds || []);
    }

    // Calculate weighted progress
    let calculatedProgress = 0;
    let totalWeight = 0;

    // Subtask progress (40% weight)
    if (factors.totalSubtasks > 0) {
      const subtaskProgress = (factors.subtasksCompleted / factors.totalSubtasks) * 100;
      calculatedProgress += subtaskProgress * 0.4;
      totalWeight += 0.4;
    }

    // Time-based progress (30% weight)
    if (factors.estimatedTime > 0) {
      const timeProgress = Math.min(100, (factors.timeSpent / factors.estimatedTime) * 100);
      calculatedProgress += timeProgress * 0.3;
      totalWeight += 0.3;
    }

    // Dependency progress (20% weight)
    if (factors.totalDependencies > 0) {
      const dependencyProgress = (factors.dependenciesCompleted / factors.totalDependencies) * 100;
      calculatedProgress += dependencyProgress * 0.2;
      totalWeight += 0.2;
    }

    // Manual progress adjustment (10% weight)
    if (task.progress !== undefined) {
      calculatedProgress += task.progress * 0.1;
      totalWeight += 0.1;
    }

    // Normalize if we have partial data
    if (totalWeight > 0 && totalWeight < 1) {
      calculatedProgress = calculatedProgress / totalWeight;
    }

    // Calculate confidence based on data completeness
    const confidence = this.calculateProgressConfidence(factors);

    return {
      taskId: task.id,
      currentProgress: task.progress || 0,
      calculatedProgress: Math.round(calculatedProgress),
      factors,
      confidence
    };
  }

  /**
   * Analyze dependencies and determine blocking status
   */
  public async analyzeDependencies(task: any): Promise<DependencyAnalysis> {
    const dependencyIds = task.dependencyIds || [];
    
    if (dependencyIds.length === 0) {
      return {
        taskId: task.id,
        status: 'CLEAR',
        blockedBy: [],
        blocking: [],
        criticalPath: false,
        estimatedDelay: 0,
        recommendations: []
      };
    }

    // Fetch dependency tasks
    const dependencies = await this.getDependencyTasks(dependencyIds);
    const blockedBy: string[] = [];
    const incompleteDeps = dependencies.filter(dep => dep.status !== 'DONE');
    
    // Determine blocking status
    let status: DependencyAnalysis['status'] = 'CLEAR';
    if (incompleteDeps.length > 0) {
      status = incompleteDeps.some(dep => this.isOverdue(dep)) ? 'AT_RISK' : 'BLOCKED';
      blockedBy.push(...incompleteDeps.map(dep => dep.id));
    }

    // Get tasks that this task is blocking
    const blocking = await this.getBlockingTasks(task.id);

    // Check if on critical path (simplified)
    const criticalPath = await this.isCriticalPath(task);

    // Estimate delay
    const estimatedDelay = this.estimateDelay(incompleteDeps);

    // Generate recommendations
    const recommendations = this.generateDependencyRecommendations(
      status,
      incompleteDeps,
      blocking,
      criticalPath
    );

    return {
      taskId: task.id,
      status,
      blockedBy,
      blocking: blocking.map(t => t.id),
      criticalPath,
      estimatedDelay,
      recommendations
    };
  }

  /**
   * Recommend automatic status updates based on task state
   */
  public async recommendStatusUpdate(task: any): Promise<AutoStatusUpdate> {
    const currentStatus = task.status as TaskStatus;
    let recommendedStatus = currentStatus;
    let reason = '';
    let confidence = 0;
    let requiresApproval = false;

    // Get progress and dependency analysis
    const progress = await this.calculateProgress(task);
    const dependencies = await this.analyzeDependencies(task);

    // Rule-based status recommendations
    if (dependencies.status === 'BLOCKED' && currentStatus !== 'BLOCKED') {
      recommendedStatus = 'BLOCKED';
      reason = 'Task has incomplete dependencies';
      confidence = 90;
      requiresApproval = false; // Auto-update for blocking
    } else if (dependencies.status === 'CLEAR' && currentStatus === 'BLOCKED') {
      recommendedStatus = 'TODO';
      reason = 'All dependencies have been completed';
      confidence = 85;
      requiresApproval = false;
    } else if (progress.calculatedProgress >= 80 && currentStatus === 'IN_PROGRESS') {
      recommendedStatus = 'REVIEW';
      reason = 'Task is 80%+ complete and ready for review';
      confidence = 75;
      requiresApproval = true; // Require user confirmation for review
    } else if (progress.calculatedProgress >= 95 && currentStatus === 'REVIEW') {
      recommendedStatus = 'DONE';
      reason = 'Task appears to be complete based on progress calculation';
      confidence = 80;
      requiresApproval = true; // Require confirmation for completion
    } else if (progress.calculatedProgress > 0 && currentStatus === 'TODO') {
      recommendedStatus = 'IN_PROGRESS';
      reason = 'Work has started on this task';
      confidence = 70;
      requiresApproval = false;
    }

    // Check if transition is valid
    const canTransition = this.stateMachine.canTransition(currentStatus, 'STATUS_CHANGED');
    if (!canTransition) {
      recommendedStatus = currentStatus;
      reason = 'Invalid status transition';
      confidence = 0;
    }

    return {
      taskId: task.id,
      currentStatus,
      recommendedStatus,
      reason,
      confidence,
      requiresApproval
    };
  }

  /**
   * Apply automatic updates to a task
   */
  public async applyAutoUpdates(task: any, userId: string): Promise<{
    updated: boolean;
    changes: Record<string, any>;
    events: string[];
  }> {
    const changes: Record<string, any> = {};
    const events: string[] = [];
    let updated = false;

    try {
      // Auto-progress calculation
      if (this.config.autoProgressCalculation) {
        const progress = await this.calculateProgress(task);
        const progressDiff = Math.abs(progress.calculatedProgress - task.progress);
        
        if (progressDiff > 10 && progress.confidence > 70) {
          changes.progress = progress.calculatedProgress;
          updated = true;
          events.push('AUTO_PROGRESS_UPDATED');
        }
      }

      // Dependency blocking
      if (this.config.dependencyBlocking) {
        const dependencies = await this.analyzeDependencies(task);
        
        if (dependencies.status === 'BLOCKED' && task.status !== 'BLOCKED') {
          changes.status = 'BLOCKED';
          changes.blockedByCount = dependencies.blockedBy.length;
          updated = true;
          events.push('AUTO_BLOCKED_BY_DEPENDENCIES');
        } else if (dependencies.status === 'CLEAR' && task.status === 'BLOCKED') {
          changes.status = 'TODO';
          changes.blockedByCount = 0;
          updated = true;
          events.push('AUTO_UNBLOCKED');
        }
      }

      // Auto-status update
      if (this.config.autoStatusUpdate) {
        const statusRecommendation = await this.recommendStatusUpdate(task);
        
        if (statusRecommendation.confidence > 80 && !statusRecommendation.requiresApproval) {
          if (statusRecommendation.recommendedStatus !== task.status) {
            changes.status = statusRecommendation.recommendedStatus;
            updated = true;
            events.push('AUTO_STATUS_UPDATED');
          }
        }
      }

      // Update last activity timestamp
      if (updated) {
        changes.lastActivityAt = new Date();
        changes.updatedAt = new Date();
      }

      return { updated, changes, events };

    } catch (error) {
      console.error('Auto update failed:', error);
      return { updated: false, changes: {}, events: ['AUTO_UPDATE_FAILED'] };
    }
  }

  /**
   * Process smart features for multiple tasks
   */
  public async processBatchTasks(tasks: any[], userId: string): Promise<{
    results: Array<{ taskId: string; updated: boolean; changes: Record<string, any>; events: string[] }>;
    summary: { totalProcessed: number; totalUpdated: number; events: Record<string, number> };
  }> {
    const results = [];
    const events: Record<string, number> = {};

    for (const task of tasks) {
      const result = await this.applyAutoUpdates(task, userId);
      results.push({ taskId: task.id, ...result });
      
      // Track events
      result.events.forEach(event => {
        events[event] = (events[event] || 0) + 1;
      });
    }

    const summary = {
      totalProcessed: tasks.length,
      totalUpdated: results.filter(r => r.updated).length,
      events
    };

    return { results, summary };
  }

  /**
   * Check for deadline reminders and trigger alerts
   */
  public async checkDeadlineReminders(tasks: any[]): Promise<{
    urgent: Array<{ taskId: string; title: string; dueDate: Date; assigneeId: string }>;
    upcoming: Array<{ taskId: string; title: string; dueDate: Date; assigneeId: string }>;
    overdue: Array<{ taskId: string; title: string; dueDate: Date; assigneeId: string; daysOverdue: number }>;
  }> {
    const now = new Date();
    const urgent = [];
    const upcoming = [];
    const overdue = [];

    for (const task of tasks) {
      if (!task.dueDate || task.status === 'DONE') continue;

      const dueDate = new Date(task.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0) {
        overdue.push({
          taskId: task.id,
          title: task.title,
          dueDate,
          assigneeId: task.assigneeId,
          daysOverdue
        });
      } else if (daysUntilDue <= 1) {
        urgent.push({
          taskId: task.id,
          title: task.title,
          dueDate,
          assigneeId: task.assigneeId
        });
      } else if (daysUntilDue <= 3) {
        upcoming.push({
          taskId: task.id,
          title: task.title,
          dueDate,
          assigneeId: task.assigneeId
        });
      }
    }

    return { urgent, upcoming, overdue };
  }

  // Helper methods
  private async getCompletedDependenciesCount(dependencyIds: string[]): Promise<number> {
    // Would fetch from database
    return 0;
  }

  private async getDependencyTasks(dependencyIds: string[]): Promise<any[]> {
    // Would fetch from database
    return [];
  }

  private async getBlockingTasks(taskId: string): Promise<any[]> {
    // Would fetch tasks that depend on this task
    return [];
  }

  private async isCriticalPath(task: any): Promise<boolean> {
    // Simplified critical path analysis
    return false;
  }

  private isOverdue(task: any): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  }

  private estimateDelay(incompleteDeps: any[]): number {
    if (incompleteDeps.length === 0) return 0;
    
    let maxDelay = 0;
    for (const dep of incompleteDeps) {
      if (dep.dueDate && this.isOverdue(dep)) {
        const daysOverdue = Math.ceil((new Date().getTime() - new Date(dep.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        maxDelay = Math.max(maxDelay, daysOverdue);
      }
    }
    
    return maxDelay;
  }

  private generateDependencyRecommendations(
    status: DependencyAnalysis['status'],
    incompleteDeps: any[],
    blocking: any[],
    criticalPath: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (status === 'BLOCKED') {
      recommendations.push('Focus on completing dependencies first');
      if (criticalPath) {
        recommendations.push('This task is on the critical path - prioritize its dependencies');
      }
    }

    if (incompleteDeps.length > 3) {
      recommendations.push('Consider breaking down into smaller tasks to reduce dependencies');
    }

    if (blocking.length > 0) {
      recommendations.push(`${blocking.length} tasks are waiting on this task`);
    }

    return recommendations;
  }

  private calculateProgressConfidence(factors: ProgressCalculation['factors']): number {
    let confidence = 50; // Base confidence

    // More data points = higher confidence
    if (factors.totalSubtasks > 0) confidence += 20;
    if (factors.estimatedTime > 0 && factors.timeSpent > 0) confidence += 20;
    if (factors.totalDependencies > 0) confidence += 10;

    return Math.min(100, confidence);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<SmartFeatureConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): SmartFeatureConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const smartFeaturesEngine = new SmartFeaturesEngine();

// Smart features scheduler for periodic processing
export class SmartFeaturesScheduler {
  private engine: SmartFeaturesEngine;
  private interval: NodeJS.Timeout | null = null;

  constructor(engine: SmartFeaturesEngine) {
    this.engine = engine;
  }

  /**
   * Start periodic processing
   */
  public start(intervalMinutes: number = 15): void {
    if (this.interval) {
      this.stop();
    }

    this.interval = setInterval(async () => {
      try {
        await this.processAllTasks();
      } catch (error) {
        console.error('Smart features scheduler error:', error);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Smart features scheduler started (interval: ${intervalMinutes} minutes)`);
  }

  /**
   * Stop periodic processing
   */
  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Smart features scheduler stopped');
    }
  }

  /**
   * Process all active tasks
   */
  private async processAllTasks(): Promise<void> {
    // Would fetch all active tasks from database
    const activeTasks = []; // await this.getActiveTasks();
    
    if (activeTasks.length === 0) return;

    const { results, summary } = await this.engine.processBatchTasks(activeTasks, 'system');
    
    console.log(`Smart features batch processing:`, summary);
    
    // Emit events for significant changes
    results.forEach(result => {
      if (result.updated) {
        // Would emit appropriate events
        console.log(`Task ${result.taskId} auto-updated:`, result.events);
      }
    });
  }

  /**
   * Process deadline reminders
   */
  public async processDeadlineReminders(): Promise<void> {
    // Would fetch tasks with due dates
    const tasksWithDueDates = []; // await this.getTasksWithDueDates();
    
    const reminders = await this.engine.checkDeadlineReminders(tasksWithDueDates);
    
    // Send notifications
    if (reminders.urgent.length > 0) {
      console.log(`Sending ${reminders.urgent.length} urgent deadline reminders`);
    }
    
    if (reminders.overdue.length > 0) {
      console.log(`Sending ${reminders.overdue.length} overdue task alerts`);
    }
  }
}

// Singleton scheduler
export const smartFeaturesScheduler = new SmartFeaturesScheduler(smartFeaturesEngine);
