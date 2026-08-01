"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading || !user) {
        return <div className="flex h-screen w-full items-center justify-center bg-[#F4F5F7]">Loading Admin Control...</div>;
    }

    return (
        <ProtectedRoute requiredPermission="admin.dashboard">
            <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F5F7' }}>
                <AdminSidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '260px' }}>
                    <AdminTopBar user={user} />
                    <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
