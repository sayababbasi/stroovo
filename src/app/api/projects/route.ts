import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';
import { addJob } from '@/lib/queue';
import { cache } from '@/lib/cache';
import { ProjectEngine } from '@/lib/projects/project-engine';
import { projectEventBus, ProjectEventFactory } from '@/events/project-events';

export async function GET(request: Request) {
    const authResult = await requirePermission('projects.read')(request as any);
    if (!authResult.success) return authResult.response;
    
    try {
        const tenantId = authResult.user.tenantId;
        const whereClause: any = { status: { not: 'DELETED' } };
        if (tenantId) whereClause.tenantId = tenantId;

        // Support filtering by status/risk if query params exist
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const health = searchParams.get('health');
        const search = searchParams.get('search');
        const owner = searchParams.get('owner');

        if (status && status !== 'ALL') whereClause.status = status;
        if (health && health !== 'ALL') whereClause.healthStatus = health;
        if (owner) whereClause.managerId = owner;
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const cacheKey = tenantId ? `projects:${tenantId}:${status || 'all'}:${health || 'all'}` : 'projects:all';
        const cachedProjects = await cache.get<any[]>(cacheKey);
        if (cachedProjects) {
            return NextResponse.json(cachedProjects);
        }

        const projects = await (prisma.project as any).findMany({
            where: whereClause,
            include: {
                manager: { select: { id: true, name: true, email: true, image: true } },
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Ensure real-time stats are accurate
        const enhancedProjects = await Promise.all(projects.map(async (project: any) => {
            // We could update each project here, but for list view we'll trust current state
            // and have a background job keep them fresh.
            return project;
        }));

        await cache.set(cacheKey, enhancedProjects);
        return NextResponse.json(enhancedProjects.length > 0 ? enhancedProjects : { 
            message: 'No projects found', 
            debug: { 
                userId: authResult.user.id, 
                tenantId: authResult.user.tenantId,
                role: authResult.user.role,
                where: whereClause
            }
        });
    } catch (error: any) {
        console.error('[API/Projects/GET] Failed to fetch projects:', error);
        try { require('fs').writeFileSync('api_error.log', error.stack || error.message); } catch (e) {}
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authResult = await requirePermission('projects.create')(request as any);
    if (!authResult.success) return authResult.response;

    try {
        const tenantId = authResult.user.tenantId;
        const userId = authResult.user.id;
        
        const body = await request.json();
        const { name, description, managerId, status, priority, startDate, endDate, tags, teamIds, goalId } = body;

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        const project = await (prisma.project as any).create({
            data: {
                name,
                description,
                managerId: managerId || userId,
                tenantId: tenantId || null,
                status: status || 'ACTIVE',
                priority: priority || 'MEDIUM',
                goalId,
                tags: tags || [],
                teamIds: teamIds || [],
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null
            } as any
        });

        // Trigger Intelligence Engine immediately
        await ProjectEngine.refreshProject(project.id);

        // Enqueue AI Task Generation
        await addJob('generate-tasks', {
            projectId: project.id,
            tenantId,
            userId,
            title: project.name,
            description: project.description
        });

        // Emit Project Created Event
        projectEventBus.emitProjectEvent(
            ProjectEventFactory.createCreatedEvent(project.id, userId, tenantId || 'default', {
                name: project.name,
                managerId: project.managerId,
                status: project.status
            })
        );

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: 'PROJECT_CREATE',
                entity: 'PROJECT',
                entityId: project.id,
                metadata: { name: project.name, aiPlanning: 'ENQUEUED' },
                tenantId: tenantId || 'default',
                userId
            }
        });

        // Invalidate Cache
        await cache.del(`projects:${tenantId}`);

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        console.error('[API/Projects/POST] Failed to create project:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
