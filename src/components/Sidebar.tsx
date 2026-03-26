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
    Milestone,
    ListTodo,
    FolderKanban,
    Star,
    Clock,
    Network,
    Palette,
    Megaphone,
    BrainCircuit,
    MessageSquareMore,
    FolderTree,
    History,
    FileBarChart2,
    TrendingUp,
    PieChart,
    Timer,
    Sparkles,
    Zap,
    ShieldAlert,
    Bell,
    Puzzle,
    UserCog,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    Settings,
    LogOut,
    Bot
} from 'lucide-react';
import { Project } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
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
    const { user, logout } = useAuth();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Workflow', 'Projects']));
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${API_URL}/api/projects`, {
                    cache: 'no-store'
                });
                if (res.ok) {
                    const text = await res.text();
                    try {
                        const data = JSON.parse(text);
                        const uniqueProjects = Array.isArray(data) ? data.reduce((acc: Project[], current: Project) => {
                            const x = acc.find(item => item.id === current.id);
                            if (!x) return acc.concat([current]);
                            else return acc;
                        }, []) : [];
                        setProjects(uniqueProjects);
                    } catch (e) {
                        console.error('Navbar projects fetch returned invalid JSON:', text.substring(0, 50));
                    }
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
                { name: 'Teams', href: '/teams', icon: Network },
            ]
        },
        {
            title: 'Planning',
            items: [
                { name: 'Goals', href: '/goals', icon: Target },
                { name: 'Roadmap', href: '/roadmap', icon: Milestone },
                { name: 'Sprint Planning', href: '/sprint-planning', icon: ListTodo },
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
                    children: starredProjects.length > 0 ? starredProjects.map(p => ({ id: p.id, name: p.name, href: `/projects?id=${p.id}` })) : [
                        { id: 'p1', name: 'Quantum UI Overhaul', href: '#' },
                        { id: 'p2', name: 'Edge Migration', href: '#' }
                    ]
                },
                {
                    name: 'Recent',
                    icon: Clock,
                    children: recentProjects.length > 0 ? recentProjects.map(p => ({ id: p.id, name: p.name, href: `/projects?id=${p.id}` })) : [
                        { id: 'r1', name: 'Sprint Planning 2026', href: '#' },
                        { id: 'r2', name: 'APAC Market Share', href: '#' }
                    ]
                },
            ]
        },
        {
            title: 'Teams',
            items: [
                { name: 'My Team', href: '/teams/my-team', icon: Network },
                { name: 'Core Development', href: '/teams/core', icon: Network },
                { name: 'Design Systems', href: '/teams/design', icon: Palette },
                { name: 'Marketing Team', href: '/teams/marketing', icon: Megaphone },
                { name: 'AI Research Team', href: '/teams/ai', icon: BrainCircuit },
            ]
        },
        {
            title: 'Collaboration',
            items: [
                { name: 'Messages', href: '/messages', icon: MessageSquareMore },
                { name: 'Files', href: '/files', icon: FolderTree },
                { name: 'Activity', href: '/activity', icon: History },
            ]
        },
        {
            title: 'Analytics',
            items: [
                { name: 'Reports', href: '/reports', icon: FileBarChart2 },
                { name: 'Productivity', href: '/analytics/productivity', icon: TrendingUp },
                { name: 'Workload', href: '/analytics/workload', icon: PieChart },
                { name: 'Time Tracking', href: '/analytics/time', icon: Timer },
            ]
        },
        {
            title: 'AI & Automation',
            items: [
                { name: 'Workflow AI', href: '/ai/assistant', icon: Bot, badge: 'Beta' },
                { name: 'Smart Suggestions', href: '/ai/suggestions', icon: Zap },
                { name: 'Risk Alerts', href: '/ai/alerts', icon: ShieldAlert },
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
                    <div 
                        className={styles.navItem} 
                        style={{ color: '#FF5630', cursor: 'pointer' }}
                        onClick={() => logout()}
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </div>
                </nav>
            </div>

            {/* Fixed User Profile */}
            <div className={styles.userProfileWrapper}>
                <div className={styles.userProfileCard}>
                    <div className={styles.userAvatarWrapper}>
                        {user?.image ? (
                            <img 
                                src={user.image} 
                                alt={user.name} 
                                className={styles.userAvatar}
                            />
                        ) : (
                            <div className={styles.userAvatar} style={{ 
                                background: '#DFE1E6', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#172B4D',
                                fontWeight: 600,
                                fontSize: '14px'
                            }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className={styles.onlineStatusDot} />
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{user?.name || 'Guest User'}</div>
                        <div className={styles.userRole}>{user?.title || user?.role || 'Member'}</div>
                        <div className={styles.statusIndicator}>
                            <div className={styles.smallOnlineDot} />
                            <span>Online</span>
                        </div>
                    </div>
                    <ChevronRight size={14} className={styles.profileChevron} />
                </div>
            </div>
        </aside>
    );
}
