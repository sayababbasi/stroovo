import { NotificationEventType, NotificationEvent } from './types';
import { notificationEngine } from './engine';
import { notificationEvents } from './events';

export interface NotificationAutomationTrigger {
  id: string;
  name: string;
  event: string;
  condition?: Record<string, any>;
  action: string;
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface TaskAutomationConfig {
  onAssign: boolean;
  onComplete: boolean;
  onOverdue: boolean;
  onDeadlineNear: boolean;
  deadlineNearHours: number;
  notifyAssignee: boolean;
  notifyManager: boolean;
  notifyTeam: boolean;
}

export interface RiskAutomationConfig {
  onRiskDetected: boolean;
  onRiskEscalation: boolean;
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  notifyRiskOwner: boolean;
  notifyProjectManager: boolean;
  notifyAdmin: boolean;
}

export class NotificationAutomation {
  private taskConfig: TaskAutomationConfig;
  private riskConfig: RiskAutomationConfig;
  private automationTriggers: Map<string, NotificationAutomationTrigger> = new Map();

  constructor() {
    this.taskConfig = this.getDefaultTaskConfig();
    this.riskConfig = this.getDefaultRiskConfig();
    this.initializeDefaultTriggers();
  }

  /**
   * Initialize default automation triggers
   */
  private initializeDefaultTriggers(): void {
    const defaultTriggers: NotificationAutomationTrigger[] = [
      {
        id: 'task_assigned_manager',
        name: 'Notify Manager on Task Assignment',
        event: 'TASK_ASSIGNED',
        condition: { priority: 'HIGH' },
        action: 'NOTIFY_MANAGER',
        enabled: true,
        triggerCount: 0
      },
      {
        id: 'task_completed_team',
        name: 'Notify Team on Task Completion',
        event: 'TASK_COMPLETED',
        condition: { priority: 'HIGH' },
        action: 'NOTIFY_TEAM',
        enabled: true,
        triggerCount: 0
      },
      {
        id: 'deadline_warning',
        name: 'Deadline Warning',
        event: 'DEADLINE_NEAR',
        condition: { hoursUntil: 24 },
        action: 'SEND_REMINDER',
        enabled: true,
        triggerCount: 0
      },
      {
        id: 'risk_escalation',
        name: 'Risk Escalation',
        event: 'RISK_DETECTED',
        condition: { level: 'CRITICAL' },
        action: 'ESCALATE_TO_ADMIN',
        enabled: true,
        triggerCount: 0
      },
      {
        id: 'workload_alert',
        name: 'High Workload Alert',
        event: 'WORKLOAD_HIGH',
        condition: { taskCount: 10 },
        action: 'NOTIFY_MANAGER',
        enabled: true,
        triggerCount: 0
      }
    ];

    defaultTriggers.forEach(trigger => {
      this.automationTriggers.set(trigger.id, trigger);
    });
  }

  /**
   * Get default task automation configuration
   */
  private getDefaultTaskConfig(): TaskAutomationConfig {
    return {
      onAssign: true,
      onComplete: true,
      onOverdue: true,
      onDeadlineNear: true,
      deadlineNearHours: 24,
      notifyAssignee: true,
      notifyManager: true,
      notifyTeam: false
    };
  }

  /**
   * Get default risk automation configuration
   */
  private getDefaultRiskConfig(): RiskAutomationConfig {
    return {
      onRiskDetected: true,
      onRiskEscalation: true,
      riskThresholds: {
        low: 25,
        medium: 50,
        high: 75,
        critical: 90
      },
      notifyRiskOwner: true,
      notifyProjectManager: true,
      notifyAdmin: false
    };
  }

  /**
   * Handle task creation event
   */
  async handleTaskCreated(task: {
    id: string;
    title: string;
    assigneeId?: string;
    assigneeName?: string;
    projectId: string;
    projectName: string;
    priority: string;
    dueDate?: Date;
    managerId: string;
    tenantId: string;
  }): Promise<void> {
    if (!this.taskConfig.onAssign) return;

    // Notify assignee
    if (this.taskConfig.notifyAssignee && task.assigneeId) {
      await notificationEvents.taskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assigneeId: task.assigneeId,
        assignerId: task.managerId,
        projectId: task.projectId,
        projectName: task.projectName,
        priority: task.priority,
        dueDate: task.dueDate,
        tenantId: task.tenantId
      });
    }

    // Check automation triggers
    await this.checkAutomationTriggers('TASK_ASSIGNED', {
      taskId: task.id,
      priority: task.priority,
      assigneeId: task.assigneeId,
      managerId: task.managerId,
      projectId: task.projectId,
      tenantId: task.tenantId
    });
  }

  /**
   * Handle task completion event
   */
  async handleTaskCompleted(task: {
    id: string;
    title: string;
    completedById: string;
    completedByName: string;
    projectId: string;
    projectName: string;
    managerId: string;
    tenantId: string;
  }): Promise<void> {
    if (!this.taskConfig.onComplete) return;

    // Notify manager
    await notificationEvents.taskCompleted({
      taskId: task.id,
      taskTitle: task.title,
      completedById: task.completedById,
      completedByName: task.completedByName,
      projectId: task.projectId,
      projectName: task.projectName,
      managerId: task.managerId,
      tenantId: task.tenantId
    });

    // Check automation triggers
    await this.checkAutomationTriggers('TASK_COMPLETED', {
      taskId: task.id,
      completedById: task.completedById,
      managerId: task.managerId,
      projectId: task.projectId,
      tenantId: task.tenantId
    });
  }

  /**
   * Handle deadline approaching event
   */
  async handleDeadlineApproaching(tasks: Array<{
    id: string;
    title: string;
    assigneeId: string;
    dueDate: Date;
    projectId: string;
    projectName: string;
    tenantId: string;
  }>): Promise<void> {
    if (!this.taskConfig.onDeadlineNear) return;

    const now = new Date();
    
    for (const task of tasks) {
      const hoursUntil = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntil <= this.taskConfig.deadlineNearHours && hoursUntil > 0) {
        await notificationEvents.deadlineNear({
          taskId: task.id,
          taskTitle: task.title,
          assigneeId: task.assigneeId,
          dueDate: task.dueDate,
          projectId: task.projectId,
          projectName: task.projectName,
          hoursUntil: Math.round(hoursUntil),
          tenantId: task.tenantId
        });
      }
    }
  }

  /**
   * Handle risk detection event
   */
  async handleRiskDetected(risk: {
    id: string;
    type: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    projectId?: string;
    projectName?: string;
    riskOwnerId?: string;
    projectManagerId?: string;
    tenantId: string;
    affectedUsers?: string[];
  }): Promise<void> {
    if (!this.riskConfig.onRiskDetected) return;

    const recipients: string[] = [];

    // Add risk owner
    if (this.riskConfig.notifyRiskOwner && risk.riskOwnerId) {
      recipients.push(risk.riskOwnerId);
    }

    // Add project manager
    if (this.riskConfig.notifyProjectManager && risk.projectManagerId) {
      recipients.push(risk.projectManagerId);
    }

    // Add admin for critical risks
    if (this.riskConfig.notifyAdmin && risk.level === 'CRITICAL') {
      // Add admin users (mock implementation)
      recipients.push('admin-user-id');
    }

    // Send notifications to all recipients
    for (const userId of recipients) {
      await notificationEvents.riskDetected({
        riskType: risk.type,
        riskLevel: risk.level,
        description: risk.description,
        projectId: risk.projectId,
        projectName: risk.projectName,
        userId,
        tenantId: risk.tenantId,
        affectedUsers: risk.affectedUsers
      });
    }

    // Check automation triggers
    await this.checkAutomationTriggers('RISK_DETECTED', {
      riskId: risk.id,
      riskLevel: risk.level,
      riskType: risk.type,
      projectId: risk.projectId,
      tenantId: risk.tenantId
    });
  }

  /**
   * Handle AI suggestion generated event
   */
  async handleSuggestionGenerated(suggestion: {
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    userId: string;
    tenantId: string;
    projectId?: string;
    projectName?: string;
  }): Promise<void> {
    const notificationEvent = {
      id: `suggestion_${suggestion.id}`,
      type: 'INFO' as const,
      title: 'AI Suggestion Available',
      message: `${suggestion.title}: ${suggestion.description}`,
      priority: suggestion.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
      userId: suggestion.userId,
      tenantId: suggestion.tenantId,
      link: `/ai/suggestions`,
      metadata: {
        suggestionId: suggestion.id,
        suggestionType: suggestion.type,
        projectId: suggestion.projectId
      }
    };

    await notificationEngine.sendNotification(notificationEvent);
  }

  /**
   * Handle automation rule triggered event
   */
  async handleAutomationTriggered(automation: {
    ruleId: string;
    ruleName: string;
    action: string;
    triggeredBy: string;
    userId: string;
    tenantId: string;
    entityId?: string;
    entityType?: string;
  }): Promise<void> {
    await notificationEvents.automationTriggered({
      ruleName: automation.ruleName,
      action: automation.action,
      triggeredBy: automation.triggeredBy,
      userId: automation.userId,
      tenantId: automation.tenantId,
      metadata: {
        ruleId: automation.ruleId,
        entityId: automation.entityId,
        entityType: automation.entityType
      }
    });
  }

  /**
   * Check and execute automation triggers
   */
  private async checkAutomationTriggers(
    eventType: string, 
    context: Record<string, any>
  ): Promise<void> {
    for (const trigger of this.automationTriggers.values()) {
      if (!trigger.enabled || trigger.event !== eventType) continue;

      // Check if conditions match
      if (this.evaluateConditions(trigger.condition, context)) {
        await this.executeAutomationAction(trigger, context);
        
        // Update trigger statistics
        trigger.lastTriggered = new Date();
        trigger.triggerCount++;
      }
    }
  }

  /**
   * Evaluate automation conditions
   */
  private evaluateConditions(
    conditions: Record<string, any> | undefined,
    context: Record<string, any>
  ): boolean {
    if (!conditions) {
      return true;
    }

    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Execute automation action
   */
  private async executeAutomationAction(
    trigger: NotificationAutomationTrigger,
    context: Record<string, any>
  ): Promise<void> {
    switch (trigger.action) {
      case 'NOTIFY_MANAGER':
        if (context.managerId) {
          await this.sendManagerNotification(trigger, context);
        }
        break;
      
      case 'NOTIFY_TEAM':
        await this.sendTeamNotification(trigger, context);
        break;
      
      case 'SEND_REMINDER':
        await this.sendReminderNotification(trigger, context);
        break;
      
      case 'ESCALATE_TO_ADMIN':
        await this.escalateToAdmin(trigger, context);
        break;
      
      default:
        console.log(`Unknown automation action: ${trigger.action}`);
    }
  }

  /**
   * Send manager notification
   */
  private async sendManagerNotification(
    trigger: NotificationAutomationTrigger,
    context: Record<string, any>
  ): Promise<void> {
    const notification = {
      id: `automation_${trigger.id}_${Date.now()}`,
      type: 'INFO' as const,
      title: `Automation: ${trigger.name}`,
      message: `Automated notification triggered: ${trigger.name}`,
      priority: 'MEDIUM' as const,
      userId: context.managerId,
      tenantId: context.tenantId,
      metadata: {
        triggerId: trigger.id,
        context
      }
    };

    await notificationEngine.sendNotification(notification);
  }

  /**
   * Send team notification
   */
  private async sendTeamNotification(
    trigger: NotificationAutomationTrigger,
    context: Record<string, any>
  ): Promise<void> {
    // Mock implementation - would fetch team members from database
    const teamMembers = ['user1', 'user2', 'user3']; // Mock team member IDs
    
    for (const memberId of teamMembers) {
      const notification = {
        id: `automation_${trigger.id}_${memberId}_${Date.now()}`,
        type: 'INFO' as const,
        title: `Team Update: ${trigger.name}`,
        message: `Team notification: ${trigger.name}`,
        priority: 'LOW' as const,
        userId: memberId,
        tenantId: context.tenantId,
        metadata: {
          triggerId: trigger.id,
          context
        }
      };

      await notificationEngine.sendNotification(notification);
    }
  }

  /**
   * Send reminder notification
   */
  private async sendReminderNotification(
    trigger: NotificationAutomationTrigger,
    context: Record<string, any>
  ): Promise<void> {
    const notification = {
      id: `automation_${trigger.id}_${Date.now()}`,
      type: 'WARNING' as const,
      title: `Reminder: ${trigger.name}`,
      message: `Automated reminder: ${trigger.name}`,
      priority: 'HIGH' as const,
      userId: context.assigneeId || context.userId,
      tenantId: context.tenantId,
      metadata: {
        triggerId: trigger.id,
        context
      }
    };

    await notificationEngine.sendNotification(notification);
  }

  /**
   * Escalate to admin
   */
  private async escalateToAdmin(
    trigger: NotificationAutomationTrigger,
    context: Record<string, any>
  ): Promise<void> {
    // Mock implementation - would fetch admin users from database
    const adminUsers = ['admin1', 'admin2']; // Mock admin user IDs
    
    for (const adminId of adminUsers) {
      const notification = {
        id: `automation_${trigger.id}_${adminId}_${Date.now()}`,
        type: 'ERROR' as const,
        title: `Escalation: ${trigger.name}`,
        message: `Critical escalation: ${trigger.name}`,
        priority: 'URGENT' as const,
        userId: adminId,
        tenantId: context.tenantId,
        metadata: {
          triggerId: trigger.id,
          context,
          escalatedAt: new Date().toISOString()
        }
      };

      await notificationEngine.sendNotification(notification);
    }
  }

  /**
   * Update task automation configuration
   */
  updateTaskConfig(config: Partial<TaskAutomationConfig>): void {
    this.taskConfig = { ...this.taskConfig, ...config };
  }

  /**
   * Update risk automation configuration
   */
  updateRiskConfig(config: Partial<RiskAutomationConfig>): void {
    this.riskConfig = { ...this.riskConfig, ...config };
  }

  /**
   * Add or update automation trigger
   */
  upsertTrigger(trigger: NotificationAutomationTrigger): void {
    this.automationTriggers.set(trigger.id, trigger);
  }

  /**
   * Remove automation trigger
   */
  removeTrigger(triggerId: string): void {
    this.automationTriggers.delete(triggerId);
  }

  /**
   * Enable/disable automation trigger
   */
  toggleTrigger(triggerId: string, enabled: boolean): void {
    const trigger = this.automationTriggers.get(triggerId);
    if (trigger) {
      trigger.enabled = enabled;
    }
  }

  /**
   * Get automation statistics
   */
  getStatistics(): {
    totalTriggers: number;
    enabledTriggers: number;
    triggerExecutions: number;
    taskAutomationEnabled: boolean;
    riskAutomationEnabled: boolean;
  } {
    const triggers = Array.from(this.automationTriggers.values());
    const enabledTriggers = triggers.filter(t => t.enabled).length;
    const totalExecutions = triggers.reduce((sum, t) => sum + t.triggerCount, 0);

    return {
      totalTriggers: triggers.length,
      enabledTriggers,
      triggerExecutions: totalExecutions,
      taskAutomationEnabled: this.taskConfig.onAssign || this.taskConfig.onComplete,
      riskAutomationEnabled: this.riskConfig.onRiskDetected
    };
  }

  /**
   * Get all automation triggers
   */
  getTriggers(): NotificationAutomationTrigger[] {
    return Array.from(this.automationTriggers.values());
  }

  /**
   * Get task automation configuration
   */
  getTaskConfig(): TaskAutomationConfig {
    return { ...this.taskConfig };
  }

  /**
   * Get risk automation configuration
   */
  getRiskConfig(): RiskAutomationConfig {
    return { ...this.riskConfig };
  }
}

// Export singleton instance
export const notificationAutomation = new NotificationAutomation();
