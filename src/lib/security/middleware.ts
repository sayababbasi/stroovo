import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, loginRateLimiter, passwordResetRateLimiter, signupRateLimiter } from '@/lib/auth/security';
import { extractIPAddress, extractUserAgent, generateCSRFToken, verifyCSRFToken } from '@/lib/auth/security';
import { verifyAccessToken } from '@/lib/auth/tokens';
import prisma from '@/lib/prisma';

// Security middleware configuration
interface SecurityConfig {
  enableRateLimit: boolean;
  enableCSRF: boolean;
  enableXSSProtection: boolean;
  enableIPTracking: boolean;
  enableBruteForceProtection: boolean;
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableRateLimit: true,
  enableCSRF: true,
  enableXSSProtection: true,
  enableIPTracking: true,
  enableBruteForceProtection: true,
};

// Rate limiters for different endpoints
const rateLimiters = {
  login: loginRateLimiter,
  signup: signupRateLimiter,
  passwordReset: passwordResetRateLimiter,
  general: new RateLimiter(100, 60 * 1000), // 100 requests per minute
  api: new RateLimiter(1000, 60 * 1000), // 1000 requests per minute for API
};

// IP reputation tracking
class IPReputationService {
  private static instance: IPReputationService;
  private reputationCache = new Map<string, { reputation: number; lastUpdated: number }>();

  static getInstance(): IPReputationService {
    if (!IPReputationService.instance) {
      IPReputationService.instance = new IPReputationService();
    }
    return IPReputationService.instance;
  }

  async getIPReputation(ip: string): Promise<number> {
    // Check cache first
    const cached = this.reputationCache.get(ip);
    if (cached && Date.now() - cached.lastUpdated < 5 * 60 * 1000) { // 5 minutes cache
      return cached.reputation;
    }

    try {
      // Query database for IP reputation
      const ipRep = await prisma.iPReputation.findUnique({
        where: { ipAddress: ip }
      });

      const reputation = ipRep?.reputation || 0;
      
      // Update cache
      this.reputationCache.set(ip, {
        reputation,
        lastUpdated: Date.now()
      });

      return reputation;
    } catch (error) {
      console.error('Error fetching IP reputation:', error);
      return 0;
    }
  }

  async updateIPReputation(ip: string, delta: number, metadata?: any): Promise<void> {
    try {
      const existing = await prisma.iPReputation.findUnique({
        where: { ipAddress: ip }
      });

      if (existing) {
        await prisma.iPReputation.update({
          where: { ipAddress: ip },
          data: {
            reputation: Math.max(-100, Math.min(100, existing.reputation + delta)),
            totalAttempts: { increment: delta < 0 ? 0 : 1 },
            failedAttempts: { increment: delta < 0 ? 1 : 0 },
            lastSeen: new Date(),
            metadata: metadata || existing.metadata
          }
        });
      } else {
        await prisma.iPReputation.create({
          data: {
            ipAddress: ip,
            reputation: Math.max(-100, Math.min(100, delta)),
            totalAttempts: delta > 0 ? 1 : 0,
            failedAttempts: delta < 0 ? 1 : 0,
            metadata
          }
        });
      }

      // Update cache
      this.reputationCache.set(ip, {
        reputation: Math.max(-100, Math.min(100, (this.reputationCache.get(ip)?.reputation || 0) + delta)),
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error updating IP reputation:', error);
    }
  }

  isIPBlocked(ip: string): boolean {
    const cached = this.reputationCache.get(ip);
    return cached ? cached.reputation < -50 : false;
  }
}

// Security headers middleware
function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Type Options
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Frame Options
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
  );
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

// Input sanitization middleware
function sanitizeRequestBody(body: any): any {
  if (typeof body !== 'object' || body === null) {
    return body;
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      // Basic XSS prevention
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim()
        .substring(0, 10000); // Limit length
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? item.replace(/[<>]/g, '').trim().substring(0, 1000) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestBody(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// CSRF protection middleware
async function csrfProtection(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  const method = request.method;
  
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  // Check for CSRF token
  const csrfToken = request.headers.get('X-CSRF-Token');
  const sessionToken = request.cookies.get('accessToken')?.value;

  if (!csrfToken || !sessionToken) {
    return { valid: false, error: 'CSRF token missing' };
  }

  const isValid = verifyCSRFToken(csrfToken, sessionToken);
  
  return { valid: isValid, error: isValid ? undefined : 'Invalid CSRF token' };
}

// Rate limiting middleware
async function rateLimitProtection(
  request: NextRequest,
  endpoint: keyof typeof rateLimiters
): Promise<{ allowed: boolean; error?: string; remaining?: number }> {
  const ip = extractIPAddress(request);
  const limiter = rateLimiters[endpoint];
  
  if (!limiter.isAllowed(ip)) {
    return { 
      allowed: false, 
      error: 'Rate limit exceeded',
      remaining: 0
    };
  }

  return { 
    allowed: true,
    remaining: limiter.getRemainingAttempts(ip)
  };
}

// Brute force protection middleware
async function bruteForceProtection(request: NextRequest, email?: string): Promise<{ allowed: boolean; error?: string }> {
  const ip = extractIPAddress(request);
  const ipRepService = IPReputationService.getInstance();
  
  // Check IP reputation
  const reputation = await ipRepService.getIPReputation(ip);
  if (reputation < -50) {
    return { allowed: false, error: 'IP address blocked due to suspicious activity' };
  }

  // Check login attempts for this IP/email combination
  if (email) {
    try {
      const loginAttempt = await prisma.loginAttempt.findUnique({
        where: { ipAddress_email: { ipAddress: ip, email } }
      });

      if (loginAttempt && loginAttempt.isBlocked && loginAttempt.blockedUntil && loginAttempt.blockedUntil > new Date()) {
        return { allowed: false, error: 'Too many failed attempts. Please try again later.' };
      }
    } catch (error) {
      console.error('Error checking login attempts:', error);
    }
  }

  return { allowed: true };
}

// Main security middleware
export async function securityMiddleware(
  request: NextRequest,
  config: Partial<SecurityConfig> = {}
): Promise<{ 
  response?: NextResponse; 
  error?: string; 
  context?: SecurityContext 
}> {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  const ip = extractIPAddress(request);
  const userAgent = extractUserAgent(request);
  
  const context: SecurityContext = {
    ip,
    userAgent,
    reputation: 0,
    riskScore: 0,
  };

  try {
    // IP reputation check
    if (securityConfig.enableIPTracking) {
      const ipRepService = IPReputationService.getInstance();
      context.reputation = await ipRepService.getIPReputation(ip);
      
      if (context.reputation < -50) {
        return { error: 'Access denied: IP address blocked' };
      }
    }

    // XSS protection headers
    if (securityConfig.enableXSSProtection) {
      // This will be applied to the response
    }

    // CSRF protection for state-changing requests
    if (securityConfig.enableCSRF && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const csrfResult = await csrfProtection(request);
      if (!csrfResult.valid) {
        return { error: csrfResult.error || 'CSRF validation failed' };
      }
    }

    // Rate limiting
    if (securityConfig.enableRateLimit) {
      // Determine which rate limiter to use based on the path
      const path = request.nextUrl.pathname;
      let endpoint: keyof typeof rateLimiters = 'general';
      
      if (path.includes('/auth/login')) endpoint = 'login';
      else if (path.includes('/auth/signup')) endpoint = 'signup';
      else if (path.includes('/auth/reset-password')) endpoint = 'passwordReset';
      else if (path.startsWith('/api/')) endpoint = 'api';

      const rateLimitResult = await rateLimitProtection(request, endpoint);
      if (!rateLimitResult.allowed) {
        return { error: rateLimitResult.error || 'Rate limit exceeded' };
      }
      
      context.remainingRequests = rateLimitResult.remaining;
    }

    // Brute force protection for auth endpoints
    if (securityConfig.enableBruteForceProtection && request.nextUrl.pathname.includes('/auth/')) {
      const body = await request.clone().json().catch(() => ({}));
      const bruteForceResult = await bruteForceProtection(request, body.email);
      if (!bruteForceResult.allowed) {
        return { error: bruteForceResult.error || 'Brute force protection triggered' };
      }
    }

    return { context };

  } catch (error) {
    console.error('Security middleware error:', error);
    // Fail open - allow request but log error
    return { context };
  }
}

// Security context interface
export interface SecurityContext {
  ip: string;
  userAgent: string;
  reputation: number;
  riskScore: number;
  remainingRequests?: number;
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  return addSecurityHeaders(response);
}

// Sanitize request data
export function sanitizeRequest(request: NextRequest): NextRequest {
  // This is a simplified version - in practice, you'd want to clone and modify the request
  return request;
}

// Log security events
export async function logSecurityEvent(
  event: string,
  context: SecurityContext,
  metadata?: any
): Promise<void> {
  try {
    await prisma.authLog.create({
      data: {
        action: 'SUSPICIOUS_LOGIN' as any, // This should be an enum value
        ipAddress: context.ip,
        userAgent: context.userAgent,
        status: 'SUSPICIOUS' as any,
        details: event,
        metadata: {
          ...metadata,
          reputation: context.reputation,
          riskScore: context.riskScore,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Generate CSRF token for client
export function generateClientCSRFToken(sessionToken: string): string {
  return generateCSRFToken();
}

// Middleware wrapper for Next.js routes
export function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  config?: Partial<SecurityConfig>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Run security middleware
    const securityResult = await securityMiddleware(request, config);
    
    if (securityResult.error) {
      const response = NextResponse.json(
        { error: securityResult.error },
        { status: 429 } // Too Many Requests
      );
      return applySecurityHeaders(response);
    }

    // Sanitize request body if it exists
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.json();
        const sanitizedBody = sanitizeRequestBody(body);
        
        // Create a new request with sanitized body
        const newRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(sanitizedBody)
        });
        
        // Call the handler with sanitized request
        const response = await handler(newRequest, securityResult.context);
        return applySecurityHeaders(response);
      } catch (error) {
        // If sanitization fails, proceed with original request
        const response = await handler(request, securityResult.context);
        return applySecurityHeaders(response);
      }
    }

    // Call the handler
    const response = await handler(request, securityResult.context);
    return applySecurityHeaders(response);
  };
}

export { IPReputationService };
