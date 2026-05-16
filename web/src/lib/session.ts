import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getCurrentUser(): Promise<{ id: string; name: string | null; email: string; role: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    if (!token) return null;

    const payload = verifyAccessToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, email: true, role: true },
    });
    return user;
}

/** First name for greeting (e.g. "Sayab" from "Sayab" or "John Doe") */
export function getFirstName(name: string | null): string {
    if (!name || !name.trim()) return 'there';
    const first = name.trim().split(/\s+/)[0];
    return first || 'there';
}
