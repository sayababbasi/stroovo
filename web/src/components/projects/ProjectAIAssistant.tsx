
"use client";

import React from 'react';
import { Zap, AlertTriangle, ShieldAlert, Star, ChevronRight, Users, Calendar, Target, Plus, Activity } from 'lucide-react';
import { ProjectTask } from './TaskBoard';

export default function ProjectAIAssistant({ project, tasks, riskScore }: { project: any, tasks: ProjectTask[], riskScore: number }) {
    const delayedTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE');
    
    // Derived deadlines from tasks
    const upcomingDeadlines = tasks
        .filter(t => t.dueDate && t.status !== 'DONE')
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 3);
    
    // If no real tasks have deadlines, add mock ones to match the reference
    if (upcomingDeadlines.length === 0) {
        upcomingDeadlines.push(
            { title: 'Content Calendar Setup', dueDate: 'Aug 16, 2026', diff: 'in 3 days' } as any,
            { title: 'AI Tools Integration', dueDate: 'Aug 20, 2026', diff: 'in 7 days' } as any,
            { title: '30-Day Content Launch', dueDate: 'Aug 31, 2026', diff: 'in 18 days' } as any
        );
    }

    const mockActivity = [
        { user: 'Sayab Abbasi', act: 'updated project progress', stat: '12% → 0%', time: 'Just now', img: 'https://i.pravatar.cc/150?u=sayab' },
        { user: 'Sayab Abbasi', act: 'created task', stat: 'Review 37 delayed tasks', time: 'Aug 12, 2026', img: 'https://i.pravatar.cc/150?u=sayab' },
        { user: 'Sayab Abbasi', act: 'added milestone', stat: 'Content Calendar Setup', time: 'Aug 10, 2026', img: 'https://i.pravatar.cc/150?u=sayab' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            
            {/* AI Assistant Card */}
            <div className="p-panel" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} color="#0052CC" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#172B4D' }}>AI Project Assistant</span>
                    </div>
                    <span style={{ fontSize: 10, background: '#E6EFFF', color: '#0052CC', padding: '4px 8px', borderRadius: 12, fontWeight: 800 }}>Stroovo AI</span>
                </div>

                <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={14} color="#EF4444" />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#BF2600' }}>Project at Risk</span>
                        </div>
                        <span style={{ fontSize: 10, background: '#EF4444', color: 'white', padding: '2px 8px', borderRadius: 12, fontWeight: 800 }}>High</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#172B4D', margin: '0 0 16px 0', lineHeight: 1.5, fontWeight: 500 }}>
                        This project may miss the deadline by <strong>5 days</strong>.
                    </p>
                    
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#172B4D', marginBottom: 8 }}>Key reasons</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <li style={{ fontSize: 12, color: '#42526E', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#42526E' }} /> 37 tasks are delayed</li>
                        <li style={{ fontSize: 12, color: '#42526E', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#42526E' }} /> Low task completion velocity</li>
                        <li style={{ fontSize: 12, color: '#42526E', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#42526E' }} /> 1 milestone overdue</li>
                    </ul>
                    
                    <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View full analysis <ChevronRight size={14} /></a>
                </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="p-panel" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: 0 }}>Upcoming Deadlines</h3>
                    <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 700, textDecoration: 'none' }}>View all</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {upcomingDeadlines.map((t: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #0052CC', marginTop: 4, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', lineHeight: 1.3, marginBottom: 4 }}>{t.title}</div>
                                    <div style={{ fontSize: 11, color: '#8A94A6', fontWeight: 500 }}>{t.diff || 'Upcoming'}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#172B4D', whiteSpace: 'nowrap' }}>
                                {t.dueDate}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-panel" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: 0 }}>Recent Activity</h3>
                    <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 700, textDecoration: 'none' }}>View all</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {mockActivity.map((act, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4C9AFF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>SA</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: '#42526E', lineHeight: 1.4, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 800, color: '#172B4D' }}>{act.user}</span> {act.act}
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>{act.stat}</div>
                            </div>
                            <div style={{ fontSize: 10, color: '#8A94A6', fontWeight: 500, whiteSpace: 'nowrap' }}>{act.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-panel" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: '0 0 20px 0' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                        { l: 'Add Milestone', i: Plus, c: '#10B981', bg: '#E3FCEF' },
                        { l: 'Optimize Project', i: Zap, c: '#0052CC', bg: '#E6EFFF' },
                        { l: 'Rebalance Workload', i: Zap, c: '#8B5CF6', bg: '#EDE9FE' },
                        { l: 'Adjust Timeline', i: Calendar, c: '#F59E0B', bg: '#FFF7E6' },
                        { l: 'Auto Plan Tasks', i: Target, c: '#F59E0B', bg: '#FFF7E6' },
                        { l: 'Generate Report', i: Activity, c: '#0052CC', bg: '#E6EFFF' },
                    ].map(a => (
                        <div key={a.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: a.bg, color: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${a.c}20`, transition: 'transform 0.2s' }} className="hover:scale-105">
                                <a.i size={18} strokeWidth={2.5} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#42526E', lineHeight: 1.2 }}>{a.l}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
