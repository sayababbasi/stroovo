import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client/index';

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  type: z.string().default('TASK'),
  projectId: z.string().min(1, 'Project ID is required'),
  assigneeId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
}).strict();

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  type: z.string().optional(),
  projectId: z.string().min(1).optional().nullable().transform(val => val === '' ? null : val),
  assigneeId: z.string().optional().nullable().transform(val => val === '' ? null : val),
  parentId: z.string().optional().nullable().transform(val => val === '' ? null : val),
  teamId: z.string().optional().nullable().transform(val => val === '' ? null : val),
  startDate: z.string().datetime().optional().nullable().transform(val => val === '' ? null : val),
  dueDate: z.string().datetime().optional().nullable().transform(val => val === '' ? null : val),
  progress: z.number().min(0).max(100).optional(),
}).strict();

export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;
