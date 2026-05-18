import { NextResponse, NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode base64 URL safe format
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[MIDDLEWARE] Failed to decode JWT:', error);
    return null;
  }
}

function redirectToLogin(request: NextRequest, pathname: string) {
  if (pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`[MIDDLEWARE] Redirecting to login from: ${pathname}`);
  const response = NextResponse.redirect(new URL('/login', request.url));
  
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
  
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[PROXY] Processing: ${pathname}`);

  // Public paths
  if (
    pathname.includes('/api/auth') ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/logo.png' ||
    pathname === '/icon.png'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;
  console.log(`[MIDDLEWARE] Path: ${pathname}, Token present: ${!!token}`);

  if (!token) {
    return redirectToLogin(request, pathname);
  }

  const payload = decodeJwt(token);
  if (!payload) {
    console.log('[MIDDLEWARE] Token decode failed');
    return redirectToLogin(request, pathname);
  }

  const isExpired = payload.exp ? Date.now() >= payload.exp * 1000 : false;
  if (isExpired) {
    console.log('[MIDDLEWARE] Token is expired');
    return redirectToLogin(request, pathname);
  }

  // Add tenantId and userId to headers for easy access in API routes
  const requestHeaders = new Headers(request.headers);
  if (payload.tenantId) {
    requestHeaders.set('x-tenant-id', payload.tenantId as string);
  }
  if (payload.id) {
    requestHeaders.set('x-user-id', payload.id as string);
  } else if (payload.userId) {
    requestHeaders.set('x-user-id', payload.userId as string);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|icon.png).*)'],
};
