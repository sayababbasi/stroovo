import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {}

        const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = join(uploadDir, uniqueFilename);
        
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${uniqueFilename}`;

        const taskFile = await prisma.taskFile.create({
            data: {
                name: file.name,
                url: fileUrl,
                size: file.size,
                type: file.type || 'FILE',
                taskId: id
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'FILE_ATTACH',
                entity: 'TASK',
                entityId: id,
                metadata: { fileName: file.name },
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
