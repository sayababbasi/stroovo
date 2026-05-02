import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    maxRequestsPerDay: number;
  };
  spamProtection: {
    enabled: boolean;
    maxSimilarNotifications: number;
    timeWindowMinutes: number;
    contentFiltering: boolean;
    blockedKeywords: string[];
  };
  authentication: {
    requireAuth: boolean;
    allowedRoles: string[];
    validateTenant: boolean;
  };
  validation: {
    maxTitleLength: number;
    maxMessageLength: number;
    allowedTypes: string[];
    allowedPriorities: string[];
  };
}

export interface RateLimitInfo {
  currentMinute: number;
  currentHour: number;
  currentDay: number;
  resetTime: Date;
  isBlocked: boolean;
}

export interface SecurityViolation {
  type: 'RATE_LIMIT' | 'SPAM' | 'INVALID_AUTH' | 'VALIDATION_ERROR';
  userId: string;
  tenantId: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class NotificationSecurity {
  private config: SecurityConfig;
  private rateLimitMap: Map<string, RateLimitInfo> = new Map();
  private securityViolations: SecurityViolation[] = [];
  private blockedIPs: Set<string> = new Set();
  private blockedUsers: Set<string> = new Set();

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializeBlockedLists();
  }

  /**
   * Get default security configuration
   */
  private getDefaultConfig(): SecurityConfig {
    return {
      rateLimiting: {
        enabled: true,
        maxRequestsPerMinute: 10,
        maxRequestsPerHour: 100,
        maxRequestsPerDay: 500
      },
      spamProtection: {
        enabled: true,
        maxSimilarNotifications: 3,
        timeWindowMinutes: 5,
        contentFiltering: true,
        blockedKeywords: [
          'spam', 'scam', 'phishing', 'malware', 'virus',
          'clickbait', 'fake', 'hoax', 'misinformation'
        ]
      },
      authentication: {
        requireAuth: true,
        allowedRoles: ['ADMIN', 'MANAGER', 'USER'],
        validateTenant: true
      },
      validation: {
        maxTitleLength: 200,
        maxMessageLength: 2000,
        allowedTypes: ['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'DEADLINE_NEAR', 'RISK_DETECTED'],
        allowedPriorities: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      }
    };
  }

  /**
   * Initialize blocked lists
   */
  private initializeBlockedLists(): void {
    // Load blocked IPs and users from database or configuration
    // For now, using empty sets
  }

  /**
   * Validate and secure notification request
   */
  async validateNotificationRequest(
    request: NextRequest,
    notificationData: any
  ): Promise<{ isValid: boolean; error?: string; violation?: SecurityViolation }> {
    const userId = notificationData.userId;
    const tenantId = notificationData.tenantId;
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check if user or IP is blocked
    if (this.blockedUsers.has(userId) || this.blockedIPs.has(ipAddress)) {
      const violation: SecurityViolation = {
        type: 'INVALID_AUTH',
        userId,
        tenantId,
        details: 'User or IP is blocked',
        timestamp: new Date(),
        ipAddress,
        userAgent
      };
      
      this.logSecurityViolation(violation);
      return { isValid: false, error: 'Access denied', violation };
    }

    // Validate authentication
    const authResult = await this.validateAuthentication(userId, tenantId);
    if (!authResult.isValid) {
      const violation: SecurityViolation = {
        type: 'INVALID_AUTH',
        userId,
        tenantId,
        details: authResult.error || 'Authentication failed',
        timestamp: new Date(),
        ipAddress,
        userAgent
      };
      
      this.logSecurityViolation(violation);
      return { isValid: false, error: authResult.error, violation };
    }

    // Check rate limiting
    const rateLimitResult = this.checkRateLimit(userId);
    if (!rateLimitResult.isValid) {
      const violation: SecurityViolation = {
        type: 'RATE_LIMIT',
        userId,
        tenantId,
        details: rateLimitResult.error || 'Rate limit exceeded',
        timestamp: new Date(),
        ipAddress,
        userAgent
      };
      
      this.logSecurityViolation(violation);
      return { isValid: false, error: rateLimitResult.error, violation };
    }

    // Check for spam
    const spamResult = await this.checkSpam(userId, tenantId, notificationData);
    if (!spamResult.isValid) {
      const violation: SecurityViolation = {
        type: 'SPAM',
        userId,
        tenantId,
        details: spamResult.error || 'Spam detected',
        timestamp: new Date(),
        ipAddress,
        userAgent
      };
      
      this.logSecurityViolation(violation);
      return { isValid: false, error: spamResult.error, violation };
    }

    // Validate notification content
    const validationResult = this.validateNotificationContent(notificationData);
    if (!validationResult.isValid) {
      const violation: SecurityViolation = {
        type: 'VALIDATION_ERROR',
        userId,
        tenantId,
        details: validationResult.error || 'Validation failed',
        timestamp: new Date(),
        ipAddress,
        userAgent
      };
      
      this.logSecurityViolation(violation);
      return { isValid: false, error: validationResult.error, violation };
    }

    return { isValid: true };
  }

  /**
   * Validate user authentication
   */
  private async validateAuthentication(userId: string, tenantId: string): Promise<{ isValid: boolean; error?: string }> {
    if (!this.config.authentication.requireAuth) {
      return { isValid: true };
    }

    try {
      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true }
      });

      if (!user) {
        return { isValid: false, error: 'User not found' };
      }

      if (!user.tenantId || user.tenantId !== tenantId) {
        return { isValid: false, error: 'Invalid tenant' };
      }

      if (!this.config.authentication.allowedRoles.includes(user.role)) {
        return { isValid: false, error: 'Insufficient permissions' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Authentication validation error:', error);
      return { isValid: false, error: 'Authentication failed' };
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(userId: string): { isValid: boolean; error?: string } {
    if (!this.config.rateLimiting.enabled) {
      return { isValid: true };
    }

    const now = new Date();
    const rateLimitInfo = this.rateLimitMap.get(userId) || {
      currentMinute: 0,
      currentHour: 0,
      currentDay: 0,
      resetTime: new Date(now.getTime() + 60000), // 1 minute from now
      isBlocked: false
    };

    // Update counters based on current time
    this.updateRateLimitCounters(rateLimitInfo, now);

    // Check limits
    if (rateLimitInfo.currentMinute >= this.config.rateLimiting.maxRequestsPerMinute) {
      return { isValid: false, error: 'Rate limit exceeded (per minute)' };
    }

    if (rateLimitInfo.currentHour >= this.config.rateLimiting.maxRequestsPerHour) {
      return { isValid: false, error: 'Rate limit exceeded (per hour)' };
    }

    if (rateLimitInfo.currentDay >= this.config.rateLimiting.maxRequestsPerDay) {
      return { isValid: false, error: 'Rate limit exceeded (per day)' };
    }

    // Increment counters
    rateLimitInfo.currentMinute++;
    rateLimitInfo.currentHour++;
    rateLimitInfo.currentDay++;

    this.rateLimitMap.set(userId, rateLimitInfo);

    return { isValid: true };
  }

  /**
   * Update rate limit counters based on time
   */
  private updateRateLimitCounters(rateLimitInfo: RateLimitInfo, now: Date): void {
    const lastReset = rateLimitInfo.resetTime;
    
    // Reset counters if time window has passed
    if (now.getTime() >= lastReset.getTime()) {
      rateLimitInfo.currentMinute = 0;
      rateLimitInfo.resetTime = new Date(now.getTime() + 60000);
    }

    // Reset hour counter if new hour
    if (now.getHours() !== lastReset.getHours()) {
      rateLimitInfo.currentHour = 0;
    }

    // Reset day counter if new day
    if (now.getDate() !== lastReset.getDate()) {
      rateLimitInfo.currentDay = 0;
    }
  }

  /**
   * Check for spam
   */
  private async checkSpam(
    userId: string,
    tenantId: string,
    notificationData: any
  ): Promise<{ isValid: boolean; error?: string }> {
    if (!this.config.spamProtection.enabled) {
      return { isValid: true };
    }

    // Check for blocked keywords
    if (this.config.spamProtection.contentFiltering) {
      const content = `${notificationData.title} ${notificationData.message}`.toLowerCase();
      const hasBlockedKeyword = this.config.spamProtection.blockedKeywords.some(keyword =>
        content.includes(keyword.toLowerCase())
      );

      if (hasBlockedKeyword) {
        return { isValid: false, error: 'Content contains blocked keywords' };
      }
    }

    // Check for similar notifications in time window
    const timeWindow = new Date(Date.now() - this.config.spamProtection.timeWindowMinutes * 60000);
    
    try {
      const similarNotifications = await prisma.notification.count({
        where: {
          userId,
          tenantId,
          title: notificationData.title,
          message: notificationData.message,
          createdAt: {
            gte: timeWindow
          }
        }
      });

      if (similarNotifications >= this.config.spamProtection.maxSimilarNotifications) {
        return { isValid: false, error: 'Too many similar notifications' };
      }
    } catch (error) {
      console.error('Spam check error:', error);
      // Allow request if spam check fails
    }

    return { isValid: true };
  }

  /**
   * Validate notification content
   */
  private validateNotificationContent(notificationData: any): { isValid: boolean; error?: string } {
    // Check required fields
    if (!notificationData.title || typeof notificationData.title !== 'string') {
      return { isValid: false, error: 'Title is required and must be a string' };
    }

    if (!notificationData.message || typeof notificationData.message !== 'string') {
      return { isValid: false, error: 'Message is required and must be a string' };
    }

    if (!notificationData.userId || typeof notificationData.userId !== 'string') {
      return { isValid: false, error: 'User ID is required and must be a string' };
    }

    if (!notificationData.tenantId || typeof notificationData.tenantId !== 'string') {
      return { isValid: false, error: 'Tenant ID is required and must be a string' };
    }

    // Check length limits
    if (notificationData.title.length > this.config.validation.maxTitleLength) {
      return { isValid: false, error: `Title too long (max ${this.config.validation.maxTitleLength} characters)` };
    }

    if (notificationData.message.length > this.config.validation.maxMessageLength) {
      return { isValid: false, error: `Message too long (max ${this.config.validation.maxMessageLength} characters)` };
    }

    // Check allowed types
    if (notificationData.type && !this.config.validation.allowedTypes.includes(notificationData.type)) {
      return { isValid: false, error: 'Invalid notification type' };
    }

    // Check allowed priorities
    if (notificationData.priority && !this.config.validation.allowedPriorities.includes(notificationData.priority)) {
      return { isValid: false, error: 'Invalid notification priority' };
    }

    // Sanitize content (basic XSS protection)
    if (this.containsXSS(notificationData.title) || this.containsXSS(notificationData.message)) {
      return { isValid: false, error: 'Invalid content detected' };
    }

    return { isValid: true };
  }

  /**
   * Basic XSS protection
   */
  private containsXSS(content: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*src[^>]*javascript:/gi,
      /<\s*script/gi,
      /<\s*object/gi,
      /<\s*embed/gi,
      /<\s*link/gi
    ];

    return xssPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIP || 'unknown';
    return ip.trim();
  }

  /**
   * Log security violation
   */
  private logSecurityViolation(violation: SecurityViolation): void {
    this.securityViolations.push(violation);

    // Keep only last 1000 violations
    if (this.securityViolations.length > 1000) {
      this.securityViolations = this.securityViolations.slice(-1000);
    }

    // Log to console (in production, log to security monitoring system)
    console.warn('Security violation:', violation);

    // Auto-block user or IP if too many violations
    this.checkForAutoBlock(violation);
  }

  /**
   * Check for auto-blocking
   */
  private checkForAutoBlock(violation: SecurityViolation): void {
    const recentViolations = this.securityViolations.filter(v =>
      v.userId === violation.userId &&
      (Date.now() - v.timestamp.getTime()) < 60000 // Last minute
    );

    if (recentViolations.length >= 10) {
      this.blockedUsers.add(violation.userId);
      console.warn(`User ${violation.userId} auto-blocked due to excessive violations`);
    }

    const recentIPViolations = this.securityViolations.filter(v =>
      v.ipAddress === violation.ipAddress &&
      (Date.now() - v.timestamp.getTime()) < 60000 // Last minute
    );

    if (recentIPViolations.length >= 20) {
      this.blockedIPs.add(violation.ipAddress!);
      console.warn(`IP ${violation.ipAddress} auto-blocked due to excessive violations`);
    }
  }

  /**
   * Block user
   */
  blockUser(userId: string, reason?: string): void {
    this.blockedUsers.add(userId);
    console.warn(`User ${userId} blocked. Reason: ${reason || 'Manual block'}`);
  }

  /**
   * Block IP address
   */
  blockIP(ipAddress: string, reason?: string): void {
    this.blockedIPs.add(ipAddress);
    console.warn(`IP ${ipAddress} blocked. Reason: ${reason || 'Manual block'}`);
  }

  /**
   * Unblock user
   */
  unblockUser(userId: string): void {
    this.blockedUsers.delete(userId);
    console.log(`User ${userId} unblocked`);
  }

  /**
   * Unblock IP address
   */
  unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
    console.log(`IP ${ipAddress} unblocked`);
  }

  /**
   * Get security statistics
   */
  getSecurityStatistics(): {
    totalViolations: number;
    violationsByType: Record<string, number>;
    blockedUsers: number;
    blockedIPs: number;
    rateLimitStats: {
      activeUsers: number;
      averageRequestsPerMinute: number;
    };
  } {
    const violationsByType: Record<string, number> = {};
    
    this.securityViolations.forEach(violation => {
      violationsByType[violation.type] = (violationsByType[violation.type] || 0) + 1;
    });

    const rateLimitStats = {
      activeUsers: this.rateLimitMap.size,
      averageRequestsPerMinute: Array.from(this.rateLimitMap.values())
        .reduce((sum, info) => sum + info.currentMinute, 0) / Math.max(this.rateLimitMap.size, 1)
    };

    return {
      totalViolations: this.securityViolations.length,
      violationsByType,
      blockedUsers: this.blockedUsers.size,
      blockedIPs: this.blockedIPs.size,
      rateLimitStats
    };
  }

  /**
   * Get recent security violations
   */
  getRecentViolations(limit = 50): SecurityViolation[] {
    return this.securityViolations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const notificationSecurity = new NotificationSecurity();
