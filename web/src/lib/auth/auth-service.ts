import { PrismaClient, User, AuthAction, AuthStatus, UserRole } from '@prisma/client/index';
import { 
  hashPassword, 
  verifyPassword, 
  validatePasswordStrength,
  isValidEmail,
  sanitizeInput,
  extractIPAddress,
  extractUserAgent,
  parseDeviceInfo,
  loginRateLimiter,
  SECURITY_CONFIG
} from './security';
import { 
  generateTokenPair, 
  verifyAccessToken, 
  verifyRefreshToken,
  revokeAccessToken,
  revokeRefreshToken,
  extractTokenFromHeader,
  sessionManager,
  generateSessionId
} from './tokens';

export interface LoginResult {
  success: boolean;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  error?: string;
  requiresMFA?: boolean;
  sessionId?: string;
}

export interface SignupResult {
  success: boolean;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  error?: string;
}

export interface AuthContext {
  user: User;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
}

class AuthenticationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Enhanced login with comprehensive security
  async login(
    email: string, 
    password: string, 
    request: Request
  ): Promise<LoginResult> {
    const ipAddress = extractIPAddress(request);
    const userAgent = extractUserAgent(request);
    const deviceInfo = parseDeviceInfo(userAgent);
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      await this.logAuthAction(null, AuthAction.FAILED_LOGIN, ipAddress, userAgent, AuthStatus.FAILED, 'Invalid email format');
      return { success: false, error: 'Invalid email format' };
    }

    // Check rate limiting
    const rateLimitKey = `${ipAddress}:${sanitizedEmail}`;
    if (!loginRateLimiter.isAllowed(rateLimitKey)) {
      await this.logAuthAction(null, AuthAction.FAILED_LOGIN, ipAddress, userAgent, AuthStatus.BLOCKED, 'Rate limit exceeded');
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    try {
      // Find user with security fields
      const user = await this.prisma.user.findUnique({
        where: { email: sanitizedEmail },
        include: {
          securitySettings: true,
          mfaSettings: true,
          sessions: {
            where: { status: 'ACTIVE' },
            orderBy: { lastActivityAt: 'desc' }
          }
        }
      });

      // Check if user exists
      if (!user) {
        await this.logAuthAction(null, AuthAction.FAILED_LOGIN, ipAddress, userAgent, AuthStatus.FAILED, 'User not found');
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logAuthAction(user.id, AuthAction.FAILED_LOGIN, ipAddress, userAgent, AuthStatus.BLOCKED, 'Account inactive');
        return { success: false, error: 'Account is disabled' };
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        await this.logAuthAction(user.id, AuthAction.FAILED_LOGIN, ipAddress, userAgent, AuthStatus.BLOCKED, 'Account locked');
        return { success: false, error: 'Account is temporarily locked. Please try again later.' };
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        // Increment failed attempts
        await this.handleFailedLogin(user.id, ipAddress);
        await this.logAuthAction(user.id, AuthAction.FAILED_LOGIN, ipAddress, userAgent, AuthStatus.FAILED, 'Invalid password');
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if MFA is required
      if (user.twoFactorEnabled && user.mfaSettings?.isEnabled) {
        const sessionId = generateSessionId();
        await this.createPendingSession(user.id, sessionId, ipAddress, userAgent, deviceInfo);
        
        await this.logAuthAction(user.id, AuthAction.LOGIN, ipAddress, userAgent, AuthStatus.SUCCESS, 'Login successful, MFA required');
        
        return { 
          success: true, 
          user, 
          requiresMFA: true,
          sessionId 
        };
      }

      // Successful login - create session and tokens
      const sessionId = generateSessionId();
      const tokens = generateTokenPair(user, sessionId);
      
      // Create session record
      await this.createSession(user.id, sessionId, ipAddress, userAgent, deviceInfo);
      
      // Reset failed attempts on successful login
      await this.resetFailedAttempts(user.id);
      
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      await this.logAuthAction(user.id, AuthAction.LOGIN, ipAddress, userAgent, AuthStatus.SUCCESS, 'Login successful');

      return {
        success: true,
        user,
        tokens,
        sessionId
      };

    } catch (error) {
      console.error('Login error:', error);
      await this.logAuthAction(null, AuthAction.FAILED_LOGIN, ipAddress, userAgent, AuthStatus.FAILED, 'Internal server error');
      return { success: false, error: 'Internal server error' };
    }
  }

  // Enhanced signup with security validation
  async signup(
    name: string,
    email: string,
    password: string,
    request: Request
  ): Promise<SignupResult> {
    const ipAddress = extractIPAddress(request);
    const userAgent = extractUserAgent(request);
    const deviceInfo = parseDeviceInfo(userAgent);

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    // Validate inputs
    if (!sanitizedName || sanitizedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters long' };
    }

    if (!isValidEmail(sanitizedEmail)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return { 
        success: false, 
        error: `Password requirements not met: ${passwordValidation.feedback.join(', ')}` 
      };
    }

    // Check rate limiting for signup
    const rateLimitKey = `${ipAddress}:signup`;
    if (!loginRateLimiter.isAllowed(rateLimitKey)) {
      return { success: false, error: 'Too many signup attempts. Please try again later.' };
    }

    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: sanitizedEmail }
      });

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          name: sanitizedName,
          email: sanitizedEmail,
          passwordHash,
          role: UserRole.TEAM_MEMBER,
          isActive: true,
          isEmailVerified: false,
          emailVerificationToken: this.generateEmailVerificationToken(),
        }
      });

      // Create default security settings
      await this.prisma.securitySetting.create({
        data: {
          userId: user.id,
        }
      });

      // Create session and tokens
      const sessionId = generateSessionId();
      const tokens = generateTokenPair(user, sessionId);
      
      // Create session record
      await this.createSession(user.id, sessionId, ipAddress, userAgent, deviceInfo);

      // Log successful signup
      await this.logAuthAction(user.id, AuthAction.LOGIN, ipAddress, userAgent, AuthStatus.SUCCESS, 'User signup successful');

      return {
        success: true,
        user,
        tokens
      };

    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Verify MFA token
  async verifyMFA(
    sessionId: string,
    token: string,
    request: Request
  ): Promise<LoginResult> {
    const ipAddress = extractIPAddress(request);
    const userAgent = extractUserAgent(request);

    try {
      // Find pending session
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: { include: { mfaSettings: true } } }
      });

      if (!session || session.status !== 'ACTIVE') {
        return { success: false, error: 'Invalid or expired session' };
      }

      const user = session.user;
      const mfaSetting = user.mfaSettings;

      if (!mfaSetting || !mfaSetting.isEnabled) {
        return { success: false, error: 'MFA not enabled for this user' };
      }

      // Verify TOTP token (implementation would depend on your TOTP library)
      const isValidToken = await this.verifyTOTPToken(mfaSetting.secret!, token);
      
      if (!isValidToken) {
        await this.logAuthAction(user.id, AuthAction.FAILED_LOGIN, ipAddress, userAgent, AuthStatus.FAILED, 'Invalid MFA token');
        return { success: false, error: 'Invalid verification code' };
      }

      // Generate tokens
      const tokens = generateTokenPair(user, sessionId);

      // Update session status
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { lastActivityAt: new Date() }
      });

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      await this.logAuthAction(user.id, AuthAction.LOGIN, ipAddress, userAgent, AuthStatus.SUCCESS, 'MFA verification successful');

      return {
        success: true,
        user,
        tokens,
        sessionId
      };

    } catch (error) {
      console.error('MFA verification error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Logout with session cleanup
  async logout(accessToken: string | null, request: Request): Promise<void> {
    const ipAddress = extractIPAddress(request);
    const userAgent = extractUserAgent(request);

    try {
      if (accessToken) {
        const payload = verifyAccessToken(accessToken);
        if (payload) {
          // Revoke tokens
          revokeAccessToken(accessToken);
          
          // Update session status
          if (payload.sessionId) {
            await this.prisma.session.updateMany({
              where: { 
                userId: payload.userId,
                id: payload.sessionId
              },
              data: { status: 'REVOKED' }
            });
          }

          await this.logAuthAction(payload.userId, AuthAction.LOGOUT, ipAddress, userAgent, AuthStatus.SUCCESS, 'User logged out');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Refresh tokens with rotation
  async refreshTokens(refreshToken: string, request: Request): Promise<{
    success: boolean;
    tokens?: { accessToken: string; refreshToken: string; expiresIn: number };
    error?: string;
  }> {
    const ipAddress = extractIPAddress(request);
    const userAgent = extractUserAgent(request);

    try {
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return { success: false, error: 'Invalid refresh token' };
      }

      if (!payload.userId) {
        return { success: false, error: 'Invalid token payload: missing user ID' };
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user || !user.isActive) {
        return { success: false, error: 'User not found or inactive' };
      }

      // Validate session
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId }
      });

      if (!session || session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
        return { success: false, error: 'Session expired or invalid' };
      }

      // Generate new tokens (token rotation)
      const tokens = generateTokenPair(user, payload.sessionId, payload.tokenVersion);
      
      // Revoke old refresh token
      revokeRefreshToken(refreshToken);

      // Update session activity
      await this.prisma.session.update({
        where: { id: payload.sessionId },
        data: { lastActivityAt: new Date() }
      });

      return { success: true, tokens };

    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Helper methods
  private async createSession(
    userId: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo: { browser: string; os: string; device: string }
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT);

    await this.prisma.session.create({
      data: {
        userId,
        id: sessionId,
        tokenHash: sessionId, // In production, hash this
        ipAddress,
        userAgent,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        status: 'ACTIVE',
        expiresAt,
        lastActivityAt: new Date(),
      }
    });

    // Manage concurrent sessions
    await this.manageConcurrentSessions(userId);
  }

  private async createPendingSession(
    userId: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo: { browser: string; os: string; device: string }
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for MFA

    await this.prisma.session.create({
      data: {
        userId,
        id: sessionId,
        tokenHash: sessionId,
        ipAddress,
        userAgent,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        status: 'ACTIVE',
        expiresAt,
        lastActivityAt: new Date(),
      }
    });
  }

  private async manageConcurrentSessions(userId: string): Promise<void> {
    const userSettings = await this.prisma.securitySetting.findUnique({
      where: { userId }
    });

    const maxSessions = userSettings?.maxConcurrentSessions || SECURITY_CONFIG.MAX_CONCURRENT_SESSIONS;

    const activeSessions = await this.prisma.session.findMany({
      where: { 
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActivityAt: 'desc' }
    });

    if (activeSessions.length > maxSessions) {
      // Revoke oldest sessions
      const sessionsToRevoke = activeSessions.slice(maxSessions);
      await this.prisma.session.updateMany({
        where: {
          id: { in: sessionsToRevoke.map((s: any) => s.id) }
        },
        data: { status: 'REVOKED' }
      });
    }
  }

  private async handleFailedLogin(userId: string, ipAddress: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const newFailedAttempts = user.failedLoginAttempts + 1;
    const lockedUntil = newFailedAttempts >= SECURITY_CONFIG.LOGIN_ATTEMPTS_LIMIT 
      ? new Date(Date.now() + SECURITY_CONFIG.ACCOUNT_LOCKOUT_DURATION)
      : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newFailedAttempts,
        lockedUntil
      }
    });
  }

  private async resetFailedAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
  }

  private async logAuthAction(
    userId: string | null,
    action: AuthAction,
    ipAddress: string,
    userAgent: string,
    status: AuthStatus,
    details?: string
  ): Promise<void> {
    try {
      await this.prisma.authLog.create({
        data: {
          userId,
          action,
          ipAddress,
          userAgent,
          status,
          details,
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log auth action:', error);
    }
  }

  private generateEmailVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private async verifyTOTPToken(secret: string, token: string): Promise<boolean> {
    // Implementation would depend on a TOTP library like 'otplib'
    // For now, return false as placeholder
    return false;
  }

  // Get user from access token
  async getUserFromToken(accessToken: string | null): Promise<User | null> {
    if (!accessToken) return null;

    const payload = verifyAccessToken(accessToken);
    if (!payload) return null;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId }
      });

      return user && user.isActive ? user : null;
    } catch {
      return null;
    }
  }

  // Validate session
  async validateSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId }
      });

      return Boolean(session && 
             session.userId === userId && 
             session.status === 'ACTIVE' && 
             session.expiresAt > new Date());
    } catch {
      return false;
    }
  }
}

export default AuthenticationService;
