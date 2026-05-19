import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Security constants
export const SECURITY_CONFIG = {
  // JWT Settings
  JWT_SECRET: process.env.JWT_SECRET || 'revotic-ai-workflow-secret-2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'revotic-ai-workflow-refresh-secret-2026',
  JWT_ACCESS_EXPIRY: '15m', // Shorter for security
  JWT_REFRESH_EXPIRY: '7d',
  
  // Password Security
  BCRYPT_ROUNDS: 12, // Increased from 10 for better security
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  
  // Rate Limiting
  LOGIN_ATTEMPTS_LIMIT: 5,
  LOGIN_ATTEMPTS_WINDOW: 15 * 60 * 1000, // 15 minutes
  ACCOUNT_LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  
  // Session Security
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  MAX_CONCURRENT_SESSIONS: 5,
  
  // Token Security
  TOKEN_LENGTH: 32,
  SALT_ROUNDS: 16,
} as const;

// Password strength validation
export interface PasswordStrengthResult {
  isValid: boolean;
  strength: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG';
  score: number;
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    feedback.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`);
  } else {
    score += 1;
  }

  if (password.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
    feedback.push(`Password must not exceed ${SECURITY_CONFIG.PASSWORD_MAX_LENGTH} characters`);
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  // Additional security checks
  if (!/(.)\1{2,}/.test(password)) {
    score += 1; // No repeating characters
  } else {
    feedback.push('Avoid repeating characters');
  }

  // Common password patterns
  const commonPatterns = [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i,
    /letmein/i,
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (!hasCommonPattern) {
    score += 1;
  } else {
    feedback.push('Avoid common password patterns');
  }

  // Determine strength
  let strength: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG';
  if (score <= 2) {
    strength = 'WEAK';
  } else if (score <= 4) {
    strength = 'FAIR';
  } else if (score <= 6) {
    strength = 'GOOD';
  } else {
    strength = 'STRONG';
  }

  return {
    isValid: score >= 4 && password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
    strength,
    score,
    feedback,
  };
}

// Enhanced password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SECURITY_CONFIG.BCRYPT_ROUNDS);
  return bcrypt.hash(password, salt);
}

// Secure password verification with timing attack protection
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // Log error but don't reveal specific failure
    console.error('Password verification error:', error);
    return false;
  }
}

// Generate secure random tokens
export function generateSecureToken(length: number = SECURITY_CONFIG.TOKEN_LENGTH): string {
  return crypto.randomBytes(length).toString('hex');
}

// Generate secure session token hash
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Extract IP address from request
export function extractIPAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIP || 'unknown';
  return ip.trim();
}

// Extract user agent from request
export function extractUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Parse device information from user agent
export function parseDeviceInfo(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Unknown';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  // OS detection
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios')) os = 'iOS';

  // Device type detection
  let device = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('ios')) {
    device = 'Mobile';
  } else if (ua.includes('tablet')) {
    device = 'Tablet';
  }

  return { browser, os, device };
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('base64');
}

// Verify CSRF token
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  try {
    const expectedHash = crypto
      .createHmac('sha256', sessionToken)
      .update('csrf-protection')
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(token, 'base64'),
      Buffer.from(expectedHash, 'base64')
    );
  } catch {
    return false;
  }
}

// Rate limiting helper
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }

  getResetTime(key: string): number | null {
    const record = this.attempts.get(key);
    return record ? record.resetTime : null;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Create rate limiters for different purposes
export const loginRateLimiter = new RateLimiter(
  SECURITY_CONFIG.LOGIN_ATTEMPTS_LIMIT,
  SECURITY_CONFIG.LOGIN_ATTEMPTS_WINDOW
);

export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 per hour
export const signupRateLimiter = new RateLimiter(5, 60 * 60 * 1000); // 5 per hour
