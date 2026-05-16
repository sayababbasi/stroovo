"use client";

import React, { useState, useEffect } from 'react';
import { 
    Users, AlertCircle, CheckCircle2, Zap, 
    Activity, ArrowUpRight, ArrowDownRight, 
    Database, Network, Cpu, Clock, RefreshCw,
    ShieldAlert, Globe
} from 'lucide-react';

export default function AdminDashboardPage() {
    const [overview, setOverview] = useState<any>(null);
    const [aiMetrics, setAiMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overRes, aiRes] = await Promise.all([
                    fetch('/api/admin/overview'),
                    fetch('/api/admin/ai-metrics')
                ]);
                
                if (overRes.ok) setOverview(await overRes.json());
                if (aiRes.ok) setAiMetrics(await aiRes.json());
            } catch (err) {
                console.error('Failed to load admin data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Polling as fallback, but WebSockets will trigger too
        return () => clearInterval(interval);
    }, []);

    const stats = [
        { name: 'Total Users', value: overview?.totalUsers || 0, trend: '+12%', up: true, icon: Users, color: '#0052CC' },
        { name: 'Active Sessions', value: overview?.activeSessions || 0, trend: '+5%', up: true, icon: Clock, color: '#FFAB00' },
        { name: 'Tasks Completed', value: overview?.completedToday || 0, trend: '+8%', up: true, icon: CheckCircle2, color: '#36B37E' },
        { name: 'AI Executions', value: overview?.aiActionsExecuted || 0, trend: '+24%', up: true, icon: Bot, color: '#6554C0' },
        { name: 'System Load', value: `${overview?.systemLoad || 0}%`, trend: '-2%', up: false, icon: Activity, color: '#FF5630' },
    ];

    if (loading) return <div className="p-8">Loading Overview...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D', margin: 0 }}>System Control Center</h1>
                    <p style={{ color: '#6B778C', margin: '4px 0 0' }}>Real-time platform monitoring and operations</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ 
                        padding: '8px 16px', 
                        background: '#FFFFFF', 
                        border: '1px solid #EBECF0', 
                        borderRadius: '6px', 
                        fontSize: '14px', 
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>Export Data</button>
                    <button style={{ 
                        padding: '8px 16px', 
                        background: '#0052CC', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontSize: '14px', 
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>Refresh Engine</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                {stats.map((stat) => (
                    <div key={stat.name} style={{ 
                        background: 'white', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid #EBECF0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '12px', 
                                fontWeight: 700, 
                                color: stat.up ? '#36B37E' : '#FF5630' 
                            }}>
                                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', marginBottom: '4px' }}>{stat.name}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* AI Monitoring Section */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #EBECF0', 
                    overflow: 'hidden' 
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #EBECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Bot size={20} color="#6554C0" />
                            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Autonomous AI Monitoring</h3>
                        </div>
                        <span style={{ fontSize: '12px', color: '#0052CC', fontWeight: 600, cursor: 'pointer' }}>View All Logs</span>
                    </div>
                    <div style={{ padding: '0 20px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F4F5F7' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 0', fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>ACTION</th>
                                    <th style={{ textAlign: 'left', padding: '16px 0', fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>TEAM</th>
                                    <th style={{ textAlign: 'left', padding: '16px 0', fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>REASON</th>
                                    <th style={{ textAlign: 'right', padding: '16px 0', fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>CONFIDENCE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aiMetrics?.recentActions?.map((log: any) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #F4F5F7' }}>
                                        <td style={{ padding: '16px 0' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{log.action}</div>
                                            <div style={{ fontSize: '11px', color: '#6B778C' }}>Task: {log.task?.title || 'System'}</div>
                                        </td>
                                        <td style={{ padding: '16px 0', fontSize: '13px', color: '#42526E' }}>{log.team?.name}</td>
                                        <td style={{ padding: '16px 0', fontSize: '13px', color: '#42526E' }}>{log.reason}</td>
                                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '4px', 
                                                background: '#E3FCEF', 
                                                color: '#36B37E', 
                                                fontSize: '11px', 
                                                fontWeight: 700 
                                            }}>98.2%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Health Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        border: '1px solid #EBECF0', 
                        padding: '24px' 
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Database size={18} color="#FFAB00" /> Infrastructure
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { name: 'PostgreSQL DB', status: 'Healthy', latency: '4ms', color: '#36B37E' },
                                { name: 'Redis Cache', status: 'Healthy', latency: '1ms', color: '#36B37E' },
                                { name: 'AI Engine', status: 'Healthy', latency: '124ms', color: '#36B37E' },
                                { name: 'WebSocket Server', status: 'Degraded', latency: '45ms', color: '#FFAB00' },
                            ].map((service) => (
                                <div key={service.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{service.name}</div>
                                        <div style={{ fontSize: '11px', color: '#6B778C' }}>{service.latency} latency</div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        background: `${service.color}15`, 
                                        color: service.color, 
                                        fontSize: '11px', 
                                        fontWeight: 700 
                                    }}>
                                        {service.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ 
                        background: '#172B4D', 
                        borderRadius: '12px', 
                        padding: '24px',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <ShieldAlert size={20} color="#FFAB00" />
                            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Security Alerts</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFAB00' }}>Suspicious Login</div>
                                <div style={{ fontSize: '11px', opacity: 0.7 }}>User Alex Johnson from unknown IP</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#36B37E' }}>MFA Enforced</div>
                                <div style={{ fontSize: '11px', opacity: 0.7 }}>92% of admins have MFA enabled</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Bot({ size, color }: { size: number, color: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    );
}
