"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    CheckSquare,
    Trello,
    BarChart2,
    Calendar,
    Target,
    Map as MapIcon,
    Zap,
    FolderKanban,
    Star,
    Clock,
    Users,
    MessageSquare,
    FileText,
    Activity,
    PieChart,
    TrendingUp,
    Timer,
    Bot,
    Lightbulb,
    AlertTriangle,
    Bell,
    Puzzle,
    UserCog,
    HelpCircle,
    LogOut,
    ChevronDown,
    ChevronRight,
    Settings
} from 'lucide-react';
import { Project } from '@/types';
import styles from './Sidebar.module.css';

interface NavItem {
    name: string;
    href?: string;
    icon: any;
    badge?: string;
    children?: { name: string; href: string; id: string }[];
}

interface NavSection {
    title: string;
    items: NavItem[];
    collapsible?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function Sidebar() {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Workflow', 'Projects']));
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${API_URL}/api/projects`, {
                    cache: 'no-store'
                });
                if (res.ok) {
                    const data = await res.json();
                    const uniqueProjects = Array.isArray(data) ? data.reduce((acc: Project[], current: Project) => {
                        const x = acc.find(item => item.id === current.id);
                        if (!x) return acc.concat([current]);
                        else return acc;
                    }, []) : [];
                    setProjects(uniqueProjects);
                }
            } catch (err) {
                console.error('Failed to fetch sidebar projects:', err);
            }
        };
        
        const handleUpdate = () => fetchProjects();
        window.addEventListener('projectsUpdated', handleUpdate);
        fetchProjects();

        return () => window.removeEventListener('projectsUpdated', handleUpdate);
    }, []);

    const starredProjects = projects.filter(p => p.isStarred);
    const recentProjects = [...projects]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const sections: NavSection[] = [
        {
            title: 'Workflow',
            items: [
                { name: 'Dashboard', href: '/', icon: LayoutDashboard },
                { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
                { name: 'Board', href: '/board', icon: Trello },
                { name: 'Timeline', href: '/timeline', icon: BarChart2 },
                { name: 'Calendar', href: '/calendar', icon: Calendar },
            ]
        },
        {
            title: 'Planning',
            items: [
                { name: 'Goals', href: '/goals', icon: Target },
            ]
        },
        {
            title: 'Projects',
            collapsible: true,
            items: [
                { name: 'All Projects', href: '/projects', icon: FolderKanban },
                {
                    name: 'Starred',
                    icon: Star,
                    children: starredProjects.map(p => ({ id: p.id, name: p.name, href: `/projects?id=${p.id}` }))
                },
                {
                    name: 'Recent',
                    icon: Clock,
                    children: recentProjects.map(p => ({ id: p.id, name: p.name, href: `/projects?id=${p.id}` }))
                },
            ]
        },
        {
            title: 'Collaboration',
            items: [
                { name: 'Messages', href: '/messages', icon: MessageSquare, badge: '3' },
                { name: 'Files', href: '/files', icon: FileText },
                { name: 'Feed', href: '/activity', icon: Activity },
            ]
        },
        {
            title: 'Analytics',
            items: [
                { name: 'Reports', href: '/reports', icon: PieChart },
                { name: 'Productivity', href: '/analytics/productivity', icon: TrendingUp },
            ]
        },
        {
            title: 'AI & Automation',
            items: [
                { name: 'Workflow AI', href: '/ai', icon: Bot, badge: 'Beta' },
            ]
        },
    ];

    const settingsItems: NavItem[] = [
        { name: 'Notifications', href: '/settings/notifications', icon: Bell },
        { name: 'Integrations', href: '/settings/integrations', icon: Puzzle },
        { name: 'User Management', href: '/admin/users', icon: UserCog },
        { name: 'Help', href: '/help', icon: HelpCircle },
    ];

    const toggleSection = (title: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(title)) next.delete(title);
            else next.add(title);
            return next;
        });
    };

    const renderNavItem = (item: NavItem) => {
        const Icon = item.icon;
        const isActive = item.href === pathname;
        const isHeader = item.children !== undefined;

        if (isHeader) {
            return (
                <div key={item.name} className={styles.section}>
                    <div className={styles.navItem} style={{ paddingLeft: '16px', opacity: 0.8, cursor: 'default' }}>
                        <Icon size={16} />
                        <span>{item.name}</span>
                    </div>
                    <div className={styles.nav}>
                        {item.children!.map((child) => (
                            <Link
                                key={child.id}
                                href={child.href}
                                className={styles.navItem}
                                style={{
                                    paddingLeft: '44px',
                                    fontSize: '12.5px',
                                    height: '28px',
                                    gap: '8px'
                                }}
                            >
                                {item.name === 'Starred' && (
                                    <Star size={12} color="#FFD700" fill="#FFD700" style={{ flexShrink: 0 }} />
                                )}
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {child.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <Link
                key={item.href ?? item.name}
                href={item.href ?? '#'}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                style={{ paddingLeft: '16px' }}
            >
                <Icon size={16} />
                <span>{item.name}</span>
                {item.badge && (
                    <span className={styles.badge} data-type={item.badge === 'Beta' ? 'beta' : 'count'}>
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <CheckSquare size={18} color="white" />
                </div>
                <span className={styles.logoText}>Workflow</span>
            </div>

            <div className={styles.navContainer}>
                {sections.map((section) => {
                    const isExpanded = expandedSections.has(section.title);
                    return (
                        <div key={section.title} className={styles.section}>
                            <div
                                className={styles.sectionTitle}
                                onClick={() => section.collapsible && toggleSection(section.title)}
                                style={{ cursor: section.collapsible ? 'pointer' : 'default' }}
                            >
                                {section.collapsible && (
                                    isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                                )}
                                <span>{section.title.toUpperCase()}</span>
                            </div>

                            {(!section.collapsible || isExpanded) && (
                                <nav className={styles.nav}>
                                    {section.items.map((item) => renderNavItem(item))}
                                </nav>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={styles.settingsSection}>
                <div className={styles.sectionTitle}>
                    <Settings size={12} />
                    <span>SETTINGS</span>
                </div>
                <nav className={styles.nav}>
                    {settingsItems.map((item) => renderNavItem(item))}
                    <div className={styles.navItem} style={{ color: '#FF5630', cursor: 'pointer' }}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </div>
                </nav>
            </div>
        </aside>
    );
}
