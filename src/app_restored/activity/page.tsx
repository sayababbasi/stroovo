import Sidebar from '@/components/Sidebar';
import { Activity, CheckCircle, MessageSquare, Edit, UserPlus, Folder } from 'lucide-react';

export default function ActivityPage() {
    const activities = [
        { icon: CheckCircle, color: '#36B37E', user: 'Alex Chen', action: 'completed task', target: '"API Integration"', time: '10 minutes ago' },
        { icon: MessageSquare, color: '#0052CC', user: 'Sarah Kim', action: 'commented on', target: '"Design System Update"', time: '25 minutes ago' },
        { icon: Edit, color: '#FFAB00', user: 'Michael Park', action: 'updated status of', target: '"Sprint 24 Planning"', time: '1 hour ago' },
        { icon: UserPlus, color: '#6554C0', user: 'You', action: 'assigned', target: 'Emma Lee to "Mobile App Feature"', time: '2 hours ago' },
        { icon: Folder, color: '#00B8D9', user: 'David Liu', action: 'created project', target: '"Q2 Marketing Campaign"', time: '3 hours ago' },
        { icon: CheckCircle, color: '#36B37E', user: 'Emma Lee', action: 'completed task', target: '"User Research Survey"', time: '4 hours ago' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Activity Feed</h1>
                    <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>Recent updates from your team</p>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                        {activities.map((activity, i) => (
                            <div key={i} style={{ padding: '16px 20px', borderBottom: i < activities.length - 1 ? '1px solid #EBECF0' : 'none', display: 'flex', gap: '14px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: activity.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <activity.icon size={18} color={activity.color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px' }}>
                                        <span style={{ fontWeight: 600 }}>{activity.user}</span>{' '}
                                        <span style={{ color: '#6B778C' }}>{activity.action}</span>{' '}
                                        <span style={{ fontWeight: 500, color: '#0052CC' }}>{activity.target}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '4px' }}>{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
