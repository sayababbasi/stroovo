import prisma from '@/lib/prisma';
import {
    Users,
    FolderKanban,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default async function AdminDashboard() {
    // Fetch stats directly for the dashboard
    const [userCount, projectCount, taskCount, completedTasks] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.task.count(),
        prisma.task.count({ where: { status: 'DONE' } })
    ]);

    const stats = [
        { name: 'Total Users', value: userCount, icon: Users, color: 'blue' },
        { name: 'Active Projects', value: projectCount, icon: FolderKanban, color: 'purple' },
        { name: 'Total Tasks', value: taskCount, icon: AlertCircle, color: 'orange' },
        { name: 'Completed Tasks', value: completedTasks, icon: CheckCircle2, color: 'green' },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.name}
                            className="glass-panel"
                            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                        >
                            <div style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                background: `rgba(${stat.color === 'blue' ? '59, 130, 246' : stat.color === 'purple' ? '168, 85, 247' : stat.color === 'orange' ? '249, 115, 22' : '34, 197, 94'}, 0.1)`,
                                color: stat.color === 'blue' ? '#3b82f6' : stat.color === 'purple' ? '#a855f7' : stat.color === 'orange' ? '#f97316' : '#22c55e'
                            }}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>{stat.name}</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Users</h2>
                    {/* We'll add a preview table here later */}
                    <p style={{ color: 'var(--muted-foreground)' }}>User statistics and growth chart placeholder.</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>System Status</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span>Database</span>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>Operational</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span>Storage</span>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>92% Free</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span>API Gateway</span>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>Healthy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
