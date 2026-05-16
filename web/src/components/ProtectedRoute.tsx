'use client';

import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRoles?: string[];
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    return <>{children}</>;
}
