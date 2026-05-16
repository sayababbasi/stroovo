import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken, generateTokens } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        error: 'No access token found',
        debug: {
          hasAccessToken: false,
          allCookies: Array.from(cookieStore.getAll()).map(c => ({
            name: c.name,
            hasValue: !!c.value,
            length: c.value?.length || 0
          }))
        }
      }, { status: 401 });
    }

    console.log('Access token found:', accessToken.substring(0, 50) + '...');
    
    // Test token verification
    let payload = null;
    let verificationError = null;
    
    try {
      payload = verifyAccessToken(accessToken);
      console.log('Token payload:', payload);
    } catch (error) {
      verificationError = error instanceof Error ? error.message : 'Unknown verification error';
      console.error('Token verification error:', error);
    }
    
    if (!payload) {
      return NextResponse.json({
        error: 'Token verification failed',
        debug: {
          hasAccessToken: true,
          tokenLength: accessToken.length,
          tokenPreview: accessToken.substring(0, 50) + '...',
          verificationError
        }
      }, { status: 401 });
    }

    // Test generating a new token with the same payload
    const testTokens = generateTokens({
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId
    });

    return NextResponse.json({
      message: 'Token verification successful',
      debug: {
        originalToken: accessToken.substring(0, 50) + '...',
        payload,
        testToken: testTokens.accessToken.substring(0, 50) + '...',
        verificationSuccess: true
      }
    });
  } catch (error) {
    console.error('Debug token error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      }
    }, { status: 500 });
  }
}
