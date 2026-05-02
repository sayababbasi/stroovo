export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface RuleCondition {
  type: 'TASK_STATUS' | 'TASK_PRIORITY' | 'USER_WORKLOAD' | 'DEADLINE' | 'PROJECT_METRIC';
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'EXPIRES_IN';
  field: string;
  value: any;
}

export interface RuleAction {
  type: 'ASSIGN_TASK' | 'NOTIFY_USER' | 'UPDATE_PRIORITY' | 'CREATE_TASK' | 'SEND_EMAIL' | 'TRIGGER_WEBHOOK';
  parameters: Record<string, any>;
}

export interface AutomationEvent {
  type: 'task.created' | 'task.updated' | 'task.completed' | 'task.assigned' | 'deadline.approaching';
  data: any;
  timestamp: Date;
}

export class AutomationEngine {
  private rules: Map<string, AutomationRule> = new Map();
  private eventHandlers: Map<string, Array<(event: AutomationEvent) => void>> = new Map();

  addRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  updateRule(ruleId: string, updates: Partial<AutomationRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };
    this.rules.set(ruleId, updatedRule);
    return true;
  }

  getRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): AutomationRule | undefined {
    return this.rules.get(ruleId);
  }

  enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = true;
    return true;
  }

  disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = false;
    return true;
  }

  async processEvent(event: AutomationEvent): Promise<void> {
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled && this.evaluateConditions(rule.conditions, event));

    for (const rule of applicableRules) {
      try {
        await this.executeActions(rule.actions, event);
        
        rule.lastTriggered = new Date();
        rule.triggerCount += 1;
        
        console.log(`Automation rule "${rule.name}" triggered by event ${event.type}`);
      } catch (error) {
        console.error(`Error executing rule "${rule.name}":`, error);
      }
    }

    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });
  }

  private evaluateConditions(conditions: RuleCondition[], event: AutomationEvent): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => this.evaluateCondition(condition, event));
  }

  private evaluateCondition(condition: RuleCondition, event: AutomationEvent): boolean {
    const fieldValue = this.getFieldValue(condition.field, event);
    
    switch (condition.operator) {
      case 'EQUALS':
        return fieldValue === condition.value;
      case 'NOT_EQUALS':
        return fieldValue !== condition.value;
      case 'GREATER_THAN':
        return Number(fieldValue) > Number(condition.value);
      case 'LESS_THAN':
        return Number(fieldValue) < Number(condition.value);
      case 'CONTAINS':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'EXPIRES_IN':
        if (fieldValue instanceof Date) {
          const hoursUntil = (fieldValue.getTime() - Date.now()) / (1000 * 60 * 60);
          return hoursUntil <= Number(condition.value);
        }
        return false;
      default:
        return false;
    }
  }

  private getFieldValue(field: string, event: AutomationEvent): any {
    const parts = field.split('.');
    let value: any = event.data;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private async executeActions(actions: RuleAction[], event: AutomationEvent): Promise<void> {
    for (const action of actions) {
      await this.executeAction(action, event);
    }
  }

  private async executeAction(action: RuleAction, event: AutomationEvent): Promise<void> {
    switch (action.type) {
      case 'ASSIGN_TASK':
        await this.assignTask(action.parameters, event);
        break;
      case 'NOTIFY_USER':
        await this.notifyUser(action.parameters, event);
        break;
      case 'UPDATE_PRIORITY':
        await this.updatePriority(action.parameters, event);
        break;
      case 'CREATE_TASK':
        await this.createTask(action.parameters, event);
        break;
      case 'SEND_EMAIL':
        await this.sendEmail(action.parameters, event);
        break;
      case 'TRIGGER_WEBHOOK':
        await this.triggerWebhook(action.parameters, event);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async assignTask(parameters: Record<string, any>, event: AutomationEvent): Promise<void> {
    console.log(`Assigning task ${event.data.taskId} to user ${parameters.userId}`);
  }

  private async notifyUser(parameters: Record<string, any>, event: AutomationEvent): Promise<void> {
    console.log(`Notifying user ${parameters.userId}: ${parameters.message}`);
  }

  private async updatePriority(parameters: Record<string, any>, event: AutomationEvent): Promise<void> {
    console.log(`Updating task ${event.data.taskId} priority to ${parameters.priority}`);
  }

  private async createTask(parameters: Record<string, any>, event: AutomationEvent): Promise<void> {
    console.log(`Creating new task: ${parameters.title}`);
  }

  private async sendEmail(parameters: Record<string, any>, event: AutomationEvent): Promise<void> {
    console.log(`Sending email to ${parameters.to}: ${parameters.subject}`);
  }

  private async triggerWebhook(parameters: Record<string, any>, event: AutomationEvent): Promise<void> {
    console.log(`Triggering webhook: ${parameters.url}`);
  }

  onEvent(eventType: string, handler: (event: AutomationEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  offEvent(eventType: string, handler: (event: AutomationEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  createDefaultRules(): AutomationRule[] {
    return [
      {
        id: 'auto-assign-overdue',
        name: 'Auto-assign overdue tasks',
        description: 'Automatically reassign overdue tasks to available team members',
        enabled: true,
        conditions: [
          {
            type: 'TASK_STATUS',
            operator: 'NOT_EQUALS',
            field: 'status',
            value: 'COMPLETED'
          },
          {
            type: 'DEADLINE',
            operator: 'EXPIRES_IN',
            field: 'deadline',
            value: -24
          }
        ],
        actions: [
          {
            type: 'NOTIFY_USER',
            parameters: { message: 'Task is overdue and needs attention' }
          }
        ],
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'high-priority-escalation',
        name: 'High priority escalation',
        description: 'Escalate high priority tasks that are blocked',
        enabled: true,
        conditions: [
          {
            type: 'TASK_PRIORITY',
            operator: 'EQUALS',
            field: 'priority',
            value: 'HIGH'
          },
          {
            type: 'TASK_STATUS',
            operator: 'EQUALS',
            field: 'status',
            value: 'BLOCKED'
          }
        ],
        actions: [
          {
            type: 'NOTIFY_USER',
            parameters: { message: 'High priority task is blocked and needs immediate attention' }
          },
          {
            type: 'UPDATE_PRIORITY',
            parameters: { priority: 'URGENT' }
          }
        ],
        createdAt: new Date(),
        triggerCount: 0
      }
    ];
  }
}

export const automationEngine = new AutomationEngine();
