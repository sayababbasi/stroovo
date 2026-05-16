import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET || 'stroovo-secure-fallback-secret-2026';
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

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

  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|icon.png).*)'],
};
