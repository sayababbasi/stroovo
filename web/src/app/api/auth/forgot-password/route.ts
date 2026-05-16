import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/UserService';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { forgotPasswordSchema } from '@/lib/validation/user-validation';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = forgotPasswordSchema.parse(body);

        const user = await UserService.getByEmail(validatedData.email);
        
        if (!user) {
            // Return success even if user doesn't exist (security best practice)
            return NextResponse.json({ 
                message: 'If an account exists with this email, a password reset link will be sent.' 
            });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store token in database
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt
            }
        });

        // TODO: Send email with reset link
        // For now, return the token for testing (remove in production)
        return NextResponse.json({ 
            message: 'Password reset link sent successfully',
            // token: token // Remove in production
        });
    } catch (error: any) {
        console.error('Failed to process forgot password:', error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
