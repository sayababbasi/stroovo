import Sidebar from '@/components/Sidebar';
import { PieChart, TrendingUp, Calendar, Download } from 'lucide-react';

export default function ReportsPage() {
    const reports = [
        { name: 'Weekly Productivity Report', type: 'Productivity', date: 'Jan 5, 2026', status: 'Ready' },
        { name: 'Sprint 23 Summary', type: 'Sprint', date: 'Jan 5, 2026', status: 'Ready' },
        { name: 'Team Workload Analysis', type: 'Workload', date: 'Dec 30, 2025', status: 'Ready' },
        { name: 'Monthly Time Tracking', type: 'Time Tracking', date: 'Dec 31, 2025', status: 'Ready' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Reports</h1>
                    <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>Analytics and productivity reports</p>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {/* Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { label: 'Tasks Completed', value: '127', change: '+12%', icon: PieChart },
                            { label: 'Team Velocity', value: '34 pts', change: '+8%', icon: TrendingUp },
                            { label: 'On-Time Delivery', value: '94%', change: '+2%', icon: Calendar },
                            { label: 'Hours Logged', value: '342h', change: '-5%', icon: Calendar },
                        ].map((stat, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '4px' }}>{stat.label}</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
                                    </div>
                                    <stat.icon size={20} color="#0052CC" />
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '12px', color: stat.change.startsWith('+') ? '#36B37E' : '#FF5630' }}>
                                    {stat.change} from last week
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reports List */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #DFE1E6' }}>
                            <h3 style={{ fontWeight: 600 }}>Recent Reports</h3>
                        </div>
                        {reports.map((report, i) => (
                            <div key={i} style={{ padding: '16px 20px', borderBottom: i < reports.length - 1 ? '1px solid #EBECF0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{report.name}</div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>{report.type} • {report.date}</div>
                                </div>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '12px' }}>
                                    <Download size={14} />
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
