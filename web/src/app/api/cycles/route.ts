import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
    try {
        const cycles = await prisma.cycle.findMany({
            orderBy: { startDate: 'desc' }
        });
        return NextResponse.json(cycles, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, startDate, endDate, status, tenantId } = body;

        const cycle = await prisma.cycle.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || 'ACTIVE',
                tenantId
            }
        });
        return NextResponse.json(cycle, { headers: corsHeaders });
    } catch (error: any) {
        console.error('Failed to create cycle:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            code: error.code
        }, { status: 500, headers: corsHeaders });
    }
}
