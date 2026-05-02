import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET || 'stroovo-production-v2-stable-2026';
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[PROXY] Processing: ${pathname}`);

  // Public paths
  if (
    pathname.includes('/api/auth') ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Check for tenantId in payload
    if (!payload.tenantId && !pathname.includes('/admin')) {
       // Allow access but log warning or redirect to onboarding if needed
       console.warn('No tenantId found in JWT payload');
    }

    // Add tenantId to headers for easy access in API routes
    const requestHeaders = new Headers(request.headers);
    if (payload.tenantId) {
      requestHeaders.set('x-tenant-id', payload.tenantId as string);
    }
    if (payload.userId) {
      requestHeaders.set('x-user-id', payload.userId as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('JWT verification failed:', error);
    const response = pathname.startsWith('/api')
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.set('accessToken', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });

    if (pathname.startsWith('/api')) {
      return response;
    }
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
