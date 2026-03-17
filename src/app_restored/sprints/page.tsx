import Sidebar from '@/components/Sidebar';
import { Zap, Plus, Play, Check, Clock } from 'lucide-react';

export default function SprintsPage() {
    const sprints = [
        {
            name: 'Sprint 24',
            status: 'active',
            dates: 'Jan 6 - Jan 19, 2026',
            progress: 65,
            tasks: { total: 12, completed: 8, inProgress: 3, todo: 1 }
        },
        {
            name: 'Sprint 25',
            status: 'upcoming',
            dates: 'Jan 20 - Feb 2, 2026',
            progress: 0,
            tasks: { total: 8, completed: 0, inProgress: 0, todo: 8 }
        },
        {
            name: 'Sprint 23',
            status: 'completed',
            dates: 'Dec 23 - Jan 5, 2026',
            progress: 100,
            tasks: { total: 15, completed: 15, inProgress: 0, todo: 0 }
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#0052CC';
            case 'completed': return '#36B37E';
            default: return '#6B778C';
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Sprint Planning</h1>
                        <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>Agile sprints and iterations</p>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                        <Plus size={16} />
                        Create Sprint
                    </button>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {sprints.map((sprint, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{sprint.name}</h3>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                background: getStatusColor(sprint.status),
                                                color: 'white',
                                                textTransform: 'uppercase'
                                            }}>
                                                {sprint.status === 'active' && <Play size={10} style={{ marginRight: '4px' }} />}
                                                {sprint.status === 'completed' && <Check size={10} style={{ marginRight: '4px' }} />}
                                                {sprint.status === 'upcoming' && <Clock size={10} style={{ marginRight: '4px' }} />}
                                                {sprint.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>{sprint.dates}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: getStatusColor(sprint.status) }}>{sprint.progress}%</div>
                                        <div style={{ fontSize: '12px', color: '#6B778C' }}>Complete</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ height: '8px', background: '#EBECF0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                                    <div style={{ width: `${sprint.progress}%`, height: '100%', background: getStatusColor(sprint.status), transition: 'width 0.3s' }}></div>
                                </div>

                                {/* Task Stats */}
                                <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                                    <div><span style={{ fontWeight: 600 }}>{sprint.tasks.total}</span> <span style={{ color: '#6B778C' }}>Total</span></div>
                                    <div><span style={{ fontWeight: 600, color: '#36B37E' }}>{sprint.tasks.completed}</span> <span style={{ color: '#6B778C' }}>Done</span></div>
                                    <div><span style={{ fontWeight: 600, color: '#0052CC' }}>{sprint.tasks.inProgress}</span> <span style={{ color: '#6B778C' }}>In Progress</span></div>
                                    <div><span style={{ fontWeight: 600, color: '#6B778C' }}>{sprint.tasks.todo}</span> <span style={{ color: '#6B778C' }}>To Do</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
