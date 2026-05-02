import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import aiService from '@/ai/service';
import { headers } from 'next/headers';
import { createNotification } from '@/lib/notifications';

type RankedMemberInput = {
    id: string;
    name: string;
    skills: string[];
};

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const task = await prisma.task.findUnique({
            where: { id },
            include: { project: true }
        });

        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        // Get all members in the tenant
        const members = await prisma.user.findMany({
            where: { tenantId },
            select: { id: true, name: true, skills: true }
        });

        if (members.length === 0) return NextResponse.json({ error: 'No team members found' }, { status: 400 });

        const rankedMembers: RankedMemberInput[] = members.map((member) => ({
            id: member.id,
            name: member.name || 'Unknown',
            skills: member.skills,
        }));

        const ranking = await aiService.rankAssignees(
            { title: task.title, description: task.description || '' },
            rankedMembers
        );

        if (ranking && ranking.bestMatchId) {
            const updatedTask = await prisma.task.update({
                where: { id },
                data: { assigneeId: ranking.bestMatchId }
            });

            // Notify the user
            await createNotification({
                userId: ranking.bestMatchId,
                tenantId,
                type: 'INFO',
                title: 'New Task Auto-Assigned',
                message: `You've been assigned to "${task.title}" by the AI Decision Engine. Reason: ${ranking.reason}`,
                link: `/tasks?id=${id}`
            });

            return NextResponse.json({ success: true, assigneeId: ranking.bestMatchId, reason: ranking.reason });
        }

        return NextResponse.json({ error: 'AI could not determine a match' }, { status: 500 });
    } catch (error) {
        console.error('Auto-assign Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
