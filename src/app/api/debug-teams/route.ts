import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const teams = await prisma.team.findMany({
            include: { members: true, spaces: true, tasks: true }
        });
        const users = await prisma.user.findMany();
        const tenants = await prisma.tenant.findMany();
        
        return NextResponse.json({
            teams,
            users,
            tenants
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
