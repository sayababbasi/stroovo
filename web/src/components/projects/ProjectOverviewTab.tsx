
"use client";

import React from 'react';
import { Star, ChevronDown, Share, MoreHorizontal, Plus, AlertTriangle, Clock, Activity, Target, Zap, ShieldAlert, Calendar, Users, ExternalLink, CheckCircle } from 'lucide-react';
import { ProjectTask } from './TaskBoard';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

type ProjectProps = {
    project: any;
    tasks: ProjectTask[];
    progress: number;
    riskScore: number;
    onAction: (action: string) => void;
};

export default function ProjectOverviewTab({ project, tasks, progress, riskScore, onAction }: ProjectProps) {
    const totalTasks = tasks.length || 60;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const calculatedProgress = tasks.length > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const statusCounts = {
        TODO: tasks.length ? tasks.filter(t => t.status === 'TODO' || t.status === 'BACKLOG').length : 60,
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        REVIEW: tasks.filter(t => t.status === 'REVIEW').length,
        DONE: completedTasks,
    };

    const healthTrendData = [
        { date: 'Jul 10', value: 20 },
        { date: 'Jul 14', value: 35 },
        { date: 'Jul 17', value: 50 },
        { date: 'Jul 21', value: 65 },
        { date: 'Jul 24', value: 62 },
        { date: 'Jul 28', value: 68 },
        { date: 'Aug 1', value: 70 },
        { date: 'Aug 4', value: 68 },
        { date: 'Aug 7', value: 75 },
    ];

    const velocityData = [
        { name: 'Sprint 8', value: 28 },
        { name: 'Sprint 9', value: 34 },
        { name: 'Sprint 10', value: 38 },
        { name: 'Sprint 11', value: 37 },
        { name: 'Sprint 12', value: 42, active: true }
    ];

    let milestones = tasks.filter(t => t.type === 'MILESTONE').slice(0, 3);
    if (milestones.length === 0) {
        milestones = [
            { id: '1', title: 'Content Calendar Setup', progress: 40, dueDate: 'Aug 16, 2026', status: 'IN_PROGRESS' } as any,
            { id: '2', title: 'AI Tools Integration', progress: 0, dueDate: 'Aug 20, 2026', status: 'TODO' } as any,
            { id: '3', title: '30-Day Content Launch', progress: 0, dueDate: 'Aug 31, 2026', status: 'TODO' } as any
        ];
    }

    const tProg = (statusCounts.DONE / totalTasks) * 100;
    const tRev = (statusCounts.REVIEW / totalTasks) * 100;
    const tInP = (statusCounts.IN_PROGRESS / totalTasks) * 100;
    const tTodo = (statusCounts.TODO / totalTasks) * 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* ── KPI ROW ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                
                {/* Overall Progress */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#5E6C84', marginBottom: 16 }}>Overall Progress</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: 8 }}>{calculatedProgress}%</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6B778C', marginBottom: 12 }}>{completedTasks} / {totalTasks} tasks completed</div>
                    <div style={{ height: 4, background: '#EBECF0', borderRadius: 2, width: '100%' }}>
                        <div style={{ width: `${calculatedProgress}%`, height: '100%', background: '#0052CC', borderRadius: 2 }} />
                    </div>
                </div>

                {/* Execution Score */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#5E6C84', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Star size={14} color="#10B981" /> Execution Score</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>78</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#8A94A6' }}>/100</div>
                        <div style={{ marginLeft: 'auto', background: '#E3FCEF', color: '#006644', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Good</div>
                    </div>
                    <div style={{ height: 32, marginTop: 'auto' }}>
                        <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                            <path d="M0,20 L20,15 L40,18 L60,10 L80,12 L100,2" fill="none" stroke="#10B981" strokeWidth="2.5" />
                            <circle cx="100" cy="2" r="3" fill="#10B981" />
                        </svg>
                    </div>
                </div>

                {/* Risk Score */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#5E6C84', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={14} color="#10B981" /> Risk Score</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: 8 }}>Low</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6B778C', marginTop: 'auto' }}>Active risks: 0</div>
                </div>

                {/* Delay Prediction */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#5E6C84', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={14} color="#F59E0B" /> Delay Prediction</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: 8 }}>+5 days</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6B778C', marginTop: 'auto' }}>Predicted delay</div>
                </div>

                {/* Team Load */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#5E6C84', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={14} color="#10B981" /> Team Load</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: 8 }}>86%</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6B778C', marginTop: 'auto' }}>High Capacity</div>
                </div>
            </div>

            {/* ── MIDDLE ROW: HEALTH & DISTRIBUTION ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                
                {/* Project Health */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: '0 0 20px 0' }}>Project Health</h3>
                    <div style={{ display: 'flex', gap: 24, flex: 1 }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #DFE1E6', borderRadius: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 700, color: '#42526E' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E6EFFF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={12} /></div>
                                    Progress Health
                                </div>
                                <span style={{ color: '#006644', fontWeight: 800, fontSize: 12 }}>On Track</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #DFE1E6', borderRadius: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 700, color: '#42526E' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FFF0F0', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={12} /></div>
                                    Schedule Health
                                </div>
                                <span style={{ color: '#BF2600', fontWeight: 800, fontSize: 12 }}>At Risk</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #DFE1E6', borderRadius: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 700, color: '#42526E' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FFF7E6', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={12} /></div>
                                    Risk Status
                                </div>
                                <span style={{ color: '#006644', fontWeight: 800, fontSize: 12 }}>Low</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #DFE1E6', borderRadius: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 700, color: '#42526E' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E3FCEF', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={12} /></div>
                                    Team Performance
                                </div>
                                <span style={{ color: '#006644', fontWeight: 800, fontSize: 12 }}>Good</span>
                            </div>
                        </div>
                        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B778C', marginBottom: 16 }}>Health Trend (Last 30 Days)</div>
                            <div style={{ flex: 1, minHeight: 160, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={healthTrendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0052CC" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A94A6', fontWeight: 600 }} dy={10} />
                                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="value" stroke="#0052CC" strokeWidth={2.5} fill="url(#colorValue)" activeDot={{ r: 4, fill: '#0052CC', stroke: 'white', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 20, width: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: '#8A94A6', fontWeight: 600, alignItems: 'flex-end', paddingRight: 8, background: 'white' }}>
                                    <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: '0 0 32px 0' }}>Status Distribution</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1, justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0052CC" strokeWidth="4" strokeDasharray={`${tTodo} 100`} strokeDashoffset="0" />
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray={`${tInP} 100`} strokeDashoffset={`-${tTodo}`} />
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray={`${tRev} 100`} strokeDashoffset={`-${tTodo + tInP}`} />
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${tProg} 100`} strokeDashoffset={`-${tTodo + tInP + tRev}`} />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{totalTasks}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#6B778C', marginTop: 4 }}>Tasks</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 12, color: '#5E6C84', fontWeight: 600, flex: 1, minWidth: 120 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0052CC' }}/>To Do</span><span style={{ color: '#172B4D', fontWeight: 800, display: 'flex', gap: 12 }}><span>{statusCounts.TODO}</span><span style={{ color: '#8A94A6', width: 36, textAlign: 'right' }}>({Math.round(tTodo)}%)</span></span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}/>In Progress</span><span style={{ color: '#172B4D', fontWeight: 800, display: 'flex', gap: 12 }}><span>{statusCounts.IN_PROGRESS}</span><span style={{ color: '#8A94A6', width: 36, textAlign: 'right' }}>({Math.round(tInP)}%)</span></span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6' }}/>In Review</span><span style={{ color: '#172B4D', fontWeight: 800, display: 'flex', gap: 12 }}><span>{statusCounts.REVIEW}</span><span style={{ color: '#8A94A6', width: 36, textAlign: 'right' }}>({Math.round(tRev)}%)</span></span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}/>Done</span><span style={{ color: '#172B4D', fontWeight: 800, display: 'flex', gap: 12 }}><span>{statusCounts.DONE}</span><span style={{ color: '#8A94A6', width: 36, textAlign: 'right' }}>({Math.round(tProg)}%)</span></span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ROW 3: MILESTONES & VELOCITY ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                
                {/* Milestones */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: 0 }}>Milestones ({milestones.length})</h3>
                        <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all</a>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1, justifyContent: 'center' }}>
                        {milestones.map((m: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E6EFFF', color: '#0052CC', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', marginBottom: 4 }}>{m.title}</div>
                                    <div style={{ fontSize: 11, color: '#8A94A6', fontWeight: 600 }}>{m.dueDate || m.endStr}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: 160 }}>
                                    <span style={{ 
                                        color: m.status === 'DONE' ? '#006644' : (m.status === 'IN_PROGRESS' ? '#0052CC' : '#974F0C'),
                                        background: m.status === 'DONE' ? '#E3FCEF' : (m.status === 'IN_PROGRESS' ? '#E6EFFF' : '#FFF7E6'),
                                        padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, minWidth: 80, textAlign: 'center' 
                                    }}>
                                        {m.status.replace('_', ' ')}
                                    </span>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', width: 32, textAlign: 'right' }}>{m.progress || 0}%</div>
                                </div>
                                <div style={{ width: 64, height: 6, background: '#EBECF0', borderRadius: 3, flexShrink: 0 }}>
                                    <div style={{ width: `${m.progress || 0}%`, height: '100%', background: m.status === 'DONE' ? '#10B981' : '#0052CC', borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Velocity */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: 0 }}>Velocity</h3>
                        <span style={{ fontSize: 12, color: '#6B778C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Last 5 sprints <ChevronDown size={14} /></span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            42 <span style={{ fontSize: 14, color: '#8A94A6', fontWeight: 700 }}>SP</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#006644', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ background: '#E3FCEF', padding: '2px 6px', borderRadius: 4 }}>+12%</span> vs last 5 sprints
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, minHeight: 120 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={velocityData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={36}>
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: '11px', borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A94A6', fontWeight: 600 }} dy={10} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {velocityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.active ? '#0052CC' : '#E6EFFF'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* ── ROW 4: DESCRIPTION & LINKS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                
                {/* Description */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: 0 }}>Description</h3>
                        <button style={{ background: 'white', border: '1px solid #DFE1E6', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#42526E', cursor: 'pointer' }}>Edit</button>
                    </div>
                    <div style={{ fontSize: 13, color: '#42526E', lineHeight: 1.6, fontWeight: 500 }}>
                        <p style={{ margin: '0 0 16px 0' }}>This project drives the 30-day content and product execution engine for REVOTICAI.</p>
                        <p style={{ margin: 0 }}>It includes planning, content production, tool integration, team collaboration, and performance tracking to ensure successful launch and growth.</p>
                    </div>
                </div>

                {/* Key Links */}
                <div className="p-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#172B4D', margin: '0 0 16px 0' }}>Key Links</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['Product Brief', 'Execution Roadmap', 'Content Strategy Doc'].map(link => (
                            <div key={link} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }} className="hover:bg-gray-50">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 600, color: '#42526E' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 4, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ExternalLink size={14} color="#8A94A6" /></div>
                                    {link}
                                </div>
                                <ExternalLink size={14} color="#8A94A6" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
