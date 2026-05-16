export enum NotificationEventType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  DEADLINE_NEAR = 'DEADLINE_NEAR',
  RISK_DETECTED = 'RISK_DETECTED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_COMPLETED = 'PROJECT_COMPLETED',
  GOAL_ACHIEVED = 'GOAL_ACHIEVED',
  USER_MENTIONED = 'USER_MENTIONED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DEADLINE_MISSED = 'DEADLINE_MISSED',
  WORKLOAD_HIGH = 'WORKLOAD_HIGH',
  AUTOMATION_TRIGGERED = 'AUTOMATION_TRIGGERED',
  FORM_SUBMISSION = 'FORM_SUBMISSION'
}

export type NotificationEventKind =
  | NotificationEventType
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | 'SUCCESS';

export interface NotificationEvent {
  id: string;
  type: NotificationEventKind;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  userId: string;
  tenantId: string;
  link?: string;
  metadata?: Record<string, any>;
  shouldSend?: boolean;
  scheduledTime?: Date;
}

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  userId: string;
  tenantId: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface NotificationChannel {
  email: boolean;
  whatsapp: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationRule {
  id: string;
  name: string;
  event: string;
  condition?: Record<string, any>;
  action: string;
  channels: string[];
  enabled: boolean;
}

export interface AutomationTrigger {
  id: string;
  name: string;
  event: string;
  condition: Record<string, any>;
  action: string;
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}
