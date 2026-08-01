"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Conditionally renders children based on user permissions.
 * 
 * IMPORTANT: This is frontend-only protection (UX visibility).
 * Backend authorization via requirePermission() is always mandatory.
 * 
 * Usage:
 * <Can permission="users.edit">
 *   <EditUserButton />
 * </Can>
 * 
 * <Can permission="users.delete" fallback={<DisabledDeleteButton />}>
 *   <DeleteUserButton />
 * </Can>
 */
interface CanProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function Can({ permission, children, fallback }: CanProps) {
    const { hasPermission } = useAuth();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return fallback ? <>{fallback}</> : null;
}

/**
 * Renders children if user has ANY of the listed permissions.
 * 
 * Usage:
 * <CanAny permissions={['users.view', 'users.manage']}>
 *   <UsersPanel />
 * </CanAny>
 */
interface CanAnyProps {
    permissions: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function CanAny({ permissions, children, fallback }: CanAnyProps) {
    const { hasAnyPermission } = useAuth();

    if (hasAnyPermission(...permissions)) {
        return <>{children}</>;
    }

    return fallback ? <>{fallback}</> : null;
}

/**
 * Renders children only if user has ALL of the listed permissions.
 * 
 * Usage:
 * <CanAll permissions={['roles.edit', 'permissions.grant']}>
 *   <RolePermissionEditor />
 * </CanAll>
 */
interface CanAllProps {
    permissions: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function CanAll({ permissions, children, fallback }: CanAllProps) {
    const { hasAllPermissions } = useAuth();

    if (hasAllPermissions(...permissions)) {
        return <>{children}</>;
    }

    return fallback ? <>{fallback}</> : null;
}
