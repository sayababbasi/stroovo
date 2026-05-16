import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { SECURITY_CONFIG } from './auth/security';

const JWT_SECRET = SECURITY_CONFIG.JWT_SECRET;
const JWT_REFRESH_SECRET = SECURITY_CONFIG.JWT_REFRESH_SECRET;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateTokens(user: { id: string; email: string; role: string; tenantId?: string | null }) {
    const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, tenantId: user.tenantId },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string; tenantId: string };
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; tenantId: string };
    } catch {
        return null;
    }
}
