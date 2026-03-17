"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Users, FolderKanban, CheckSquare, TrendingUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        projects: 0,
        tasks: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [usersRes, projectsRes, tasksRes] = await Promise.all([
                    fetch(`${API_URL}/api/users`),
                    fetch(`${API_URL}/api/projects`),
                    fetch(`${API_URL}/api/tasks`),
                ]);

                const users = await usersRes.json();
                const projects = await projectsRes.json();
                const tasks = await tasksRes.json();

                const usersArray = Array.isArray(users) ? users : [];
                const projectsArray = Array.isArray(projects) ? projects : [];
                const tasksArray = Array.isArray(tasks) ? tasks : [];

                setStats({
                    users: usersArray.length,
                    projects: projectsArray.length,
                    tasks: tasksArray.length,
                    completed: tasksArray.filter((t: any) => t.status === 'DONE').length,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Users', value: stats.users, icon: Users, color: '#0052CC', href: '/admin/users' },
        { title: 'Projects', value: stats.projects, icon: FolderKanban, color: '#36B37E', href: '/admin/projects' },
        { title: 'Total Tasks', value: stats.tasks, icon: CheckSquare, color: '#FFAB00', href: '/tasks' },
        { title: 'Completed Tasks', value: stats.completed, icon: TrendingUp, color: '#6554C0', href: '/tasks' },
    ];

    return (
        <ProtectedRoute requiredRoles={['ADMIN']}>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />

                <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                    <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Admin Dashboard</h1>
                        <p style={{ fontSize: '14px', color: '#6B778C', marginTop: '4px' }}>System overview and management</p>
                    </div>

                    <div style={{ padding: '24px 32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            {statCards.map((stat, i) => (
                                <Link key={i} href={stat.href} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid #DFE1E6',
                                        padding: '24px',
                                        transition: 'box-shadow 0.2s',
                                        cursor: 'pointer'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', color: '#6B778C', marginBottom: '8px' }}>{stat.title}</div>
                                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#172B4D' }}>
                                                    {loading ? '...' : stat.value}
                                                </div>
                                            </div>
                                            <stat.icon size={24} color={stat.color} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
