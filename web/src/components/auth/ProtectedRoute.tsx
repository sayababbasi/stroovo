"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission: string;
    scope?: { type: 'organization' | 'team' | 'project'; id?: string };
    fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, requiredPermission, scope, fallback }: ProtectedRouteProps) {
    const { user, isLoading, hasPermission } = useAuth();
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
                return;
            }

            // Use the centralized RBAC hasPermission method from AuthContext
            const isAuth = hasPermission(requiredPermission);
            setAuthorized(isAuth);
        }
    }, [user, isLoading, requiredPermission, hasPermission, router]);

    if (isLoading || authorized === null) {
        return (
            <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7' }}>
                <span style={{ color: '#6B778C' }}>Verifying permissions...</span>
            </div>
        );
    }

    if (!authorized) {
        if (fallback) return <>{fallback}</>;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7', padding: '24px' }}>
                <div style={{ background: 'white', padding: '48px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(9, 30, 66, 0.08)', textAlign: 'center', maxWidth: '400px' }}>
                    <ShieldAlert size={48} color="#DE350B" style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Access Restricted</h2>
                    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6B778C', lineHeight: 1.5 }}>
                        You don't have the required permission (<strong>{requiredPermission}</strong>) to access this area.
                    </p>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        style={{ padding: '10px 20px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
