import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const comments = await prisma.comment.findMany({
            where: { taskId: id },
            include: { user: { select: { name: true, image: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(comments);
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id') || 'SYSTEM';
        const userId = headerList.get('x-user-id');
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                taskId: id,
                userId
            },
            include: { user: { select: { name: true, image: true } } }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'COMMENT_ADD',
                entity: 'TASK',
                entityId: id,
                metadata: { content: content.substring(0, 50) },
                tenantId,
                userId
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Failed to create comment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
