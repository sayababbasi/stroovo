import { PrismaClient, User, PasswordStrength } from '@prisma/client';
import crypto from 'crypto';
import { hashPassword, verifyPassword, validatePasswordStrength, generateSecureToken } from './security';
import { sessionManager } from './session-manager';

export interface PasswordResetRequest {
  id: string;
  userId: string;
  token: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number;
  expiryDays?: number;
}

export interface PasswordValidationResult {
  valid: boolean;
  strength: PasswordStrength;
  errors: string[];
  warnings: string[];
}

export class PasswordManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Get user's password policy
  async getPasswordPolicy(userId: string): Promise<PasswordPolicy> {
    try {
      const settings = await this.prisma.securitySetting.findUnique({
        where: { userId }
      });

      return {
        minLength: settings?.passwordMinLength || 8,
        requireUppercase: settings?.passwordRequireUppercase ?? true,
        requireLowercase: settings?.passwordRequireLowercase ?? true,
        requireNumbers: settings?.passwordRequireNumbers ?? true,
        requireSymbols: settings?.passwordRequireSymbols ?? true,
        preventReuse: settings?.preventPasswordReuse || 5,
        expiryDays: settings?.passwordExpiryDays || undefined,
      };
    } catch (error) {
      console.error('Error getting password policy:', error);
      // Return default policy
      return {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        preventReuse: 5,
      };
    }
  }

  // Validate password against policy
  async validatePassword(
    userId: string,
    newPassword: string,
    currentPassword?: string
  ): Promise<PasswordValidationResult> {
    const policy = await this.getPasswordPolicy(userId);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic strength validation
    const strengthResult = validatePasswordStrength(newPassword);
    
    // Check minimum length
    if (newPassword.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    // Check character requirements
    if (policy.requireUppercase && !/[A-Z]/.test(newPassword)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(newPassword)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(newPassword)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      errors.push('Password must contain at least one special character');
    }

    // Check password reuse
    if (currentPassword && newPassword === currentPassword) {
      errors.push('New password cannot be the same as current password');
    }

    // Check against password history
    await this.checkPasswordReuse(userId, newPassword, policy.preventReuse, errors);

    // Check common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(newPassword.toLowerCase())) {
      errors.push('Password is too common. Please choose a more secure password');
    }

    // Check for personal information
    await this.checkPersonalInfo(userId, newPassword, errors);

    // Warnings
    if (strengthResult.score <= 4) {
      warnings.push('Password strength is weak. Consider adding more variety');
    }

    if (newPassword.length < 12) {
      warnings.push('Consider using a longer password for better security');
    }

    const valid = errors.length === 0 && strengthResult.isValid;

    return {
      valid,
      strength: strengthResult.strength,
      errors,
      warnings
    };
  }

  // Check password reuse against history
  private async checkPasswordReuse(
    userId: string,
    newPassword: string,
    preventReuse: number,
    errors: string[]
  ): Promise<void> {
    try {
      const passwordHistory = await this.prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { changedAt: 'desc' },
        take: preventReuse
      });

      for (const historyEntry of passwordHistory) {
        const isReused = await verifyPassword(newPassword, historyEntry.passwordHash);
        if (isReused) {
          errors.push(`Password cannot be reused. This password was used on ${historyEntry.changedAt.toLocaleDateString()}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error checking password reuse:', error);
    }
  }

  // Check for personal information in password
  private async checkPersonalInfo(userId: string, password: string, errors: string[]): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });

      if (!user) return;

      const passwordLower = password.toLowerCase();

      // Check for name in password
      if (user.name) {
        const nameParts = user.name.toLowerCase().split(' ');
        for (const part of nameParts) {
          if (part.length >= 3 && passwordLower.includes(part)) {
            errors.push('Password cannot contain your name');
            break;
          }
        }
      }

      // Check for email username in password
      if (user.email) {
        const emailUsername = user.email.split('@')[0].toLowerCase();
        if (emailUsername.length >= 3 && passwordLower.includes(emailUsername)) {
          errors.push('Password cannot contain your email username');
        }
      }

    } catch (error) {
      console.error('Error checking personal info:', error);
    }
  }

  // Change password
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    request: Request
  ): Promise<{
    success: boolean;
    error?: string;
    warnings?: string[];
  }> {
    try {
      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValidCurrent = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValidCurrent) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Validate new password
      const validation = await this.validatePassword(userId, newPassword, currentPassword);
      if (!validation.valid) {
        return { 
          success: false, 
          error: validation.errors.join(', '),
          warnings: validation.warnings
        };
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Add current password to history
      await this.prisma.passwordHistory.create({
        data: {
          userId,
          passwordHash: user.passwordHash,
          strength: validation.strength,
        }
      });

      // Update user password
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
          passwordChangedAt: new Date(),
          failedLoginAttempts: 0, // Reset failed attempts
          lockedUntil: null, // Unlock account if it was locked
        }
      });

      // Log password change
      await this.logPasswordAction(userId, 'PASSWORD_CHANGE', request);

      // Revoke all other sessions (security best practice)
      const sessionService = sessionManager(this.prisma);
      const currentSessionId = this.extractSessionIdFromRequest(request);
      if (currentSessionId) {
        await sessionService.revokeOtherSessions(userId, currentSessionId);
      }

      return { 
        success: true, 
        warnings: validation.warnings 
      };

    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  // Request password reset
  async requestPasswordReset(email: string, request: Request): Promise<{
    success: boolean;
    error?: string;
    resetToken?: string;
  }> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        // Don't reveal if user exists or not
        return { success: true };
      }

      // Check rate limiting
      const rateLimitKey = `password-reset:${user.id}`;
      // Implementation would depend on your rate limiting system

      // Generate reset token
      const resetToken = generateSecureToken(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: expiresAt,
        }
      });

      // Log password reset request
      await this.logPasswordAction(user.id, 'PASSWORD_RESET', request);

      // In production, you would send an email here
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return { 
        success: true, 
        resetToken // Only for development - remove in production
      };

    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Failed to request password reset' };
    }
  }

  // Reset password with token
  async resetPassword(
    token: string,
    newPassword: string,
    request: Request
  ): Promise<{
    success: boolean;
    error?: string;
    warnings?: string[];
  }> {
    try {
      // Find user with valid reset token
      const user = await this.prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() }
        }
      });

      if (!user) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Validate new password
      const validation = await this.validatePassword(user.id, newPassword);
      if (!validation.valid) {
        return { 
          success: false, 
          error: validation.errors.join(', '),
          warnings: validation.warnings
        };
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Add current password to history
      await this.prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: user.passwordHash,
          strength: validation.strength,
        }
      });

      // Update user password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          passwordChangedAt: new Date(),
          passwordResetToken: null,
          passwordResetExpires: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        }
      });

      // Log password reset
      await this.logPasswordAction(user.id, 'PASSWORD_RESET', request);

      // Revoke all sessions
      const sessionService = sessionManager(this.prisma);
      await sessionService.revokeAllSessions(user.id);

      return { 
        success: true, 
        warnings: validation.warnings 
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  // Check if password needs to be changed
  async shouldChangePassword(userId: string): Promise<{
    required: boolean;
    reason?: string;
    daysUntilExpiry?: number;
  }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { securitySettings: true }
      });

      if (!user) {
        return { required: false };
      }

      const policy = await this.getPasswordPolicy(userId);

      // Check if password is expired
      if (policy.expiryDays) {
        const daysSinceChange = Math.floor(
          (Date.now() - user.passwordChangedAt.getTime()) / (24 * 60 * 60 * 1000)
        );
        
        if (daysSinceChange >= policy.expiryDays) {
          return { 
            required: true, 
            reason: 'Password has expired',
            daysUntilExpiry: 0
          };
        }

        const daysUntilExpiry = policy.expiryDays - daysSinceChange;
        if (daysUntilExpiry <= 7) { // Warn within 7 days
          return { 
            required: false, 
            reason: 'Password will expire soon',
            daysUntilExpiry
          };
        }
      }

      // Check if it's first login (password change required)
      const passwordHistory = await this.prisma.passwordHistory.findMany({
        where: { userId }
      });

      if (passwordHistory.length === 0) {
        return { 
          required: true, 
          reason: 'Password change required on first login' 
        };
      }

      return { required: false };

    } catch (error) {
      console.error('Error checking password change requirement:', error);
      return { required: false };
    }
  }

  // Get password strength metrics
  async getPasswordStrengthMetrics(userId: string): Promise<{
    currentStrength: PasswordStrength;
    averageStrength: PasswordStrength;
    changeFrequency: number;
    lastChanged: Date;
  }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const passwordHistory = await this.prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { changedAt: 'desc' },
        take: 10
      });

      // Calculate average strength
      const strengthValues = passwordHistory.map(h => {
        switch (h.strength) {
          case 'WEAK': return 1;
          case 'FAIR': return 2;
          case 'GOOD': return 3;
          case 'STRONG': return 4;
          default: return 2;
        }
      });

      const averageStrengthValue = strengthValues.length > 0
        ? strengthValues.reduce((a, b) => a + b, 0) / strengthValues.length
        : 2;

      let averageStrength: PasswordStrength = 'FAIR';
      if (averageStrengthValue >= 3.5) averageStrength = 'STRONG';
      else if (averageStrengthValue >= 2.5) averageStrength = 'GOOD';
      else if (averageStrengthValue >= 1.5) averageStrength = 'FAIR';
      else averageStrength = 'WEAK';

      // Get current strength (would need to be stored or calculated)
      const currentStrength = 'GOOD'; // Placeholder

      return {
        currentStrength,
        averageStrength,
        changeFrequency: passwordHistory.length,
        lastChanged: user.passwordChangedAt
      };

    } catch (error) {
      console.error('Error getting password strength metrics:', error);
      throw error;
    }
  }

  // Helper method to extract session ID from request
  private extractSessionIdFromRequest(request: Request): string | null {
    // This would depend on your session management implementation
    return null; // Placeholder
  }

  // Log password actions
  private async logPasswordAction(
    userId: string,
    action: string,
    request: Request
  ): Promise<void> {
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await this.prisma.authLog.create({
        data: {
          userId,
          action: action as any,
          ipAddress,
          userAgent,
          status: 'SUCCESS' as any,
          details: `Password action: ${action}`,
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log password action:', error);
    }
  }

  // Clean up expired reset tokens
  async cleanupExpiredResetTokens(): Promise<number> {
    try {
      const result = await this.prisma.user.updateMany({
        where: {
          passwordResetExpires: { lt: new Date() },
          passwordResetToken: { not: null }
        },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired reset tokens:', error);
      return 0;
    }
  }
}

// Create singleton instance
export const passwordManager = (prisma: PrismaClient) => new PasswordManager(prisma);
