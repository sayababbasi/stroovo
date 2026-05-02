import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import AuthenticationService from '@/lib/auth/auth-service';
import { 
  createSecureHandler, 
  validators, 
  rateLimiters,
  APIError,
  addSecurityHeaders
} from '@/lib/validation/api-validator';

// Initialize auth service
const authService = new AuthenticationService(prisma);

export async function OPTIONS() {
    const response = NextResponse.json({});
    return addSecurityHeaders(response);
}

export const POST = createSecureHandler({
  schema: validators.login.schema,
  rateLimitKey: 'auth/login',
  handler: async (data, request) => {
    const { email, password, mfaToken, sessionId } = data;

    // Check if this is MFA verification
    if (mfaToken && sessionId) {
      const result = await authService.verifyMFA(sessionId, mfaToken, request);
      
      if (!result.success) {
        throw new APIError(401, 'MFA_FAILED', result.error || 'MFA verification failed');
      }

      // Create response with tokens
      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          id: result.user!.id,
          name: result.user!.name,
          email: result.user!.email,
          role: result.user!.role,
          title: result.user!.title,
          contact: result.user!.contact,
          image: result.user!.image,
          tenantId: result.user!.tenantId,
        },
        accessToken: result.tokens!.accessToken,
        sessionId: result.sessionId,
      });

      // Set secure cookies
      setAuthCookies(response, result.tokens!.accessToken, result.tokens!.refreshToken);
      
      return response;
    }

    // Regular login attempt
    const result = await authService.login(email, password, request);
    
    if (!result.success) {
      throw new APIError(401, 'LOGIN_FAILED', result.error || 'Login failed');
    }

    // If MFA is required, return session info for MFA verification
    if (result.requiresMFA) {
      return NextResponse.json({
        message: 'MFA verification required',
        requiresMFA: true,
        sessionId: result.sessionId,
        user: {
          id: result.user!.id,
          name: result.user!.name,
          email: result.user!.email,
          role: result.user!.role,
        },
      });
    }

    // Create response with tokens
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: result.user!.id,
        name: result.user!.name,
        email: result.user!.email,
        role: result.user!.role,
        title: result.user!.title,
        contact: result.user!.contact,
        image: result.user!.image,
        tenantId: result.user!.tenantId,
      },
      accessToken: result.tokens!.accessToken,
      expiresIn: result.tokens!.expiresIn,
      sessionId: result.sessionId,
    });

    // Set secure cookies
    setAuthCookies(response, result.tokens!.accessToken, result.tokens!.refreshToken);
    
    return response;
  }
});

// Helper function to set secure auth cookies
function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
    // Access token cookie (accessible to client for auth state)
    response.cookies.set('accessToken', accessToken, {
        httpOnly: false, // Needed for client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
    });

    // Refresh token cookie (HttpOnly for security)
    response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
    });
}
