import { z } from 'zod';

// Role validation schemas
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name too long'),
  description: z.string().optional(),
  isSystem: z.boolean().optional().default(false),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name too long').optional(),
  description: z.string().optional(),
  isSystem: z.boolean().optional(),
});

export const rolePermissionSchema = z.object({
  permissionIds: z.array(z.string()).min(1, 'At least one permission is required'),
});

// Permission validation schemas
export const permissionQuerySchema = z.object({
  module: z.string().optional(),
  action: z.string().optional(),
});

// Role query schemas
export const roleQuerySchema = z.object({
  includePermissions: z.string().optional().transform(val => val === 'true'),
  isSystem: z.string().optional().transform(val => val === 'true'),
});
