"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Users, Network, FolderKanban, 
    ShieldCheck, Activity, CreditCard, Puzzle, 
    Bot, Settings, Zap, CheckSquare, LogOut, ArrowLeft, Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { P } from '@/lib/permissions/registry';

export default function AdminSidebar() {
    const pathname = usePathname();

    const { hasPermission, logout } = useAuth();

    const menuItems = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard, requiredPermission: P.DASHBOARD_ADMIN_VIEW },
        { name: 'Users', href: '/admin/users', icon: Users, requiredPermission: P.USERS_VIEW },
        { name: 'Teams', href: '/admin/teams', icon: Network, requiredPermission: P.TEAMS_VIEW },
        { name: 'Departments', href: '/admin/departments', icon: Building2, requiredPermission: P.USERS_VIEW },
        { name: 'Projects', href: '/admin/projects', icon: FolderKanban, requiredPermission: P.PROJECTS_VIEW },
        { name: 'Roles & Permissions', href: '/admin/roles', icon: ShieldCheck, requiredPermission: P.ROLES_VIEW },
        { name: 'System Logs', href: '/admin/logs', icon: Activity, requiredPermission: P.SYSTEM_LOGS_VIEW },
        { name: 'AI Monitoring', href: '/admin/ai-monitoring', icon: Bot, requiredPermission: P.AI_MONITORING_VIEW },
        { name: 'Billing', href: '/admin/billing', icon: CreditCard, requiredPermission: P.BILLING_VIEW },
        { name: 'Integrations', href: '/admin/integrations', icon: Puzzle, requiredPermission: P.INTEGRATIONS_VIEW },
        { name: 'Settings', href: '/admin/settings', icon: Settings, requiredPermission: P.SETTINGS_VIEW },
    ].filter(item => hasPermission(item.requiredPermission));

    return (
        <aside style={{
            width: '260px',
            background: '#172B4D',
            color: 'white',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
                <div style={{ background: '#0052CC', padding: '6px', borderRadius: '6px' }}>
                    <CheckSquare size={20} color="white" />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 800 }}>Stroovo <span style={{ color: '#00B8D9', fontSize: '10px', verticalAlign: 'top' }}>ADMIN</span></span>
            </div>

            <Link href="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                color: '#A5ADBA',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px',
                transition: 'all 0.2s',
                marginTop: '-16px'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.color = '#A5ADBA';
                e.currentTarget.style.background = 'transparent';
            }}>
                <ArrowLeft size={14} /> Back to App
            </Link>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isActive ? 'white' : '#A5ADBA',
                                background: isActive ? '#243B62' : 'transparent',
                                fontSize: '14px',
                                fontWeight: isActive ? 600 : 500,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Zap size={14} color="#FFAB00" />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>System Status</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#36B37E' }} />
                    <span style={{ fontSize: '11px', color: '#A5ADBA' }}>All Systems Healthy</span>
                </div>
            </div>

            <button
                onClick={logout}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(222, 53, 11, 0.1)',
                    color: '#DE350B',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '8px'
                }}
            >
                <LogOut size={18} />
                Sign Out
            </button>
        </aside>
    );
}
