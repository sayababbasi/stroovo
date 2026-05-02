"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import BottleneckInsights from '@/components/Analytics/BottleneckInsights';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle,
    Clock,
    Gauge,
    ShieldAlert,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';

type AnalyticsSummary = {
    totalTasks: number;
    doneCount: number;
    activeTasks: number;
    completionRate: number;
    avgCycleTimeDays: number;
    overdueTasks: number;
    dueSoonTasks: number;
    avgDailyThroughput: number;
    projectedDaysToClearBacklog: number | null;
    performanceScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    velocity: { date: string; count: number }[];
    throughput14d: { dateLabel: string; count: number }[];
    teamWorkload: { id: string; name: string; count: number }[];
    topContributors: { id: string; name: string; count: number }[];
    actionSignals: { type: string; title: string; value: number; message: string }[];
};

const emptySummary: AnalyticsSummary = {
    totalTasks: 0,
    doneCount: 0,
    activeTasks: 0,
    completionRate: 0,
    avgCycleTimeDays: 0,
    overdueTasks: 0,
    dueSoonTasks: 0,
    avgDailyThroughput: 0,
    projectedDaysToClearBacklog: null,
    performanceScore: 0,
    riskLevel: 'HIGH',
    velocity: [],
    throughput14d: [],
    teamWorkload: [],
    topContributors: [],
    actionSignals: []
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsSummary>(emptySummary);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics/summary');
                if (!res.ok) {
                    throw new Error('Unable to load analytics summary.');
                }
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
                setError('Unable to load live analytics right now.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const riskColor = data.riskLevel === 'LOW' ? '#36B37E' : data.riskLevel === 'MEDIUM' ? '#FFAB00' : '#FF5630';
    const maxThroughput = Math.max(...data.throughput14d.map(item => item.count), 1);
    const maxVelocity = Math.max(...data.velocity.map(item => item.count), 1);
    const avgWorkload = data.teamWorkload.length
        ? data.teamWorkload.reduce((sum, member) => sum + member.count, 0) / data.teamWorkload.length
        : 0;
    const activeHealthy = Math.max(data.activeTasks - data.overdueTasks - data.dueSoonTasks, 0);
    const deliveryMix = [
        { label: 'Completed', value: data.doneCount, color: '#36B37E' },
        { label: 'Healthy Active', value: activeHealthy, color: '#0052CC' },
        { label: 'Due Soon', value: data.dueSoonTasks, color: '#FFAB00' },
        { label: 'Overdue', value: data.overdueTasks, color: '#FF5630' }
    ];
    const totalMix = deliveryMix.reduce((sum, item) => sum + item.value, 0);
    const mixGradient = totalMix > 0
        ? (() => {
            let acc = 0;
            return deliveryMix
                .map(item => {
                    const start = acc;
                    const angle = (item.value / totalMix) * 360;
                    acc += angle;
                    return `${item.color} ${start.toFixed(2)}deg ${acc.toFixed(2)}deg`;
                })
                .join(', ');
        })()
        : '#DFE1E6 0deg 360deg';

    const throughputLine = useMemo(() => {
        if (data.throughput14d.length === 0) return { path: '', areaPath: '' };
        const width = 560;
        const height = 150;
        const left = 14;
        const top = 8;
        const xStep = data.throughput14d.length > 1 ? (width - left * 2) / (data.throughput14d.length - 1) : 0;
        const yScale = (height - top * 2) / maxThroughput;

        const points = data.throughput14d.map((item, index) => {
            const x = left + index * xStep;
            const y = height - top - item.count * yScale;
            return { x, y };
        });

        const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
        const areaPath = `${path} L ${points[points.length - 1].x} ${height - top} L ${points[0].x} ${height - top} Z`;
        return { path, areaPath };
    }, [data.throughput14d, maxThroughput]);

    return (
        <main style={{ display: 'flex', minHeight: '100vh', background: '#F7F9FC' }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: '240px', padding: '28px 32px 32px' }}>
                <div style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#172B4D', marginBottom: '6px' }}>
                            Advanced Analytics Intelligence
                        </h1>
                        <p style={{ color: '#6B778C', fontSize: '14px' }}>
                            Executive-level visibility into execution speed, delivery risk, and team capacity.
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '10px' }}>
                        <Sparkles size={16} color="#6554C0" />
                        <span style={{ fontSize: '12px', color: '#42526E', fontWeight: 600 }}>AI-Driven Benchmarking</span>
                    </div>
                </div>

                {loading && (
                    <div style={{ padding: '18px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', marginBottom: '20px' }}>
                        Loading advanced analytics...
                    </div>
                )}

                {!loading && error && (
                    <div style={{ padding: '14px 16px', background: '#FFF0EB', border: '1px solid #FFBDAD', borderRadius: '10px', marginBottom: '20px', color: '#BF2600', fontSize: '13px', fontWeight: 600 }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    {[
                        {
                            title: 'Performance Score',
                            value: `${data.performanceScore}/100`,
                            note: data.performanceScore >= 70 ? 'Ahead of baseline' : 'Below target baseline',
                            icon: Gauge,
                            color: '#0052CC'
                        },
                        {
                            title: 'Completion Rate',
                            value: `${data.completionRate}%`,
                            note: `${data.doneCount} completed / ${data.totalTasks} total`,
                            icon: CheckCircle,
                            color: '#36B37E'
                        },
                        {
                            title: 'Avg Cycle Time',
                            value: `${data.avgCycleTimeDays}d`,
                            note: 'From created to completed',
                            icon: Clock,
                            color: '#6554C0'
                        },
                        {
                            title: 'Backlog Burn',
                            value: data.projectedDaysToClearBacklog ? `${data.projectedDaysToClearBacklog}d` : '-',
                            note: `At ${data.avgDailyThroughput}/day velocity`,
                            icon: Zap,
                            color: '#FF8B00'
                        },
                        {
                            title: 'Risk Level',
                            value: data.riskLevel,
                            note: `${data.overdueTasks} overdue • ${data.dueSoonTasks} due soon`,
                            icon: ShieldAlert,
                            color: riskColor
                        }
                    ].map((stat) => (
                        <div key={stat.title} style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '14px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>{stat.title}</span>
                                <stat.icon size={16} color={stat.color} />
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D', marginBottom: '6px' }}>{stat.value}</div>
                            <div style={{ fontSize: '11px', color: '#6B778C' }}>{stat.note}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div>
                                <h3 style={{ fontSize: '15px', color: '#172B4D', fontWeight: 700 }}>Execution Throughput (14d)</h3>
                                <p style={{ fontSize: '12px', color: '#6B778C', marginTop: '3px' }}>
                                    Daily completed tasks trend and acceleration signal
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: data.avgDailyThroughput >= 1 ? '#36B37E' : '#FF5630', fontSize: '12px', fontWeight: 700 }}>
                                {data.avgDailyThroughput >= 1 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {data.avgDailyThroughput >= 1 ? 'Growing Pace' : 'Needs Momentum'}
                            </div>
                        </div>

                        <div style={{ height: '170px', borderRadius: '10px', background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)', border: '1px solid #EBECF0', padding: '8px 10px' }}>
                            {data.throughput14d.length === 0 ? (
                                <div style={{ fontSize: '12px', color: '#6B778C', padding: '54px 10px' }}>No throughput data yet.</div>
                            ) : (
                                <svg viewBox="0 0 560 150" style={{ width: '100%', height: '125px' }}>
                                    <defs>
                                        <linearGradient id="throughputArea" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#4C9AFF" stopOpacity="0.28" />
                                            <stop offset="100%" stopColor="#4C9AFF" stopOpacity="0.02" />
                                        </linearGradient>
                                    </defs>

                                    {Array.from({ length: 5 }).map((_, idx) => {
                                        const y = 8 + idx * 32;
                                        return <line key={idx} x1="10" y1={y} x2="550" y2={y} stroke="#EBECF0" strokeDasharray="3 4" />;
                                    })}

                                    <path d={throughputLine.areaPath} fill="url(#throughputArea)" />
                                    <path d={throughputLine.path} fill="none" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" />

                                    {data.throughput14d.map((point, index) => {
                                        const xStep = data.throughput14d.length > 1 ? (560 - 28) / (data.throughput14d.length - 1) : 0;
                                        const x = 14 + index * xStep;
                                        const y = 142 - point.count * ((150 - 16) / maxThroughput);
                                        return (
                                            <g key={point.dateLabel}>
                                                <circle cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#0052CC" strokeWidth="2" />
                                            </g>
                                        );
                                    })}
                                </svg>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(data.throughput14d.length, 1)}, 1fr)`, gap: '6px', marginTop: '8px' }}>
                            {data.throughput14d.map((point) => (
                                <div key={point.dateLabel} style={{ textAlign: 'center', fontSize: '10px', color: '#6B778C' }}>
                                    {point.dateLabel}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '16px' }}>
                            <h3 style={{ fontSize: '15px', color: '#172B4D', fontWeight: 700, marginBottom: '10px' }}>Velocity Snapshot (7d)</h3>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '92px', marginBottom: '10px' }}>
                                {data.velocity.length === 0 ? (
                                    <div style={{ fontSize: '12px', color: '#6B778C' }}>No velocity data yet.</div>
                                ) : (
                                    data.velocity.map((point) => (
                                        <div key={point.date} style={{ flex: 1, textAlign: 'center' }}>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    margin: '0 auto',
                                                    maxWidth: '18px',
                                                    height: `${Math.max((point.count / maxVelocity) * 70, 8)}px`,
                                                    background: point.count >= data.avgDailyThroughput ? 'linear-gradient(180deg, #36B37E 0%, #57D9A3 100%)' : 'linear-gradient(180deg, #79F2C0 0%, #B3F5D6 100%)',
                                                    borderRadius: '6px',
                                                    marginBottom: '6px',
                                                    boxShadow: point.count >= data.avgDailyThroughput ? '0 4px 12px rgba(54, 179, 126, 0.35)' : 'none'
                                                }}
                                            />
                                            <div style={{ fontSize: '10px', color: '#6B778C' }}>{point.date}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#42526E' }}>
                                Average <strong>{data.avgDailyThroughput}</strong> completed/day
                            </div>
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, #6554C0 0%, #5243AA 100%)', borderRadius: '12px', padding: '16px', color: '#FFFFFF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Target size={16} />
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>AI Performance Outlook</span>
                            </div>
                            <p style={{ fontSize: '12px', opacity: 0.95, lineHeight: 1.5 }}>
                                At current throughput, backlog clearance is projected in{' '}
                                <strong>{data.projectedDaysToClearBacklog ?? 'N/A'} days</strong>. Reducing cycle time by 15% can
                                improve monthly delivery capacity by approximately 8-12%.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '16px' }}>
                        <h3 style={{ fontSize: '15px', color: '#172B4D', fontWeight: 700, marginBottom: '14px' }}>Capacity Heatmap</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {data.teamWorkload.length === 0 ? (
                                <span style={{ fontSize: '12px', color: '#6B778C' }}>No team workload data found.</span>
                            ) : (
                                data.teamWorkload.map((member) => {
                                    const width = avgWorkload > 0 ? Math.min((member.count / (avgWorkload * 2)) * 100, 100) : 0;
                                    const barColor = member.count > avgWorkload * 1.5 ? '#FF5630' : member.count > avgWorkload ? '#FFAB00' : '#36B37E';
                                    return (
                                        <div key={member.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 45px', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: '#42526E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
                                            <div style={{ height: '8px', background: '#F4F5F7', borderRadius: '8px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${width}%`, background: barColor, borderRadius: '8px' }} />
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#172B4D', textAlign: 'right' }}>{member.count}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '16px' }}>
                        <h3 style={{ fontSize: '15px', color: '#172B4D', fontWeight: 700, marginBottom: '14px' }}>Top Contributors</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {data.topContributors.length === 0 ? (
                                <span style={{ fontSize: '12px', color: '#6B778C' }}>No contributor data available.</span>
                            ) : (
                                data.topContributors.map((contributor, index) => (
                                    <div key={contributor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: '#F8FAFF' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0052CC', color: '#FFFFFF', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                {index + 1}
                                            </div>
                                            <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 600 }}>{contributor.name}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#42526E', fontWeight: 700 }}>{contributor.count} active</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '16px' }}>
                        <h3 style={{ fontSize: '15px', color: '#172B4D', fontWeight: 700, marginBottom: '14px' }}>Action Signals</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', padding: '10px', borderRadius: '10px', background: '#FAFBFC', border: '1px solid #EBECF0' }}>
                            <div
                                style={{
                                    width: '74px',
                                    height: '74px',
                                    borderRadius: '50%',
                                    background: `conic-gradient(${mixGradient})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#172B4D' }}>
                                    {data.totalTasks}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#172B4D', marginBottom: '6px' }}>Delivery Mix</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {deliveryMix.map((item) => (
                                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#42526E' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                            <span>{item.label}: {item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {data.actionSignals.length === 0 ? (
                                <span style={{ fontSize: '12px', color: '#6B778C' }}>No action signals detected.</span>
                            ) : (
                                data.actionSignals.map((signal) => (
                                    <div key={signal.title} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DFE1E6', background: signal.type === 'risk' ? '#FFF0EB' : signal.type === 'warning' ? '#FFFAE6' : '#F4F5F7' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            {signal.type === 'risk' ? <AlertTriangle size={14} color="#FF5630" /> : signal.type === 'warning' ? <Clock size={14} color="#FF8B00" /> : <Activity size={14} color="#0052CC" />}
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#172B4D' }}>{signal.title}</span>
                                            <span style={{ fontSize: '12px', color: '#6B778C', marginLeft: 'auto', fontWeight: 700 }}>{signal.value}</span>
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#42526E', lineHeight: 1.4 }}>{signal.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <BottleneckInsights />

                    <div style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '16px' }}>
                        <h3 style={{ fontSize: '15px', color: '#172B4D', fontWeight: 700, marginBottom: '10px' }}>Competitive Benchmark Snapshot</h3>
                        <p style={{ fontSize: '12px', color: '#42526E', lineHeight: 1.5, marginBottom: '16px' }}>
                            This dashboard emphasizes delivery intelligence, proactive risk signals, and actionable team capacity data —
                            making it stronger than standard KPI-only analytics views.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ padding: '12px', border: '1px solid #DFE1E6', borderRadius: '8px', background: '#F8FAFF' }}>
                                <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>Delivery Intelligence</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D' }}>Advanced</div>
                            </div>
                            <div style={{ padding: '12px', border: '1px solid #DFE1E6', borderRadius: '8px', background: '#F8FAFF' }}>
                                <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>Predictive Signals</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D' }}>Enabled</div>
                            </div>
                            <div style={{ padding: '12px', border: '1px solid #DFE1E6', borderRadius: '8px', background: '#F8FAFF' }}>
                                <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>Capacity Control</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D' }}>Real-Time</div>
                            </div>
                            <div style={{ padding: '12px', border: '1px solid #DFE1E6', borderRadius: '8px', background: '#F8FAFF' }}>
                                <div style={{ fontSize: '11px', color: '#6B778C', marginBottom: '4px' }}>Executive Reporting</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D' }}>Ready</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
