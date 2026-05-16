import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');
        
        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenant = await (prisma.tenant as any).findUnique({
            where: { id: tenantId } as any,
            select: { logoUrl: true, primaryColor: true, secondaryColor: true }
        });

        return NextResponse.json(tenant || {
            logoUrl: null,
            primaryColor: '#0052CC',
            secondaryColor: '#0747A6'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
