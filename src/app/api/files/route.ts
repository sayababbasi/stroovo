import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';

export async function GET(request: Request) {
    const authResult = await requirePermission('tasks.read.own')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const files = await prisma.taskFile.findMany({
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        project: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(files);
    } catch (error) {
        console.error('Failed to fetch files:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
