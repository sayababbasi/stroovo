import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('Authorization');
    const cookieToken = cookieStore.get('accessToken')?.value;
    
    let extractedToken = null;
    let extractionMethod = '';
    
    if (authHeader?.startsWith('Bearer ')) {
      extractedToken = authHeader.substring(7);
      extractionMethod = 'Authorization header';
    } else if (cookieToken) {
      extractedToken = cookieToken;
      extractionMethod = 'Cookie';
    } else {
      extractionMethod = 'None';
    }
    
    const debug = {
      extractionMethod,
      authHeader: authHeader ? `Bearer ${authHeader.substring(7, 50)}...` : null,
      cookieToken: cookieToken ? `${cookieToken.substring(0, 50)}...` : null,
      extractedToken: extractedToken ? `${extractedToken.substring(0, 50)}...` : null,
      allCookies: Array.from(cookieStore.getAll()).map(c => ({
        name: c.name,
        hasValue: !!c.value,
        length: c.value?.length || 0
      }))
    };
    
    if (!extractedToken) {
      return NextResponse.json({
        error: 'No token found',
        debug
      }, { status: 401 });
    }

    // Verify token
    const payload = verifyAccessToken(extractedToken);
    
    if (!payload) {
      return NextResponse.json({
        error: 'Token verification failed',
        debug: {
          ...debug,
          verificationError: true
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Authentication successful',
      debug: {
        ...debug,
        payload,
        verificationSuccess: true
      }
    });
  } catch (error) {
    console.error('Debug extraction error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}
