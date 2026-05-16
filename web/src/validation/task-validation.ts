import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client/index';

// Enterprise Validation Layer for Task Management
// Strict validation with comprehensive error handling and sanitization

// Base schemas
export const TaskIdSchema = z.string().cuid('Invalid task ID format');

export const TaskTitleSchema = z.string()
  .min(1, 'Task title is required')
  .max(200, 'Task title must be less than 200 characters')
  .trim()
  .transform(val => val.replace(/[<>]/g, '')); // XSS protection

export const TaskDescriptionSchema = z.string()
  .max(2000, 'Description must be less than 2000 characters')
  .optional()
  .nullable()
  .transform(val => val ? val.trim().replace(/[<>]/g, '') : null);

export const TaskStatusSchema = z.nativeEnum(TaskStatus, {
  errorMap: (issue, ctx) => {
    const validStatuses = Object.values(TaskStatus).join(', ');
    return { message: `Invalid status. Must be one of: ${validStatuses}` };
  }
});

export const TaskPrioritySchema = z.nativeEnum(TaskPriority, {
  errorMap: (issue, ctx) => {
    const validPriorities = Object.values(TaskPriority).join(', ');
    return { message: `Invalid priority. Must be one of: ${validPriorities}` };
  }
});

export const TaskTypeSchema = z.enum(['TASK', 'BUG', 'STORY', 'FEATURE'], {
  errorMap: (issue, ctx) => {
    return { message: 'Invalid task type. Must be one of: TASK, BUG, STORY, FEATURE' };
  }
});

export const TaskProgressSchema = z.number()
  .int('Progress must be an integer')
  .min(0, 'Progress cannot be negative')
  .max(100, 'Progress cannot exceed 100');

export const EstimatedHoursSchema = z.number()
  .positive('Estimated hours must be positive')
  .max(1000, 'Estimated hours cannot exceed 1000')
  .optional()
  .nullable();

export const ActualHoursSchema = z.number()
  .positive('Actual hours must be positive')
  .max(1000, 'Actual hours cannot exceed 1000')
  .optional()
  .nullable();

export const TaskComplexitySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'], {
  errorMap: (issue, ctx) => {
    return { message: 'Invalid complexity. Must be one of: LOW, MEDIUM, HIGH, VERY_HIGH' };
  }
});

export const TaskTagsSchema = z.array(z.string().max(50, 'Tag must be less than 50 characters'))
  .max(10, 'Cannot have more than 10 tags')
  .optional()
  .transform(tags => tags?.map(tag => tag.trim()).filter(tag => tag.length > 0));

export const CustomFieldsSchema = z.record(z.any())
  .optional()
  .nullable()
  .transform(val => val ? Object.fromEntries(
    Object.entries(val).map(([key, value]) => [
      key.trim().substring(0, 50), // Limit key length
      typeof value === 'string' ? value.replace(/[<>]/g, '').substring(0, 500) : value
    ])
  ) : null);

// Date schemas with validation
export const TaskDateSchema = z.string()
  .datetime('Invalid date format')
  .optional()
  .nullable()
  .transform(val => val ? new Date(val) : null)
  .refine(date => !date || date > new Date('2000-01-01'), 'Date must be after year 2000')
  .refine(date => !date || date < new Date('2100-01-01'), 'Date must be before year 2100');

export const DueDateSchema = TaskDateSchema.refine(
  date => !date || date > new Date(), 
  'Due date must be in the future'
);

// Assignment schemas
export const AssigneeIdSchema = z.string()
  .cuid('Invalid assignee ID format')
  .optional()
  .nullable();

export const ReviewerIdSchema = z.string()
  .cuid('Invalid reviewer ID format')
  .optional()
  .nullable();

export const WatcherIdsSchema = z.array(z.string().cuid('Invalid watcher ID format'))
  .max(20, 'Cannot have more than 20 watchers')
  .optional()
  .transform(watchers => watchers?.filter((id, index, arr) => arr.indexOf(id) === index)); // Remove duplicates

// Dependency schemas
export const DependencyIdsSchema = z.array(z.string().cuid('Invalid dependency ID format'))
  .max(20, 'Cannot have more than 20 dependencies')
  .optional()
  .transform(deps => deps?.filter((id, index, arr) => arr.indexOf(id) === index)); // Remove duplicates

// Risk and AI schemas
export const RiskScoreSchema = z.number()
  .min(0, 'Risk score cannot be negative')
  .max(100, 'Risk score cannot exceed 100')
  .optional();

export const DelayProbabilitySchema = z.number()
  .min(0, 'Delay probability cannot be negative')
  .max(100, 'Delay probability cannot exceed 100')
  .optional();

export const AIInsightsSchema = z.object({
  riskFactors: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(100).optional(),
  lastAnalyzed: z.string().datetime().optional()
}).optional().nullable();

// Complete task schemas
export const CreateTaskSchema = z.object({
  title: TaskTitleSchema,
  description: TaskDescriptionSchema,
  priority: TaskPrioritySchema.default('MEDIUM'),
  type: TaskTypeSchema.default('TASK'),
  startDate: TaskDateSchema,
  dueDate: DueDateSchema.optional(),
  estimatedHours: EstimatedHoursSchema,
  complexity: TaskComplexitySchema.optional(),
  tags: TaskTagsSchema,
  customFields: CustomFieldsSchema,
  assigneeId: AssigneeIdSchema,
  reviewerId: ReviewerIdSchema,
  watcherIds: WatcherIdsSchema,
  projectId: z.string().cuid('Invalid project ID format'),
  dependencyIds: DependencyIdsSchema
}).strict();

export const UpdateTaskSchema = z.object({
  title: TaskTitleSchema.optional(),
  description: TaskDescriptionSchema.optional(),
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  type: TaskTypeSchema.optional(),
  progress: TaskProgressSchema.optional(),
  startDate: TaskDateSchema.optional(),
  dueDate: DueDateSchema.optional(),
  estimatedHours: EstimatedHoursSchema.optional(),
  actualHours: ActualHoursSchema.optional(),
  complexity: TaskComplexitySchema.optional(),
  tags: TaskTagsSchema.optional(),
  customFields: CustomFieldsSchema.optional(),
  assigneeId: AssigneeIdSchema.optional(),
  reviewerId: ReviewerIdSchema.optional(),
  watcherIds: WatcherIdsSchema.optional(),
  dependencyIds: DependencyIdsSchema.optional(),
  riskScore: RiskScoreSchema.optional(),
  delayProbability: DelayProbabilitySchema.optional(),
  aiInsights: AIInsightsSchema.optional()
}).strict();

export const BulkTaskUpdateSchema = z.object({
  taskIds: z.array(z.string().cuid('Invalid task ID format'))
    .min(1, 'At least one task ID is required')
    .max(100, 'Cannot update more than 100 tasks at once'),
  updates: UpdateTaskSchema.partial(),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
}).strict();

// Query and filter schemas
export const TaskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  status: z.array(TaskStatusSchema).optional(),
  priority: z.array(TaskPrioritySchema).optional(),
  assigneeId: z.array(AssigneeIdSchema).optional(),
  projectId: z.array(z.string().cuid()).optional(),
  tags: z.array(z.string().max(50)).optional(),
  dueDateFrom: TaskDateSchema.optional(),
  dueDateTo: TaskDateSchema.optional(),
  createdFrom: TaskDateSchema.optional(),
  createdTo: TaskDateSchema.optional(),
  riskScoreMin: z.number().min(0).max(100).optional(),
  riskScoreMax: z.number().min(0).max(100).optional(),
  hasDependencies: z.boolean().optional(),
  isOverdue: z.boolean().optional()
}).strict();

// Task dependency schema
export const TaskDependencySchema = z.object({
  taskId: z.string().cuid('Invalid task ID format'),
  dependsOnId: z.string().cuid('Invalid dependency ID format'),
  type: z.enum(['FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH']).default('FINISH_TO_START')
}).strict();

// Task activity schema
export const TaskActivitySchema = z.object({
  taskId: z.string().cuid('Invalid task ID format'),
  userId: z.string().cuid('Invalid user ID format'),
  action: z.enum(['CREATED', 'UPDATED', 'ASSIGNED', 'UNASSIGNED', 'STATUS_CHANGED', 'COMPLETED', 'BLOCKED', 'UNBLOCKED']),
  field: z.string().max(50).optional(),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  metadata: z.record(z.any()).optional()
}).strict();

// Task time entry schema
export const TaskTimeEntrySchema = z.object({
  taskId: z.string().cuid('Invalid task ID format'),
  userId: z.string().cuid('Invalid user ID format'),
  hours: z.number().positive('Hours must be positive').max(24, 'Hours cannot exceed 24'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  date: z.string().datetime('Invalid date format')
}).strict();

// Business logic validation schemas
export const TaskStatusTransitionSchema = z.object({
  taskId: z.string().cuid(),
  currentStatus: TaskStatusSchema,
  newStatus: TaskStatusSchema,
  userId: z.string().cuid(),
  reason: z.string().max(500).optional()
}).refine(
  (data) => TaskValidator.isValidStatusTransition(data.currentStatus, data.newStatus),
  {
    message: 'Invalid status transition',
    path: ['newStatus']
  }
);

// Validation class with business logic
export class TaskValidator {
  // Valid status transitions
  private static readonly VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    'BACKLOG': ['TODO'],
    'TODO': ['IN_PROGRESS', 'BLOCKED'],
    'IN_PROGRESS': ['REVIEW', 'BLOCKED'],
    'REVIEW': ['DONE', 'IN_PROGRESS'],
    'DONE': ['BACKLOG'],
    'BLOCKED': ['TODO', 'IN_PROGRESS']
  };

  /**
   * Validate status transition
   */
  public static isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) || false;
  }

  /**
   * Validate task dependencies (prevent circular dependencies)
   */
  public static validateDependencies(taskId: string, dependencyIds: string[], existingTasks: any[]): boolean {
    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (currentId: string): boolean => {
      if (recursionStack.has(currentId)) return true;
      if (visited.has(currentId)) return false;

      visited.add(currentId);
      recursionStack.add(currentId);

      const task = existingTasks.find(t => t.id === currentId);
      if (task?.dependencyIds) {
        for (const depId of task.dependencyIds) {
          if (hasCycle(depId)) return true;
        }
      }

      recursionStack.delete(currentId);
      return false;
    };

    return !hasCycle(taskId);
  }

  /**
   * Validate task assignment constraints
   */
  public static validateAssignment(userId: string, projectId: string, userAssignments: any[]): boolean {
    // Check if user is assigned to too many high-priority tasks
    const highPriorityCount = userAssignments.filter(
      assignment => assignment.userId === userId && 
      assignment.priority === 'URGENT' && 
      assignment.status !== 'DONE'
    ).length;

    return highPriorityCount < 5; // Limit to 5 urgent tasks per user
  }

  /**
   * Validate due date constraints
   */
  public static validateDueDate(startDate: Date | null, dueDate: Date | null): boolean {
    if (!startDate || !dueDate) return true;
    return dueDate > startDate;
  }

  /**
   * Validate estimated hours based on task complexity
   */
  public static validateEstimatedHours(hours: number, complexity: string): boolean {
    const limits = {
      'LOW': 40,
      'MEDIUM': 80,
      'HIGH': 160,
      'VERY_HIGH': 320
    };
    
    const maxHours = limits[complexity as keyof typeof limits] || 80;
    return hours <= maxHours;
  }

  /**
   * Validate task completeness for status changes
   */
  public static validateTaskCompletion(task: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (task.status === 'DONE') {
      if (!task.assigneeId) errors.push('Task must have an assignee to be completed');
      if (task.progress < 100) errors.push('Task progress must be 100% to be completed');
      if (!task.actualHours) errors.push('Task must have actual hours recorded to be completed');
    }

    if (task.status === 'REVIEW') {
      if (task.progress < 80) errors.push('Task must be at least 80% complete to be submitted for review');
      if (!task.assigneeId) errors.push('Task must have an assignee to be submitted for review');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize and validate task data
   */
  public static sanitizeTaskData(data: any): any {
    // Remove any potentially harmful content
    const sanitized = { ...data };

    // Sanitize string fields
    if (sanitized.title) {
      sanitized.title = sanitized.title.replace(/[<>]/g, '').trim();
    }

    if (sanitized.description) {
      sanitized.description = sanitized.description.replace(/[<>]/g, '').trim();
    }

    // Ensure numeric fields are valid numbers
    if (sanitized.estimatedHours !== undefined) {
      sanitized.estimatedHours = Math.max(0.1, Number(sanitized.estimatedHours) || 0);
    }

    if (sanitized.actualHours !== undefined) {
      sanitized.actualHours = Math.max(0.1, Number(sanitized.actualHours) || 0);
    }

    if (sanitized.progress !== undefined) {
      sanitized.progress = Math.max(0, Math.min(100, Number(sanitized.progress) || 0));
    }

    return sanitized;
  }

  /**
   * Validate bulk operations
   */
  public static validateBulkOperation(taskIds: string[], operation: string, userRole: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (taskIds.length > 100) {
      errors.push('Cannot perform bulk operations on more than 100 tasks');
    }

    if (taskIds.length === 0) {
      errors.push('No tasks selected for bulk operation');
    }

    // Role-based validation
    if (operation === 'DELETE' && userRole !== 'ADMIN' && userRole !== 'PROJECT_MANAGER') {
      errors.push('Only admins and project managers can delete tasks');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export validation functions
export const validateCreateTask = (data: unknown) => CreateTaskSchema.parse(data);
export const validateUpdateTask = (data: unknown) => UpdateTaskSchema.parse(data);
export const validateBulkUpdate = (data: unknown) => BulkTaskUpdateSchema.parse(data);
export const validateTaskQuery = (data: unknown) => TaskQuerySchema.parse(data);
export const validateTaskDependency = (data: unknown) => TaskDependencySchema.parse(data);
export const validateTaskActivity = (data: unknown) => TaskActivitySchema.parse(data);
export const validateTimeEntry = (data: unknown) => TaskTimeEntrySchema.parse(data);

// Safe validation functions that return results instead of throwing
export const safeValidateCreateTask = (data: unknown) => {
  try {
    return { success: true, data: CreateTaskSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message),
        data: null 
      };
    }
    return { success: false, errors: ['Validation failed'], data: null };
  }
};

export const safeValidateUpdateTask = (data: unknown) => {
  try {
    return { success: true, data: UpdateTaskSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message),
        data: null 
      };
    }
    return { success: false, errors: ['Validation failed'], data: null };
  }
};

// Type exports for use in other files
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type BulkTaskUpdateInput = z.infer<typeof BulkTaskUpdateSchema>;
export type TaskQueryInput = z.infer<typeof TaskQuerySchema>;
export type TaskDependencyInput = z.infer<typeof TaskDependencySchema>;
export type TaskActivityInput = z.infer<typeof TaskActivitySchema>;
export type TaskTimeEntryInput = z.infer<typeof TaskTimeEntrySchema>;
