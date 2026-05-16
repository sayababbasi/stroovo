import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
            length: c.value.length
          }))
        }
      }, { status: 401 });
    }

    console.log('Access token found:', accessToken.substring(0, 50) + '...');
    
    // Verify token
    const payload = verifyAccessToken(accessToken);
    
    if (!payload) {
      return NextResponse.json({
        error: 'Invalid or expired token',
        debug: {
          hasAccessToken: true,
          tokenLength: accessToken.length,
          tokenPreview: accessToken.substring(0, 50) + '...',
          verificationFailed: true
        }
      }, { status: 401 });
    }

    console.log('Token verified successfully:', payload);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        contact: true,
        image: true,
        tenantId: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        debug: {
          tokenPayload: payload,
          userId: payload.userId
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      user,
      accessToken: accessToken,
      debug: {
        tokenPayload: payload,
        verificationSuccess: true
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      }
    }, { status: 500 });
  }
}
