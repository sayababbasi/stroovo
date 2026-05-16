import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/AdminService';
import { adminResetPasswordSchema } from '@/lib/validation/user-validation';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const result = await AdminService.resetUserPassword(id);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Failed to reset password:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
