import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Remove fields that shouldn't be updated directly or are read-only
        const { id: _, createdAt, updatedAt, project, assignee, subTasks, ...updateData } = body;

        // Sanitize update data - convert dates
        const finalUpdateData: any = { ...updateData };
        if (updateData.dueDate) {
            finalUpdateData.dueDate = new Date(updateData.dueDate);
        }

        const task = await prisma.task.update({
            where: { id },
            data: finalUpdateData,
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, image: true } }
            }
        });

        return NextResponse.json(task, { headers: corsHeaders });
    } catch (error) {
        console.error('Failed to update task:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.task.delete({
            where: { id }
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('Failed to delete task:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
