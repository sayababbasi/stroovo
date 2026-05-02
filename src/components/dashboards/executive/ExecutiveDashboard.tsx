"use client";

import React, { useEffect, useState } from 'react';
import { 
    Search, Bell, Settings, User, 
    Zap, Clock, ShieldAlert, Activity, 
    TrendingUp, TrendingDown, Target, ListTodo
} from 'lucide-react';
import ExecutiveStatCard from '@/components/ExecutiveStatCard';
import ExecutiveAlertCard from '@/components/ExecutiveAlertCard';
import ExecutiveAssistantSidebar from '@/components/ExecutiveAssistantSidebar';
import ExecutiveTeamIntelligence from '@/components/ExecutiveTeamIntelligence';

export default function ExecutiveDashboard({ user }: { user: any }) {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch('/api/analytics/summary');
                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data);
                }
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div style={{ 
            display: 'flex', 
            height: '100vh', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#F8F9FB',
            color: '#0052CC',
            fontSize: '18px',
            fontWeight: 600
        }}>
            <Zap size={32} style={{ marginRight: '12px', animation: 'pulse 1.5s infinite' }} />
            Initializing AI Strategy...
        </div>
    );

    return (
        <div style={{ 
            padding: '24px 32px', 
            background: '#F8F9FB', 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
        }}>
            {/* Header */}
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        border: '1px solid #EBECF0',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '320px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                    }}>
                        <Search size={18} color="#6B778C" />
                        <input 
                            type="text" 
                            placeholder="Search strategy, projects, goals..." 
                            style={{ 
                                border: 'none', 
                                outline: 'none', 
                                width: '100%',
                                fontSize: '14px',
                                color: '#172B4D'
                            }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}>
                        <Bell size={20} color="#42526E" />
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#FF5630', border: '2px solid white' }} />
                    </button>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Settings size={20} color="#42526E" />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 12px', background: 'white', borderRadius: '20px', border: '1px solid #EBECF0', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DEEBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="#0052CC" />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{user?.name?.split(' ')[0] || 'CEO'}</span>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '32px' }}>
                {/* Main Content Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Top Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        <ExecutiveStatCard 
                            title="Execution Health"
                            value={`${analytics?.performanceScore || 0}%`}
                            trend={analytics?.performanceScore > 70 ? "+8%" : "-2%"}
                            trendType={analytics?.performanceScore > 70 ? "positive" : "negative"}
                            trendText="Real-time performance"
                            sparklineData={analytics?.velocity?.map((v: any) => v.count) || [65, 68, 72, 70, 75, 80, 82]}
                        />
                        <ExecutiveStatCard 
                            title="Active Tasks"
                            value={analytics?.activeTasks || 0}
                            trend={analytics?.activeTasks > 10 ? "+3" : "0"}
                            trendType="neutral"
                            trendText="running"
                            sparklineData={analytics?.throughput14d?.map((v: any) => v.count) || [15, 14, 16, 12, 13, 11, 12]}
                        />
                        <ExecutiveStatCard 
                            title="Risk Level"
                            value={analytics?.riskLevel || 'LOW'}
                            trend={analytics?.riskLevel === 'HIGH' ? "High" : "Low"}
                            trendType={analytics?.riskLevel === 'HIGH' ? "negative" : "positive"}
                            trendText={`${analytics?.overdueTasks || 0} overdue tasks`}
                            sparklineData={[20, 30, 45, 60, 55, 75, 80]}
                        />
                        <ExecutiveStatCard 
                            title="Completion Rate"
                            value={`${analytics?.completionRate || 0}%`}
                            trend="+7%"
                            trendType="positive"
                            trendText="Cumulative total"
                            sparklineData={[60, 62, 65, 63, 68, 70, 74]}
                        />
                    </div>

                    {/* AI Command Center Section */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <Zap size={20} color="#0052CC" fill="#0052CC" />
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: 0 }}>AI Command Center</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {analytics?.actionSignals?.filter((s: any) => s.type !== 'info').map((signal: any, i: number) => (
                                <ExecutiveAlertCard 
                                    key={i}
                                    type={signal.type === 'risk' ? 'delay' : 'overload'}
                                    title={signal.title}
                                    priority={signal.type === 'risk' ? "High" : "Medium"}
                                    confidence={90}
                                    description={signal.message}
                                />
                            )) || (
                                <div style={{ padding: 24, background: 'white', borderRadius: 12, textAlign: 'center', color: '#6B778C' }}>
                                    No immediate AI alerts at this time.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* AI Decision Hub Bottom Section */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <Activity size={20} color="#0052CC" />
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: 0 }}>AI Decision Hub</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {(analytics?.actionSignals?.filter((s: any) => s.type === 'info') || [
                                { title: 'Balance Workload', type: 'info', message: "Reassign 'Database migration' to Alex", confidence: 92, color: '#0052CC' },
                                { title: 'Expedite Project Beta', type: 'info', message: 'Allocate 5 more QA testers for rush items', confidence: 94, color: '#36B37E' },
                                { title: 'Prevent Burnout', type: 'info', message: 'Add buffer day for Design team next sprint', confidence: 89, color: '#FFAB00' }
                            ]).slice(0, 3).map((hub: any, i: number) => (
                                <div key={i} style={{ 
                                    background: 'white', 
                                    borderRadius: '16px', 
                                    padding: '24px', 
                                    border: '1px solid #EBECF0', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '12px' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D', margin: 0 }}>{hub.title}</h4>
                                        <div style={{ padding: '4px 8px', background: `${hub.color || '#0052CC'}15`, borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: hub.color || '#0052CC' }}>
                                            {hub.confidence || 90}%
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#42526E' }}>
                                        Strategy: <span style={{ fontWeight: 600, color: '#0052CC' }}>Optimization Recommended</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6B778C', margin: '4px 0' }}>{hub.message}</div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button style={{ flex: 1, padding: '8px', background: hub.color || '#0052CC', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                            Auto Fix
                                        </button>
                                        <button style={{ flex: 1, padding: '8px', background: '#F4F5F7', color: '#42526E', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                            Simulate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <ExecutiveAssistantSidebar user={user} />
                    <ExecutiveTeamIntelligence analytics={analytics} />
                </aside>
            </div>
            
            <style jsx global>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
