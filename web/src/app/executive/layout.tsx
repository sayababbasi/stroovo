"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    LayoutDashboard, TrendingUp, BarChart4, 
    PieChart, Briefcase, Activity, 
    Target, LineChart, ShieldCheck
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ExecutiveSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Executive Overview', href: '/executive', icon: LayoutDashboard },
        { name: 'Financial Analytics', href: '/executive/financial', icon: TrendingUp },
        { name: 'Operations', href: '/executive/operations', icon: Activity },
        { name: 'Org Health', href: '/executive/health', icon: PieChart },
        { name: 'Strategic Goals', href: '/executive/goals', icon: Target },
        { name: 'Performance', href: '/executive/performance', icon: BarChart4 },
        { name: 'Reports', href: '/executive/reports', icon: LineChart },
        { name: 'Security Posture', href: '/executive/security', icon: ShieldCheck },
    ];

    return (
        <aside style={{
            width: '260px',
            background: '#091E42',
            color: 'white',
            height: '100vh',
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #DFE1E6'
        }}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#0052CC', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.5px' }}>Executive</span>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '24px 12px', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <li key={item.name}>
                                <Link 
                                    href={item.href}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        color: isActive ? '#FFFFFF' : '#A5ADBA',
                                        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Link href="/dashboard" style={{ color: '#A5ADBA', textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ← Back to Standard Dashboard
                </Link>
            </div>
        </aside>
    );
}

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    
    if (isLoading || !user) {
        return <div className="flex h-screen w-full items-center justify-center bg-[#F4F5F7]">Loading Executive Environment...</div>;
    }

    return (
        <ProtectedRoute requiredPermission="executive.dashboard">
            <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F5F7' }}>
                <ExecutiveSidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '260px' }}>
                    {/* Placeholder for TopBar */}
                    <header style={{ height: '64px', background: 'white', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                        <h1 style={{ margin: 0, fontSize: '18px', color: '#172B4D' }}>Executive Control Center</h1>
                    </header>
                    <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
