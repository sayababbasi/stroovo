import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error('Failed to fetch projects:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, managerId, status, endDate } = body;

        const project = await prisma.project.create({
            data: {
                name,
                description,
                managerId,
                status: status || 'ACTIVE',
                endDate: endDate ? new Date(endDate) : null,
            } as any,
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
