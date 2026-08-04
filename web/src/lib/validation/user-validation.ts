import { z } from 'zod';
import { UserRole } from '@prisma/client/index';

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  username: z.string().optional(),
  employeeId: z.string().optional(),
  dob: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentType: z.string().optional(),
  experienceLevel: z.string().optional(),
  jobTitle: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  deptId: z.string().optional(),
  teamId: z.string().optional(),
  reportingManagerId: z.string().optional(),
  managerId: z.string().optional(),
  phone: z.string().optional(),
  contact: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  officeLocation: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  role: z.any().optional(),
  workspaceAccess: z.string().optional(),
  permissionProfile: z.string().optional(),
  requireEmailVerification: z.boolean().optional(),
  require2FA: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  accountStatus: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  image: z.string().optional(),
  invitationMethod: z.string().optional(),
  tenantId: z.string().optional()
}).passthrough();

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.any().optional(),
  isActive: z.boolean().optional(),
  title: z.string().max(100).optional(),
  contact: z.string().max(50).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  experienceLevel: z.string().optional(),
  address: z.string().optional()
}).passthrough();

export const updateRoleSchema = z.object({
  role: z.any()
});

export const updateStatusSchema = z.object({
  isActive: z.boolean()
});

export const adminResetPasswordSchema = z.object({
  userId: z.string()
});

export const createDemoRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  company: z.string().max(100).optional(),
  message: z.string().max(500).optional()
});

export const approveDemoRequestSchema = z.object({
  tenantId: z.string().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});
