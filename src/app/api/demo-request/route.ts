import { NextResponse } from 'next/server';
import { DemoRequestService } from '@/lib/services/DemoRequestService';
import { createDemoRequestSchema } from '@/lib/validation/user-validation';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = createDemoRequestSchema.parse(body);

        const demoRequest = await DemoRequestService.create(validatedData);
        return NextResponse.json(demoRequest, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create demo request:', error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        if (error.message === 'You already have a pending demo request') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
