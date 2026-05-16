import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/AdminService';
import { approveDemoRequestSchema } from '@/lib/validation/user-validation';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = approveDemoRequestSchema.parse(body);

        const result = await AdminService.approveDemoRequest(id, validatedData.tenantId);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Failed to approve demo request:', error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        if (error.message === 'Demo request not found' || error.message === 'Demo request has already been processed') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await AdminService.rejectDemoRequest(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to reject demo request:', error);
        if (error.message === 'Demo request not found' || error.message === 'Demo request has already been processed') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
