import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { UpdateTaskSchema } from '@/validation/task';
import { TaskService } from '@/lib/tasks/task-service';
import { z } from 'zod';

const BulkUpdateSchema = z.object({
    taskIds: z.array(z.string()).min(1, 'At least one task ID is required'),
    updates: UpdateTaskSchema
});

export async function POST(request: Request) {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id') || undefined;
        const userId = headerList.get('x-user-id') || 'SYSTEM';

        const body = await request.json();

        // 1. Validate payload
        const parsed = BulkUpdateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
        }

        const { taskIds, updates } = parsed.data;

        // 2. Delegate to TaskService
        const updatedTasks = await TaskService.bulkUpdate(taskIds, updates, userId, tenantId);

        return NextResponse.json({ success: true, count: updatedTasks.length, data: updatedTasks });
    } catch (error: any) {
        console.error('[POST /api/tasks/bulk] Failed to bulk update tasks:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
    }
}
