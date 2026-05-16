import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[GET /api/test/auth] Testing authentication system');
    
    return NextResponse.json({
      message: 'Authentication test endpoint working',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  } catch (error: any) {
    console.error('[GET /api/test/auth] Error:', error);
    return NextResponse.json(
      { error: 'Test endpoint failed', details: error.message },
      { status: 500 }
    );
  }
}
