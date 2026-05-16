import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import aiService from '@/ai/service';

export async function GET() {
    try {
        const headerList = await headers();
        const tenantId = headerList.get('x-tenant-id');

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        // Get context: Projects at risk and overall status
        const projects = await prisma.project.findMany({
            where: { tenantId },
            include: {
                tasks: {
                    where: { status: { not: 'DONE' } },
                    take: 10,
                    orderBy: { dueDate: 'asc' }
                }
            }
        });

        const context = {
            atRiskProjects: projects.filter(p => p.status === 'AT_RISK').map(p => p.name),
            upcomingCriticalTasks: projects.flatMap(project => {
                const p = project as any;
                return p.tasks?.map((t: any) => t.title) || [];
            })
        };

        const suggestions = await aiService.suggestNextActions(context);

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Failed to fetch AI suggestions:', error);
        return NextResponse.json({ suggestions: ["Keep focused on current tasks.", "Review project deadlines."] });
    }
}
