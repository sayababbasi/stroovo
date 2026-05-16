import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/UserService';
import prisma from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validation/user-validation';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = resetPasswordSchema.parse(body);

        // Find valid token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token: validatedData.token },
            include: { user: true }
        });

        if (!resetToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        if (resetToken.used) {
            return NextResponse.json({ error: 'Token has already been used' }, { status: 400 });
        }

        if (resetToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
        }

        // Update password
        await UserService.changePassword(resetToken.userId, validatedData.password);

        // Mark token as used
        await prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true }
        });

        return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error: any) {
        console.error('Failed to reset password:', error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
