import { TOTP } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { PrismaClient, MFAType } from '@prisma/client';
import { generateSecureToken } from './security';

// TOTP configuration
const TOTP_CONFIG = {
  issuer: 'Revotic Work Platform',
  algorithm: 'sha1' as const,
  digits: 6,
  window: 1,
  step: 30,
};

const authenticator = new TOTP({
  algorithm: TOTP_CONFIG.algorithm,
  digits: TOTP_CONFIG.digits,
});

// MFA Service class
export class MFAService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Generate TOTP secret for user
  generateTOTPSecret(): string {
    return authenticator.generateSecret();
  }

  // Generate TOTP URI for QR code
  generateTOTPUri(email: string, secret: string): string {
    return `otpauth://totp/${TOTP_CONFIG.issuer}:${email}?secret=${secret}&issuer=${TOTP_CONFIG.issuer}`;
  }

  // Generate QR code for TOTP setup
  async generateQRCode(uri: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(uri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  async verifyTOTPToken(secret: string, token: string): Promise<boolean> {
    try {
      const result = authenticator.verify(token);
      return !!result;
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }

  // Generate backup codes
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(generateSecureToken(8).toUpperCase());
    }
    return codes;
  }

  // Hash backup codes for storage
  hashBackupCodes(codes: string[]): string[] {
    return codes.map(code => {
      const hash = crypto.createHash('sha256');
      hash.update(code);
      return hash.digest('hex');
    });
  }

  // Verify backup code
  verifyBackupCode(hashedCodes: string[], providedCode: string): boolean {
    const hash = crypto.createHash('sha256');
    hash.update(providedCode.toUpperCase());
    const hashedProvided = hash.digest('hex');
    return hashedCodes.includes(hashedProvided);
  }

  // Setup MFA for user
  async setupMFA(
    userId: string,
    type: MFAType = MFAType.TOTP,
    phoneNumber?: string,
    email?: string
  ): Promise<{
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
    error?: string;
  }> {
    try {
      // Check if MFA is already enabled
      const existingMFA = await this.prisma.mFASetting.findUnique({
        where: { userId }
      });

      if (existingMFA?.isEnabled) {
        return { error: 'MFA is already enabled for this user' };
      }

      const secret = this.generateTOTPSecret();
      const backupCodes = this.generateBackupCodes();
      const hashedBackupCodes = this.hashBackupCodes(backupCodes);

      // Get user email for TOTP URI
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        return { error: 'User not found' };
      }

      // Generate QR code
      const uri = this.generateTOTPUri(user.email, secret);
      const qrCode = await this.generateQRCode(uri);

      // Store MFA settings (not enabled yet)
      await this.prisma.mFASetting.upsert({
        where: { userId },
        create: {
          userId,
          type,
          secret,
          isEnabled: false,
          backupCodes: hashedBackupCodes,
          phoneNumber,
          email,
        },
        update: {
          type,
          secret,
          isEnabled: false,
          backupCodes: hashedBackupCodes,
          phoneNumber,
          email,
        },
      });

      return {
        secret,
        qrCode,
        backupCodes,
      };

    } catch (error) {
      console.error('MFA setup error:', error);
      return { error: 'Failed to setup MFA' };
    }
  }

  // Enable MFA after verification
  async enableMFA(userId: string, verificationToken: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const mfaSetting = await this.prisma.mFASetting.findUnique({
        where: { userId }
      });

      if (!mfaSetting || !mfaSetting.secret) {
        return { success: false, error: 'MFA not setup' };
      }

      // Verify the token
      const isValid = this.verifyTOTPToken(mfaSetting.secret, verificationToken);
      if (!isValid) {
        return { success: false, error: 'Invalid verification code' };
      }

      // Enable MFA
      await this.prisma.mFASetting.update({
        where: { userId },
        data: { isEnabled: true }
      });

      // Update user record
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true, twoFactorSecret: mfaSetting.secret }
      });

      // Log MFA enable
      await this.logMFAAction(userId, 'MFA_ENABLED');

      return { success: true };

    } catch (error) {
      console.error('MFA enable error:', error);
      return { success: false, error: 'Failed to enable MFA' };
    }
  }

  // Disable MFA
  async disableMFA(
    userId: string,
    password?: string,
    backupCode?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { mfaSettings: true }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify password if provided
      if (password) {
        const { verifyPassword } = await import('./security');
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
          return { success: false, error: 'Invalid password' };
        }
      }

      // Verify backup code if provided
      if (backupCode && user.mfaSettings) {
        const isValidBackup = this.verifyBackupCode(
          user.mfaSettings.backupCodes,
          backupCode
        );
        if (!isValidBackup) {
          return { success: false, error: 'Invalid backup code' };
        }
      }

      // Disable MFA
      await this.prisma.mFASetting.update({
        where: { userId },
        data: { isEnabled: false }
      });

      // Update user record
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: false, twoFactorSecret: null }
      });

      // Log MFA disable
      await this.logMFAAction(userId, 'MFA_DISABLED');

      return { success: true };

    } catch (error) {
      console.error('MFA disable error:', error);
      return { success: false, error: 'Failed to disable MFA' };
    }
  }

  // Verify MFA token during login
  async verifyMFAToken(
    userId: string,
    token: string,
    backupCode?: string
  ): Promise<{
    valid: boolean;
    error?: string;
    usedBackupCode?: boolean;
  }> {
    try {
      const mfaSetting = await this.prisma.mFASetting.findUnique({
        where: { userId }
      });

      if (!mfaSetting || !mfaSetting.isEnabled) {
        return { valid: false, error: 'MFA not enabled' };
      }

      // Try TOTP verification first
      if (token && mfaSetting.secret) {
        const isValid = await this.verifyTOTPToken(mfaSetting.secret, token);
        if (isValid) {
          return { valid: true };
        }
      }

      // Try backup code verification
      if (backupCode) {
        const isValidBackup = this.verifyBackupCode(mfaSetting.backupCodes, backupCode);
        if (isValidBackup) {
          // Remove used backup code
          await this.removeUsedBackupCode(userId, backupCode);
          return { valid: true, usedBackupCode: true };
        }
      }

      return { valid: false, error: 'Invalid verification code' };

    } catch (error) {
      console.error('MFA verification error:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }

  // Remove used backup code
  private async removeUsedBackupCode(userId: string, usedCode: string): Promise<void> {
    try {
      const mfaSetting = await this.prisma.mFASetting.findUnique({
        where: { userId }
      });

      if (!mfaSetting) return;

      const hash = crypto.createHash('sha256');
      hash.update(usedCode.toUpperCase());
      const hashedUsed = hash.digest('hex');

      // Remove the used backup code
      const updatedCodes = mfaSetting.backupCodes.filter(
        code => code !== hashedUsed
      );

      await this.prisma.mFASetting.update({
        where: { userId },
        data: { backupCodes: updatedCodes }
      });

    } catch (error) {
      console.error('Error removing backup code:', error);
    }
  }

  // Get MFA status
  async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    type?: MFAType;
    hasBackupCodes: boolean;
    backupCodeCount: number;
  }> {
    try {
      const mfaSetting = await this.prisma.mFASetting.findUnique({
        where: { userId }
      });

      if (!mfaSetting) {
        return {
          enabled: false,
          hasBackupCodes: false,
          backupCodeCount: 0,
        };
      }

      return {
        enabled: mfaSetting.isEnabled,
        type: mfaSetting.type,
        hasBackupCodes: mfaSetting.backupCodes.length > 0,
        backupCodeCount: mfaSetting.backupCodes.length,
      };

    } catch (error) {
      console.error('Error getting MFA status:', error);
      return {
        enabled: false,
        hasBackupCodes: false,
        backupCodeCount: 0,
      };
    }
  }

  // Regenerate backup codes
  async regenerateBackupCodes(userId: string): Promise<{
    backupCodes?: string[];
    error?: string;
  }> {
    try {
      const mfaSetting = await this.prisma.mFASetting.findUnique({
        where: { userId }
      });

      if (!mfaSetting || !mfaSetting.isEnabled) {
        return { error: 'MFA not enabled' };
      }

      const backupCodes = this.generateBackupCodes();
      const hashedBackupCodes = this.hashBackupCodes(backupCodes);

      await this.prisma.mFASetting.update({
        where: { userId },
        data: { backupCodes: hashedBackupCodes }
      });

      return { backupCodes };

    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      return { error: 'Failed to regenerate backup codes' };
    }
  }

  // Log MFA actions
  private async logMFAAction(userId: string, action: string): Promise<void> {
    try {
      await this.prisma.authLog.create({
        data: {
          userId,
          action: action as any,
          status: 'SUCCESS' as any,
          ipAddress: 'system', // This should be passed from the calling context
          userAgent: 'system',
          details: `MFA action: ${action}`,
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log MFA action:', error);
    }
  }

  // Check if MFA is required for user role
  isMFARequiredForRole(role: string): boolean {
    const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
    return adminRoles.includes(role);
  }

  // Validate MFA setup requirements
  async validateMFASetup(userId: string): Promise<{
    canSetup: boolean;
    requirements: string[];
    error?: string;
  }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { securitySettings: true }
      });

      if (!user) {
        return { canSetup: false, requirements: [], error: 'User not found' };
      }

      const requirements: string[] = [];

      // Check if email is verified
      if (!user.isEmailVerified) {
        requirements.push('Email must be verified before enabling MFA');
      }

      // Check if password is recent (changed within last 24 hours)
      const passwordAge = Date.now() - user.passwordChangedAt.getTime();
      if (passwordAge > 24 * 60 * 60 * 1000) {
        requirements.push('Password must be changed within last 24 hours');
      }

      // Check if user has active sessions
      const activeSessions = await this.prisma.session.count({
        where: {
          userId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        }
      });

      if (activeSessions === 0) {
        requirements.push('Must have an active session');
      }

      return {
        canSetup: requirements.length === 0,
        requirements
      };

    } catch (error) {
      console.error('Error validating MFA setup:', error);
      return { canSetup: false, requirements: [], error: 'Validation failed' };
    }
  }
}

// Create singleton instance
export const mfaService = (prisma: PrismaClient) => new MFAService(prisma);

// Utility functions
export function generateMFASecret(): string {
return authenticator.generateSecret();
}

export async function verifyMFAToken(secret: string, token: string): Promise<boolean> {
try {
const result = authenticator.verify(token);
return !!result;
} catch (error) {
console.error('TOTP verification error:', error);
return false;
}
}
