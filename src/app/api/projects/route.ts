import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';



export async function OPTIONS() {
    return NextResponse.json({});
}

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                manager: { select: { id: true, name: true, email: true } },
                _count: {
                    select: {
                        tasks: true
                    }
                },
                tasks: {
                    where: { status: 'DONE' },
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(projects);
    } catch (error) {
        const errorLog = {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            time: new Date().toISOString()
        };
        fs.appendFileSync(path.join(process.cwd(), 'prisma_error_log.txt'), JSON.stringify(errorLog, null, 2) + '\n');
        console.error('Failed to fetch projects:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: errorLog.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, description, managerId, status, startDate, endDate, isStarred } = await request.json();
        const project = await prisma.project.create({
            data: {
                name,
                description,
                managerId,
                status,
                isStarred: isStarred || false,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null
            }
        });
        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
