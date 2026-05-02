"use client";

import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Activity,
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileBarChart2,
    Filter,
    Gauge,
    PieChart,
    Plus,
    Sparkles,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';

type ReportsSummary = {
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

const emptySummary: ReportsSummary = {
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

export default function ReportsPage() {
    const [summary, setSummary] = useState<ReportsSummary>(emptySummary);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/analytics/summary', { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch report intelligence.');
                const data = await res.json();
                setSummary(data);
            } catch (err) {
                console.error('Failed to fetch reports summary:', err);
                setError('Unable to load live report intelligence right now.');
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const riskColor = summary.riskLevel === 'LOW' ? '#36B37E' : summary.riskLevel === 'MEDIUM' ? '#FFAB00' : '#FF5630';
    const throughputPeak = Math.max(...summary.throughput14d.map(day => day.count), 1);
    const avgLoad = summary.teamWorkload.length
        ? summary.teamWorkload.reduce((sum, member) => sum + member.count, 0) / summary.teamWorkload.length
        : 0;

    const reportLibrary = useMemo(() => {
        const today = new Date();
        const isoDay = today.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return [
            {
                name: 'Executive Delivery Intelligence',
                type: 'Executive',
                date: isoDay,
                status: 'Ready',
                highlight: `Performance score ${summary.performanceScore}/100 with ${summary.riskLevel} delivery risk`
            },
            {
                name: 'Operational Risk Pulse',
                type: 'Risk',
                date: isoDay,
                status: 'Ready',
                highlight: `${summary.overdueTasks} overdue tasks and ${summary.dueSoonTasks} due in 72h`
            },
            {
                name: 'Team Capacity Optimization',
                type: 'Workload',
                date: isoDay,
                status: 'Ready',
                highlight: `${summary.teamWorkload.length} members tracked with live allocation heatmap`
            },
            {
                name: 'Backlog Burn Forecast',
                type: 'Forecast',
                date: isoDay,
                status: 'Ready',
                highlight: summary.projectedDaysToClearBacklog
                    ? `${summary.projectedDaysToClearBacklog} days projected to clear backlog`
                    : 'Not enough velocity data for projection'
            }
        ];
    }, [summary]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D' }}>Advanced Reports Intelligence</h1>
                        <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>
                            Executive-grade analytical reporting with forecasting and risk diagnostics.
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#42526E' }}>
                            <Filter size={14} />
                            Filter Scope
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: 'none', borderRadius: '6px', background: '#0052CC', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'white' }}>
                            <Plus size={14} />
                            Generate Report
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {loading && (
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '16px', marginBottom: '16px', color: '#42526E' }}>
                            Loading report intelligence...
                        </div>
                    )}

                    {!loading && error && (
                        <div style={{ background: '#FFEBE6', borderRadius: '8px', border: '1px solid #FFBDAD', padding: '12px 14px', marginBottom: '16px', color: '#BF2600', fontSize: '13px', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '20px' }}>
                        {[
                            { label: 'Performance Score', value: `${summary.performanceScore}/100`, change: summary.performanceScore >= 70 ? 'Healthy trajectory' : 'Needs optimization', icon: Gauge, color: '#0052CC' },
                            { label: 'Completion Health', value: `${summary.completionRate}%`, change: `${summary.doneCount}/${summary.totalTasks} completed`, icon: CheckCircle2, color: '#36B37E' },
                            { label: 'Cycle Time', value: `${summary.avgCycleTimeDays}d`, change: 'Average delivery speed', icon: Clock, color: '#6554C0' },
                            { label: 'Backlog Forecast', value: summary.projectedDaysToClearBacklog ? `${summary.projectedDaysToClearBacklog}d` : '-', change: `${summary.avgDailyThroughput}/day throughput`, icon: TrendingUp, color: '#FF8B00' },
                            { label: 'Risk Level', value: summary.riskLevel, change: `${summary.overdueTasks} overdue`, icon: AlertTriangle, color: riskColor },
                        ].map((stat) => (
                            <div key={stat.label} style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6B778C', marginBottom: '4px' }}>{stat.label}</div>
                                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D' }}>{stat.value}</div>
                                    </div>
                                    <stat.icon size={18} color={stat.color} />
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#42526E' }}>{stat.change}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <div>
                                    <h3 style={{ fontWeight: 700, color: '#172B4D', fontSize: '15px' }}>Throughput Trend (14 Days)</h3>
                                    <p style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>Delivery momentum and capacity consistency</p>
                                </div>
                                <div style={{ fontSize: '12px', color: '#42526E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Activity size={14} color="#0052CC" />
                                    Avg {summary.avgDailyThroughput}/day
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '170px' }}>
                                {summary.throughput14d.length === 0 ? (
                                    <div style={{ fontSize: '12px', color: '#6B778C' }}>No throughput data yet.</div>
                                ) : (
                                    summary.throughput14d.map((day) => (
                                        <div key={day.dateLabel} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '16px',
                                                    height: `${Math.max((day.count / throughputPeak) * 130, 8)}px`,
                                                    borderRadius: '8px',
                                                    background: day.count >= summary.avgDailyThroughput ? '#0052CC' : '#B3D4FF'
                                                }}
                                                title={`${day.dateLabel}: ${day.count}`}
                                            />
                                            <span style={{ fontSize: '10px', color: '#6B778C' }}>{day.dateLabel}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '16px' }}>
                                <h3 style={{ fontWeight: 700, color: '#172B4D', fontSize: '15px', marginBottom: '12px' }}>Capacity Distribution</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {summary.teamWorkload.length === 0 ? (
                                        <span style={{ fontSize: '12px', color: '#6B778C' }}>No team capacity data.</span>
                                    ) : (
                                        summary.teamWorkload.slice(0, 6).map((member) => {
                                            const width = avgLoad > 0 ? Math.min((member.count / (avgLoad * 2)) * 100, 100) : 0;
                                            const color = member.count > avgLoad * 1.5 ? '#FF5630' : member.count > avgLoad ? '#FFAB00' : '#36B37E';
                                            return (
                                                <div key={member.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 40px', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '11px', color: '#42526E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
                                                    <div style={{ height: '8px', background: '#F4F5F7', borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${width}%`, height: '100%', background: color }} />
                                                    </div>
                                                    <span style={{ fontSize: '11px', color: '#172B4D', fontWeight: 700, textAlign: 'right' }}>{member.count}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, #6554C0 0%, #5243AA 100%)', borderRadius: '8px', padding: '16px', color: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <Sparkles size={16} />
                                    <h3 style={{ fontWeight: 700, fontSize: '14px' }}>AI Report Insight</h3>
                                </div>
                                <p style={{ fontSize: '12px', lineHeight: 1.5, opacity: 0.92 }}>
                                    Delivery risk is <strong>{summary.riskLevel}</strong>. Reallocating workload from top-loaded contributors can
                                    improve cycle time and reduce overdue risk in the next sprint window.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontWeight: 700, color: '#172B4D', fontSize: '14px' }}>Top Contributors</h3>
                                <Users size={16} color="#0052CC" />
                            </div>
                            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {summary.topContributors.length === 0 ? (
                                    <span style={{ fontSize: '12px', color: '#6B778C' }}>No contributor data available.</span>
                                ) : (
                                    summary.topContributors.map((member, index) => (
                                        <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFF', borderRadius: '6px', padding: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0052CC', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {index + 1}
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{member.name}</span>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#42526E', fontWeight: 700 }}>{member.count} active</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontWeight: 700, color: '#172B4D', fontSize: '14px' }}>Action Signals</h3>
                                <Zap size={16} color="#6554C0" />
                            </div>
                            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {summary.actionSignals.length === 0 ? (
                                    <span style={{ fontSize: '12px', color: '#6B778C' }}>No signals detected.</span>
                                ) : (
                                    summary.actionSignals.map((signal) => (
                                        <div key={signal.title} style={{ border: '1px solid #DFE1E6', borderRadius: '6px', padding: '10px', background: signal.type === 'risk' ? '#FFF0EB' : signal.type === 'warning' ? '#FFFAE6' : '#F4F5F7' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '12px', color: '#172B4D', fontWeight: 700 }}>{signal.title}</span>
                                                <span style={{ fontSize: '12px', color: '#42526E', fontWeight: 700 }}>{signal.value}</span>
                                            </div>
                                            <p style={{ fontSize: '11px', color: '#42526E', lineHeight: 1.4 }}>{signal.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontWeight: 700, color: '#172B4D', fontSize: '14px' }}>Premium Report Library</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B778C' }}>
                                <FileBarChart2 size={14} />
                                Auto-generated intelligence packs
                            </div>
                        </div>

                        {reportLibrary.map((report, i) => (
                            <div key={report.name} style={{ padding: '14px 16px', borderBottom: i < reportLibrary.length - 1 ? '1px solid #EBECF0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#172B4D' }}>{report.name}</div>
                                    <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>
                                        {report.type} • {report.date} • {report.status}
                                    </div>
                                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#42526E' }}>{report.highlight}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '12px' }}>
                                        <Calendar size={14} />
                                        Schedule
                                    </button>
                                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '12px' }}>
                                        <Download size={14} />
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <PieChart size={15} color="#0052CC" />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Competitive Value</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#42526E', lineHeight: 1.5 }}>
                                This reporting surface combines metrics, prediction, risk, and action plans in one place — stronger than static competitor reports.
                            </p>
                        </div>
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <TrendingUp size={15} color="#36B37E" />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Forecast Precision</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#42526E', lineHeight: 1.5 }}>
                                Backlog burn estimates and throughput trends help leadership plan sprint commitments with confidence.
                            </p>
                        </div>
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Sparkles size={15} color="#6554C0" />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Executive Readiness</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#42526E', lineHeight: 1.5 }}>
                                Every report card is presentation-ready for founders, PMO, and enterprise clients.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
