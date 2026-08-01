import { z } from 'zod';

export const createAccessPolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'PAUSED', 'EXPIRED', 'ARCHIVED']).default('ACTIVE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  effect: z.enum(['ALLOW', 'DENY']).default('ALLOW'),
  
  appliesToAll: z.boolean().default(false),
  userIds: z.array(z.string()).optional(),
  roleIds: z.array(z.string()).optional(),
  teamIds: z.array(z.string()).optional(),
  
  resources: z.array(z.string()).min(1, 'At least one resource is required'),
  actions: z.array(z.string()).optional(),
  
  mfaRequired: z.enum(['REQUIRED', 'OPTIONAL', 'NOT_REQUIRED']).default('OPTIONAL'),
  approvalRequired: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  allowedDays: z.array(z.number()).optional(),
  timezone: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  
  allowedIps: z.array(z.string()).optional(),
  blockedIps: z.array(z.string()).optional(),
  allowedCountries: z.array(z.string()).optional(),
  blockedCountries: z.array(z.string()).optional(),
  
  requireManagedDevice: z.boolean().default(false),
  requireTrustedDevice: z.boolean().default(false),
});

export const updateAccessPolicySchema = createAccessPolicySchema.partial();
