import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { systemHealthMonitor } from '@/lib/monitoring/system-health';
import prisma from '@/lib/prisma';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Rate limit configurations for different endpoints
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - more restrictive
  'auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 minutes
  'auth/signup': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  'auth/refresh': { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 per 15 minutes
  'auth/reset-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  
  // AI endpoints - moderate
  'ai/generate': { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute
  'ai/chat': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute
  
  // Notification endpoints - higher rate
  'notifications/send': { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
  
  // General API - permissive
  'default': { windowMs: 60 * 1000, maxRequests: 1000 }, // 1000 per minute
};

// In-memory rate limiting store (in production, use Redis)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number; lastRequest: number }>();

  isAllowed(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // New window or expired window
      const newRecord = {
        count: 1,
        resetTime: now + config.windowMs,
        lastRequest: now
      };
      this.store.set(key, newRecord);
      return { allowed: true, remaining: config.maxRequests - 1, resetTime: newRecord.resetTime };
    }

    // Existing window
    if (record.count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    record.lastRequest = now;
    return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Clean up rate limit store periodically
setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000); // Every 5 minutes

// Schema definitions
export const schemas = {
  // Authentication schemas
  auth: {
    login: z.object({
      email: z.string().email('Invalid email format').max(255),
      password: z.string().min(1, 'Password is required').max(128),
      mfaToken: z.string().regex(/^\d{6}$/, 'MFA token must be 6 digits').optional(),
      sessionId: z.string().uuid().optional()
    }),
    signup: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(100),
      email: z.string().email('Invalid email format').max(255),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password too long')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[a-z]/, 'Password must contain lowercase letter')
        .regex(/\d/, 'Password must contain number')
        .regex(/[!@#$%^&*]/, 'Password must contain special character'),
      role: z.enum(['USER', 'ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']).optional()
    }),
    refreshToken: z.object({}),
    logout: z.object({})
  },

  // AI schemas
  ai: {
    generate: z.object({
      prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
      model: z.string().optional(),
      options: z.object({
        temperature: z.number().min(0).max(2).optional(),
        max_tokens: z.number().min(1).max(4000).optional(),
        top_p: z.number().min(0).max(1).optional()
      }).optional()
    }),
    chat: z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(4000)
      })).min(1, 'At least one message required').max(50, 'Too many messages'),
      model: z.string().optional(),
      options: z.object({
        temperature: z.number().min(0).max(2).optional(),
        max_tokens: z.number().min(1).max(4000).optional()
      }).optional()
    })
  },

  // Notification schemas
  notifications: {
    send: z.object({
      userId: z.string().uuid(),
      type: z.enum(['email', 'whatsapp', 'push', 'sms']),
      title: z.string().min(1).max(200),
      message: z.string().min(1).max(1000),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      metadata: z.record(z.any()).optional()
    }),
    bulk: z.object({
      notifications: z.array(z.object({
        userId: z.string().uuid(),
        type: z.enum(['email', 'whatsapp', 'push', 'sms']),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(1000)
      })).min(1).max(100)
    })
  },

  // User management schemas
  users: {
    update: z.object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().max(255).optional(),
      role: z.enum(['USER', 'ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']).optional(),
      title: z.string().max(100).optional(),
      contact: z.string().max(500).optional()
    })
  }
};

// Error response generator
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function createErrorResponse(error: APIError | Error | unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString()
      }
    }, { status: error.statusCode });
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        timestamp: new Date().toISOString()
      }
    }, { status: 400 });
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && 'body' in error) {
    return NextResponse.json({
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
        timestamp: new Date().toISOString()
      }
    }, { status: 400 });
  }

  // Generic error
  return NextResponse.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    }
  }, { status: 500 });
}

// Validation middleware
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ data: T; error?: NextResponse }> => {
    try {
      const body = await request.json();
      const data = schema.parse(body);
      return { data };
    } catch (error) {
      return { data: null as any, error: createErrorResponse(error) };
    }
  };
}

// Rate limiting middleware
export function createRateLimiter(endpointKey: string) {
  const config = RATE_LIMITS[endpointKey] || RATE_LIMITS.default;
  
  return async (request: NextRequest): Promise<{ allowed: boolean; error?: NextResponse }> => {
    // Extract client identifier (IP address or user ID)
    const clientId = getClientIdentifier(request);
    const key = `${endpointKey}:${clientId}`;
    
    const result = rateLimitStore.isAllowed(key, config);
    
    if (!result.allowed) {
      const error = new APIError(
        429,
        'RATE_LIMIT_EXCEEDED',
        'Too many requests',
        {
          limit: config.maxRequests,
          windowMs: config.windowMs,
          resetTime: new Date(result.resetTime).toISOString(),
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }
      );
      
      return { allowed: false, error: createErrorResponse(error) };
    }
    
    return { allowed: true };
  };
}

// Request logging middleware
export async function logRequest(request: NextRequest, endpoint: string, statusCode: number, duration: number): Promise<void> {
  try {
    const monitor = systemHealthMonitor(prisma);
    monitor.recordRequest(duration, statusCode < 400);
    
    // Log to database for analytics
    const logEntry = {
      endpoint,
      method: request.method,
      statusCode,
      duration,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: getClientIdentifier(request),
      timestamp: new Date()
    };
    
    // In production, you'd store this in a logs table or logging service
    console.log('Request logged:', logEntry);
  } catch (error) {
    console.error('Failed to log request:', error);
  }
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS headers for API
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

// Input sanitization
export function sanitizeInput(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potential XSS and injection attempts
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/[<>]/g, '') // Remove HTML tags
        .trim()
        .substring(0, 10000); // Limit length
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => sanitizeInput(item));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Helper function to get client identifier
function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from token (for authenticated requests)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // In a real implementation, you'd decode the JWT to get user ID
    // For now, use the token as identifier
    return authHeader.substring(0, 20); // Truncate for privacy
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIP || 'unknown';
  
  return ip;
}

// Comprehensive API wrapper
export function createSecureHandler<T = any>(options: {
  schema?: z.ZodSchema<T>;
  rateLimitKey?: string;
  requireAuth?: boolean;
  allowedRoles?: string[];
  handler: (data: T, request: NextRequest, context?: any) => Promise<NextResponse>;
}) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    let statusCode = 500;
    
    try {
      // Handle OPTIONS requests for CORS
      if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        return addSecurityHeaders(response);
      }

      // Rate limiting
      if (options.rateLimitKey) {
        const rateLimiter = createRateLimiter(options.rateLimitKey);
        const rateLimitResult = await rateLimiter(request as NextRequest);
        if (!rateLimitResult.allowed) {
          return rateLimitResult.error!;
        }
      }

      // Authentication check (simplified - would use actual auth middleware)
      if (options.requireAuth) {
        const authHeader = (request as NextRequest).headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          throw new APIError(401, 'UNAUTHORIZED', 'Authentication required');
        }
        // In production, validate the token and extract user info
      }

      // Request body validation
      let data: T = {} as T;
      if (options.schema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const validator = createValidator(options.schema);
        const validationResult = await validator(request as NextRequest);
        if (validationResult.error) {
          return validationResult.error;
        }
        data = validationResult.data;
        
        // Sanitize input
        data = sanitizeInput(data);
      }

      // Execute handler
      const response = await options.handler(data, request as NextRequest, context);
      statusCode = response.status || 200;
      
      // Add security headers
      return addSecurityHeaders(response);
      
    } catch (error) {
      statusCode = error instanceof APIError ? error.statusCode : 500;
      return createErrorResponse(error);
    } finally {
      // Log the request
      await logRequest(request as NextRequest, options.rateLimitKey || 'unknown', statusCode, Date.now() - startTime);
    }
  };
}

// Pre-built validators for common endpoints
export const validators = {
  login: createValidator(schemas.auth.login),
  signup: createValidator(schemas.auth.signup),
  aiGenerate: createValidator(schemas.ai.generate),
  aiChat: createValidator(schemas.ai.chat),
  sendNotification: createValidator(schemas.notifications.send),
  bulkNotifications: createValidator(schemas.notifications.bulk),
  updateUser: createValidator(schemas.users.update)
};

// Pre-built rate limiters
export const rateLimiters = {
  auth: {
    login: createRateLimiter('auth/login'),
    signup: createRateLimiter('auth/signup'),
    refresh: createRateLimiter('auth/refresh'),
    resetPassword: createRateLimiter('auth/reset-password')
  },
  ai: {
    generate: createRateLimiter('ai/generate'),
    chat: createRateLimiter('ai/chat')
  },
  notifications: {
    send: createRateLimiter('notifications/send')
  }
};
