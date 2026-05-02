export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RiskLevel = 'low' | 'medium' | 'high';
export type HealthStatus = 'on_track' | 'at_risk' | 'delayed';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
  BLOCKED: 'Blocked',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export interface Subtask {
  id: string;
  title: string;
  status: string;
  priority?: Priority;
  description?: string;
  aiInsights?: AIInsight;
}

export interface TaskDependency {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface AutomationLog {
  id: string;
  rule: string;
  triggeredAt: string;
  action: string;
  success: boolean;
}

export interface AIInsight {
  riskLevel: RiskLevel;
  delayProbability: number;
  suggestions: string[];
  factors?: string[];
  reasons?: string[];
  recommendations?: string[];
  blockedReason?: string;
  overloadWarning?: boolean;
  deadlinePressure?: boolean;
  aiEnhanced?: boolean;
  generatedByAI?: boolean;
  estimatedTime?: number;
  semanticHash?: string;
}

export interface GenerationHistoryEntry {
  id: string;
  createdAt: string;
  metadata?: {
    regeneration?: boolean;
    titles?: string[];
    fingerprints?: string[];
    previousGenerations?: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project: string | { id?: string; name: string };
  status: TaskStatus;
  priority: Priority;
  progress: number;
  assignee: string | { id?: string; name: string; image?: string };
  dueDate: string;
  tags?: string[];
  health?: HealthStatus;
  subtasks?: Subtask[];
  comments?: number;
  files?: number;
  ai?: AIInsight;
  aiInsights?: AIInsight | { riskAnalysis?: AIInsight; [key: string]: unknown };
  riskScore?: number;
  delayProbability?: number;
  dependencies?: TaskDependency[];
  automationLogs?: AutomationLog[];
  order?: number;
  type?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number; files: number; subTasks: number };
  subTasks?: Subtask[];
  parentId?: string;
  projectId?: string;
  generationHistory?: GenerationHistoryEntry[];
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  BACKLOG: '#8A94A6',
  TODO: '#6B778C',
  IN_PROGRESS: '#0052CC',
  REVIEW: '#6554C0',
  DONE: '#36B37E',
  BLOCKED: '#FF5630',
};

export const STATUS_BG: Record<TaskStatus, string> = {
  BACKLOG: '#F4F5F7',
  TODO: '#F4F5F7',
  IN_PROGRESS: '#E6EFFF',
  REVIEW: '#EAE6FF',
  DONE: '#E3FCEF',
  BLOCKED: '#FFEBE6',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  URGENT: '#FF5630',
  HIGH: '#FFAB00',
  MEDIUM: '#0052CC',
  LOW: '#6B778C',
};

export const RISK_CONFIG: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: '#E3FCEF', text: '#36B37E', label: 'Low Risk' },
  medium: { bg: '#FFF4E6', text: '#FFAB00', label: 'Medium Risk' },
  high: { bg: '#FFEBE6', text: '#FF5630', label: 'High Risk' },
};

export const HEALTH_COLORS: Record<HealthStatus, string> = {
  on_track: '#36B37E',
  at_risk: '#FFAB00',
  delayed: '#FF5630',
};

export const STATUSES: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];
export const PRIORITIES: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
