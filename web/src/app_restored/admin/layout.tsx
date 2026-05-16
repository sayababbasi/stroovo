"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Users,
    FolderKanban,
    ShieldCheck,
    BarChart3,
    Settings,
    LogOut,
    LayoutDashboard
} from 'lucide-react';
import styles from './admin.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
        { name: 'Roles & Permissions', href: '/admin/roles', icon: ShieldCheck },
        { name: 'System Logs', href: '/admin/logs', icon: BarChart3 },
    ];

    return (
        <div className={styles.adminContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    WF Admin
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <Link href="/" className={styles.navItem}>
                        <LogOut size={20} />
                        <span>Back to Platform</span>
                    </Link>
                    <div className={styles.navItem} style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '1rem' }}>
                        <Settings size={20} />
                        <span>Admin Settings</span>
                    </div>
                </div>
            </aside>

            <main className={styles.adminMain}>
                {children}
            </main>
        </div>
    );
}
