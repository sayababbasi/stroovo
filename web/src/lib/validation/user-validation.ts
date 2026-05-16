import { z } from 'zod';
import { UserRole } from '@prisma/client/index';

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).optional(),
  tenantId: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  experienceLevel: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional()
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  title: z.string().max(100).optional(),
  contact: z.string().max(50).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  experienceLevel: z.string().optional(),
  address: z.string().optional()
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole)
});

export const updateStatusSchema = z.object({
  isActive: z.boolean()
});

export const adminResetPasswordSchema = z.object({
  userId: z.string()
});

// Demo request validation schemas
export const createDemoRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  company: z.string().max(100).optional(),
  message: z.string().max(500).optional()
});

export const approveDemoRequestSchema = z.object({
  tenantId: z.string().optional()
});

// Password reset validation schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

// Query parameter validation
export const userQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
  search: z.string().optional(),
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number)
}).passthrough();

export const demoRequestQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  search: z.string().optional()
}).passthrough();
