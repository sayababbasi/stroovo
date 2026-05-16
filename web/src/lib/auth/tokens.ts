import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { SECURITY_CONFIG, generateSecureToken, hashSessionToken } from './security';

// Token interfaces
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string | null;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tenantId?: string | null;
  sessionId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Token blacklist for revoked tokens
class TokenBlacklist {
  private blacklistedTokens = new Set<string>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired tokens every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  add(token: string, expiresIn: number): void {
    this.blacklistedTokens.add(token);
    // Auto-remove after expiry
    setTimeout(() => {
      this.blacklistedTokens.delete(token);
    }, expiresIn * 1000);
  }

  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  private cleanup(): void {
    // In a production environment, you might want to use a more sophisticated
    // approach like Redis for token blacklisting
    this.blacklistedTokens.clear();
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const tokenBlacklist = new TokenBlacklist();

// Enhanced JWT token generation
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = SECURITY_CONFIG.JWT_ACCESS_EXPIRY;
  
  const tokenPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + parseExpiry(expiresIn),
  };

  return jwt.sign(tokenPayload, SECURITY_CONFIG.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'revotic-work-platform',
    audience: 'revotic-users',
  });
}

export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = SECURITY_CONFIG.JWT_REFRESH_EXPIRY;
  
  const tokenPayload: RefreshTokenPayload = {
    ...payload,
    iat: now,
    exp: now + parseExpiry(expiresIn),
  };

  return jwt.sign(tokenPayload, SECURITY_CONFIG.JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    issuer: 'revotic-work-platform',
    audience: 'revotic-users',
  });
}

// Parse expiry string to seconds
function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1));
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 15 * 60; // Default 15 minutes
  }
}

// Verify access token with enhanced security
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.isBlacklisted(token)) {
      return null;
    }

    const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_SECRET, {
      algorithms: ['HS256'],
      // issuer: 'revotic-work-platform',
      // audience: 'revotic-users',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('Access token verification failed:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      console.error('JWT Error Details:', error);
    }
    return null;
  }
}

// Verify refresh token with enhanced security
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.isBlacklisted(token)) {
      return null;
    }

    const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
      // issuer: 'revotic-work-platform',
      // audience: 'revotic-users',
    }) as RefreshTokenPayload;

    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      console.error('JWT Refresh Error Details:', error);
    }
    return null;
  }
}

// Generate complete token pair
export function generateTokenPair(
  user: { id: string; email: string; role: string; tenantId?: string | null },
  sessionId: string,
  tokenVersion: number = 0
): TokenPair {
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    sessionId,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    tenantId: user.tenantId,
    sessionId,
    tokenVersion,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpiry(SECURITY_CONFIG.JWT_ACCESS_EXPIRY),
  };
}

// Revoke tokens (add to blacklist)
export function revokeAccessToken(token: string): void {
  const decoded = jwt.decode(token) as any;
  if (decoded && decoded.exp) {
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    if (expiresIn > 0) {
      tokenBlacklist.add(token, expiresIn);
    }
  }
}

export function revokeRefreshToken(token: string): void {
  const decoded = jwt.decode(token) as any;
  if (decoded && decoded.exp) {
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    if (expiresIn > 0) {
      tokenBlacklist.add(token, expiresIn);
    }
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// Token rotation for refresh tokens
export function rotateRefreshToken(
  oldToken: string,
  user: { id: string; email: string; role: string; tenantId?: string | null },
  sessionId: string,
  tokenVersion: number
): TokenPair {
  // Revoke old refresh token
  revokeRefreshToken(oldToken);
  
  // Generate new token pair with incremented version
  return generateTokenPair(user, sessionId, tokenVersion + 1);
}

// Check if token is about to expire (within 5 minutes)
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    
    return timeUntilExpiry <= 300; // 5 minutes
  } catch {
    return false;
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

// Generate secure session ID
export function generateSessionId(): string {
  return generateSecureToken(32);
}

// Session token management
export class SessionManager {
  private sessions = new Map<string, {
    userId: string;
    sessionId: string;
    expiresAt: Date;
    lastActivity: Date;
  }>();

  createSession(userId: string, sessionId: string, expiresIn: number): void {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    this.sessions.set(sessionId, {
      userId,
      sessionId,
      expiresAt,
      lastActivity: new Date(),
    });
  }

  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return false;
    }
    
    // Update last activity
    session.lastActivity = new Date();
    return true;
  }

  revokeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  revokeAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  getUserSessions(userId: string): string[] {
    const userSessions: string[] = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && session.expiresAt > new Date()) {
        userSessions.push(sessionId);
      }
    }
    return userSessions;
  }

  cleanup(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const sessionManager = new SessionManager();

// Cleanup expired sessions periodically
setInterval(() => {
  sessionManager.cleanup();
}, 60 * 60 * 1000); // Every hour
