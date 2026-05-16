import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const files = await prisma.taskFile.findMany({
            where: { taskId: id },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(files);
    } catch (error) {
        console.error('Failed to fetch task files:', error);
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
        const { fileName, fileUrl, fileSize, fileType } = await request.json();

        if (!fileName || !fileUrl) {
            return NextResponse.json({ error: 'File name and URL are required' }, { status: 400 });
        }

        const taskFile = await prisma.taskFile.create({
            data: {
                name: fileName,
                url: fileUrl,
                size: Number(fileSize) || 0,
                type: fileType || 'FILE',
                taskId: id
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'FILE_ATTACH',
                entity: 'TASK',
                entityId: id,
                metadata: { fileName },
                tenantId,
                userId
            }
        });

        return NextResponse.json(taskFile, { status: 201 });
    } catch (error) {
        console.error('Failed to attach file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
