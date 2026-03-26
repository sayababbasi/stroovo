import Sidebar from '@/components/Sidebar';
import { Map, Plus, ChevronRight } from 'lucide-react';

export default function RoadmapPage() {
    const quarters = [
        { name: 'Q1 2026', months: ['Jan', 'Feb', 'Mar'] },
        { name: 'Q2 2026', months: ['Apr', 'May', 'Jun'] },
        { name: 'Q3 2026', months: ['Jul', 'Aug', 'Sep'] },
        { name: 'Q4 2026', months: ['Oct', 'Nov', 'Dec'] },
    ];

    const milestones = [
        { name: 'Platform Launch', quarter: 0, month: 2, color: '#0052CC' },
        { name: 'AI Features Beta', quarter: 1, month: 1, color: '#6554C0' },
        { name: 'Enterprise Release', quarter: 2, month: 2, color: '#36B37E' },
        { name: 'Mobile App Launch', quarter: 3, month: 1, color: '#FF5630' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Roadmap</h1>
                        <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>Long-term planning and milestones</p>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                        <Plus size={16} />
                        Add Milestone
                    </button>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', overflow: 'hidden' }}>
                        {/* Quarter Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #DFE1E6' }}>
                            {quarters.map((q, i) => (
                                <div key={i} style={{ padding: '16px', borderRight: i < 3 ? '1px solid #DFE1E6' : 'none', background: '#F4F5F7' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>{q.name}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {q.months.map(m => (
                                            <span key={m} style={{ fontSize: '11px', color: '#6B778C' }}>{m}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Roadmap Items */}
                        <div style={{ padding: '24px', minHeight: '300px' }}>
                            {milestones.map((milestone, i) => (
                                <div key={i} style={{
                                    position: 'relative',
                                    marginBottom: '24px',
                                    marginLeft: `${milestone.quarter * 25 + milestone.month * 8}%`,
                                    width: '200px'
                                }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        background: milestone.color,
                                        color: 'white',
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{milestone.name}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{quarters[milestone.quarter].months[milestone.month]} 2026</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
