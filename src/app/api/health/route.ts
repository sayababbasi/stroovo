import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        const userCount = await prisma.user.count();
        return NextResponse.json({
            ok: true,
            database: 'connected',
            userCount,
        });
    } catch (error) {
        console.error('DB health check failed:', error);
        return NextResponse.json(
            { ok: false, database: 'disconnected', error: String(error) },
            { status: 503 }
        );
    }
}
