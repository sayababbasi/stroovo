import { PrismaClient, Session, SessionStatus, User } from '@prisma/client';
import { extractIPAddress, extractUserAgent, parseDeviceInfo } from './security';
import { generateSecureToken, hashSessionToken } from './security';

export interface SessionInfo {
  id: string;
  userId: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  status: SessionStatus;
  lastActivityAt: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
  isSuspicious: boolean;
}

export interface DeviceFingerprint {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  screenResolution?: string;
  language?: string;
  timezone?: string;
}

export class SessionManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Create a new session
  async createSession(
    userId: string,
    request: Request,
    expiresIn: number = 8 * 60 * 60 * 1000 // 8 hours default
  ): Promise<Session> {
    const ipAddress = extractIPAddress(request);
    const userAgent = extractUserAgent(request);
    const deviceInfo = parseDeviceInfo(userAgent);
    const location = await this.getLocationFromIP(ipAddress);

    const sessionId = generateSecureToken();
    const tokenHash = hashSessionToken(sessionId);
    const expiresAt = new Date(Date.now() + expiresIn);

    // Create session record
    const session = await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        ipAddress,
        userAgent,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        location,
        status: SessionStatus.ACTIVE,
        expiresAt,
        lastActivityAt: new Date(),
      }
    });

    // Check for suspicious login
    await this.checkSuspiciousLogin(session);

    // Manage concurrent sessions
    await this.manageConcurrentSessions(userId);

    return session;
  }

  // Get session by token hash
  async getSessionByToken(tokenHash: string): Promise<Session | null> {
    try {
      return await this.prisma.session.findUnique({
        where: { tokenHash },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Update session activity
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { lastActivityAt: new Date() }
      });
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  // Revoke session
  async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          id: sessionId,
          userId,
          status: SessionStatus.ACTIVE
        },
        data: {
          status: SessionStatus.REVOKED
        }
      });

      return result.count > 0;
    } catch (error) {
      console.error('Error revoking session:', error);
      return false;
    }
  }

  // Revoke all user sessions except current
  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          userId,
          id: { not: currentSessionId },
          status: SessionStatus.ACTIVE
        },
        data: {
          status: SessionStatus.REVOKED
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error revoking other sessions:', error);
      return 0;
    }
  }

  // Revoke all user sessions
  async revokeAllSessions(userId: string): Promise<number> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          userId,
          status: SessionStatus.ACTIVE
        },
        data: {
          status: SessionStatus.REVOKED
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      return 0;
    }
  }

  // Get all active sessions for user
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() }
        },
        orderBy: { lastActivityAt: 'desc' }
      });

      return sessions.map(session => this.formatSessionInfo(session));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Get session with security analysis
  async getSessionWithSecurity(sessionId: string): Promise<SessionInfo | null> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          user: true
        }
      });

      if (!session) return null;

      return this.formatSessionInfo(session);
    } catch (error) {
      console.error('Error getting session with security:', error);
      return null;
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          status: SessionStatus.ACTIVE
        },
        data: {
          status: SessionStatus.EXPIRED
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  // Check for suspicious login patterns
  private async checkSuspiciousLogin(session: Session): Promise<void> {
    try {
      const userSessions = await this.prisma.session.findMany({
        where: {
          userId: session.userId,
          status: SessionStatus.ACTIVE,
          id: { not: session.id }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      let isSuspicious = false;
      const reasons: string[] = [];

      // Check for new IP address
      const previousIPs = new Set(userSessions.map(s => s.ipAddress));
      if (!previousIPs.has(session.ipAddress) && userSessions.length > 0) {
        isSuspicious = true;
        reasons.push('New IP address');
      }

      // Check for new device/browser
      const previousDevices = new Set(userSessions.map(s => `${s.browser}-${s.os}`));
      const currentDevice = `${session.browser}-${session.os}`;
      if (!previousDevices.has(currentDevice) && userSessions.length > 0) {
        isSuspicious = true;
        reasons.push('New device/browser');
      }

      // Check for unusual time (e.g., 3 AM login for office worker)
      const currentHour = new Date().getHours();
      if (currentHour >= 2 && currentHour <= 5 && userSessions.length > 0) {
        const previousSessionsAtNight = userSessions.filter(s => {
          const sessionHour = new Date(s.createdAt).getHours();
          return sessionHour >= 2 && sessionHour <= 5;
        });
        
        if (previousSessionsAtNight.length === 0) {
          isSuspicious = true;
          reasons.push('Unusual login time');
        }
      }

      // Check for rapid session creation (possible session hijacking)
      const recentSessions = userSessions.filter(s => 
        Date.now() - s.createdAt.getTime() < 10 * 60 * 1000 // 10 minutes
      );
      
      if (recentSessions.length >= 3) {
        isSuspicious = true;
        reasons.push('Rapid session creation');
      }

      // Update session if suspicious
      if (isSuspicious) {
        await this.prisma.session.update({
          where: { id: session.id },
          data: { status: SessionStatus.SUSPICIOUS }
        });

        // Log suspicious activity
        await this.logSuspiciousActivity(session.id, reasons);
      }

    } catch (error) {
      console.error('Error checking suspicious login:', error);
    }
  }

  // Manage concurrent sessions
  private async manageConcurrentSessions(userId: string): Promise<void> {
    try {
      const userSettings = await this.prisma.securitySetting.findUnique({
        where: { userId }
      });

      const maxSessions = userSettings?.maxConcurrentSessions || 5;

      const activeSessions = await this.prisma.session.findMany({
        where: {
          userId,
          status: SessionStatus.ACTIVE,
          expiresAt: { gt: new Date() }
        },
        orderBy: { lastActivityAt: 'desc' }
      });

      if (activeSessions.length > maxSessions) {
        // Revoke oldest sessions
        const sessionsToRevoke = activeSessions.slice(maxSessions);
        await this.prisma.session.updateMany({
          where: {
            id: { in: sessionsToRevoke.map(s => s.id) }
          },
          data: { status: SessionStatus.REVOKED }
        });
      }
    } catch (error) {
      console.error('Error managing concurrent sessions:', error);
    }
  }

  // Get location from IP address (simplified version)
  private async getLocationFromIP(ip: string): Promise<string> {
    try {
      // In production, you'd use a service like MaxMind GeoIP
      // For now, return a placeholder
      if (ip === '127.0.0.1' || ip === '::1') {
        return 'Localhost';
      }
      
      // Basic IP range detection
      if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return 'Private Network';
      }
      
      return 'Unknown Location';
    } catch (error) {
      console.error('Error getting location from IP:', error);
      return 'Unknown Location';
    }
  }

  // Format session information
  private formatSessionInfo(session: any): SessionInfo {
    return {
      id: session.id,
      userId: session.userId,
      ipAddress: session.ipAddress,
      device: session.device,
      browser: session.browser,
      os: session.os,
      location: session.location,
      status: session.status,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: false, // This would be set by the caller
      isSuspicious: session.status === SessionStatus.SUSPICIOUS
    };
  }

  // Log suspicious activity
  private async logSuspiciousActivity(sessionId: string, reasons: string[]): Promise<void> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) return;

      await this.prisma.authLog.create({
        data: {
          userId: session.userId,
          action: 'SUSPICIOUS_LOGIN' as any,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          status: 'SUSPICIOUS' as any,
          details: `Suspicious login detected: ${reasons.join(', ')}`,
          metadata: {
            sessionId,
            reasons,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error logging suspicious activity:', error);
    }
  }

  // Get session statistics
  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    suspiciousSessions: number;
    devices: string[];
    locations: string[];
    lastLogin: Date | null;
  }> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      const activeSessions = sessions.filter(s => 
        s.status === SessionStatus.ACTIVE && s.expiresAt > new Date()
      );
      
      const suspiciousSessions = sessions.filter(s => 
        s.status === SessionStatus.SUSPICIOUS
      );

      const devices = [...new Set(sessions.map(s => s.device).filter(Boolean) as string[])];
      const locations = [...new Set(sessions.map(s => s.location).filter(Boolean) as string[])];
      const lastLogin = sessions[0]?.createdAt || null;

      return {
        totalSessions: sessions.length,
        activeSessions: activeSessions.length,
        suspiciousSessions: suspiciousSessions.length,
        devices,
        locations,
        lastLogin
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        suspiciousSessions: 0,
        devices: [],
        locations: [],
        lastLogin: null
      };
    }
  }

  // Validate session and update activity
  async validateAndUpdateSession(sessionId: string): Promise<{
    valid: boolean;
    session?: SessionInfo;
    error?: string;
  }> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        return { valid: false, error: 'Session not found' };
      }

      if (session.status !== SessionStatus.ACTIVE) {
        return { valid: false, error: 'Session inactive' };
      }

      if (session.expiresAt < new Date()) {
        // Mark as expired
        await this.prisma.session.update({
          where: { id: sessionId },
          data: { status: SessionStatus.EXPIRED }
        });
        return { valid: false, error: 'Session expired' };
      }

      // Update activity
      await this.updateSessionActivity(sessionId);

      return {
        valid: true,
        session: this.formatSessionInfo(session)
      };

    } catch (error) {
      console.error('Error validating session:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }

  // Generate device fingerprint
  generateDeviceFingerprint(request: Request): DeviceFingerprint {
    const userAgent = extractUserAgent(request);
    const deviceInfo = parseDeviceInfo(userAgent);

    return {
      userAgent,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      // Additional fingerprint data would be collected from client-side
      screenResolution: undefined,
      language: undefined,
      timezone: undefined,
    };
  }

  // Compare device fingerprints
  compareDevices(device1: DeviceFingerprint, device2: DeviceFingerprint): number {
    let similarity = 0;
    let factors = 0;

    // Compare browser
    if (device1.browser === device2.browser) {
      similarity += 1;
    }
    factors++;

    // Compare OS
    if (device1.os === device2.os) {
      similarity += 1;
    }
    factors++;

    // Compare device type
    if (device1.device === device2.device) {
      similarity += 1;
    }
    factors++;

    // Compare user agent (exact match)
    if (device1.userAgent === device2.userAgent) {
      similarity += 2;
    }
    factors += 2;

    return factors > 0 ? similarity / factors : 0;
  }
}

// Create singleton instance
export const sessionManager = (prisma: PrismaClient) => new SessionManager(prisma);
