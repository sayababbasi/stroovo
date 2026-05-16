"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Users, Network, FolderKanban, 
    ShieldCheck, Activity, CreditCard, Puzzle, 
    Bot, Settings, Zap, CheckSquare
} from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Teams', href: '/admin/teams', icon: Network },
        { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
        { name: 'Roles & Permissions', href: '/admin/roles', icon: ShieldCheck },
        { name: 'System Logs', href: '/admin/logs', icon: Activity },
        { name: 'AI Monitoring', href: '/admin/ai-monitoring', icon: Bot },
        { name: 'Billing', href: '/admin/billing', icon: CreditCard },
        { name: 'Integrations', href: '/admin/integrations', icon: Puzzle },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

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
        </aside>
    );
}
