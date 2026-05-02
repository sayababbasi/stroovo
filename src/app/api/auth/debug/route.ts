import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;
    
    return NextResponse.json({
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      accessTokenPreview: accessToken ? accessToken.substring(0, 50) + '...' : null,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length || 0,
      allCookies: Array.from(cookieStore.getAll()).map(c => ({
        name: c.name,
        value: c.value.substring(0, 20) + '...',
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite,
        maxAge: c.maxAge,
        expires: c.expires
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}
