"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Search, SlidersHorizontal, ChevronDown, ChevronRight, ChevronLeft,
    CheckCircle2, FileText, MessageSquare, Calendar, Folder, Hash,
    MoreHorizontal, Filter, Save, File, Image as ImageIcon, AtSign,
    TrendingUp, ExternalLink, CornerUpRight, Paperclip, CheckSquare, List
} from 'lucide-react';

/* ─── Mock Data ─────────────────────── */
const ACTIVITIES = [
    {
        id: 'streak-1', type: 'streak', user: 'Alex Johnson', time: '1 hour', count: 4, action: 'completed', entity: 'tasks',
        items: [
            { icon: CheckCircle2, text: 'Created Sprint Review', color: '#0052CC' },
            { icon: FileText, text: 'Updated Type Validation Logic', color: '#0052CC' },
            { icon: File, text: 'Imported API Documentation.md', color: '#0052CC' },
            { icon: CheckSquare, text: 'Pushed UI Changes', color: '#0052CC' },
        ],
    },
    {
        id: 'a1', type: 'file_upload', user: 'Corey Stein', time: '24 minutes ago', project: 'Quantum UI Redesign', action: 'uploaded',
        file: { name: 'Dashboard Mockup.png', type: 'img', size: '3.2 MB' }
    },
    {
        id: 'a2', type: 'task_move', user: 'Anna Williams', time: '1 hour ago', project: 'Database Migration', action: 'moved',
        task: { name: 'Sprint Review', from: 'In Progress', to: 'Completed', color: '#36B37E' }
    },
    {
        id: 'a3', type: 'mention', user: 'Chris Lee', time: '1 hr ago',
        content: <><span style={{fontWeight:600}}>@Revotic AI CEO</span> We should align on the next steps for the <b>Database Migration</b> project. Let's set up a meeting to discuss. 🤝</>,
        replies: 5
    },
    {
        id: 'a4', type: 'file_upload', user: 'Adam Brown', time: '2 hours ago', project: 'Database Migration', action: 'uploaded',
        file: { name: 'Database Schema.sql', type: 'code', size: '14 KB' }
    },
    {
        id: 'a5', type: 'task_assign', user: 'Patrick', time: '3 hours ago', project: 'Filter API Update', action: 'assigned',
        task: { name: 'Create API Endpoints', assignee: 'Alex Johnson', color: '#36B37E', status: 'In Progress' }
    },
    {
        id: 'a6', type: 'comment', user: 'Michelle', time: '5 hours ago', action: 'commented on', target: 'Design System.fig',
        content: 'Uploading the updated version now 🚀', replies: 4, attached: true
    }
];

const PROJECTS = [
    { name: 'Quantum UI Redesign', checked: false },
    { name: 'Database Migration', checked: true },
    { name: 'Mobile App v2', checked: true },
    { name: 'Mobile Website', checked: false },
];

const ACTIVITY_TYPES = [
    { name: 'Tasks', checked: true },
    { name: 'Comments', checked: true },
    { name: 'Files', checked: true },
    { name: 'Calendar Events', checked: false },
];

/* ─── Helpers ────────────────────────── */
const getAC = (s: string) => {
    const c = ['#0052CC','#36B37E','#FF5630','#FFAB00','#6554C0','#00B8D9'];
    let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
    return c[Math.abs(h) % c.length];
};
const getInit = (n: string) => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

/* ─── Components ─────────────────────── */
function Avatar({ name, size = 36, showOnline = true }: { name: string, size?: number, showOnline?: boolean }) {
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: getAC(name), color: 'white', fontSize: size*0.4, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getInit(name)}</div>
            {showOnline && <div style={{ position: 'absolute', bottom: -1, right: -1, width: size*0.28, height: size*0.28, borderRadius: '50%', background: '#36B37E', border: '2px solid white' }} />}
        </div>
    );
}

export default function ActivityCenterPage() {
    const [activeTab, setActiveTab] = useState('All');
    const [viewMode, setViewMode] = useState<'Feed'|'Table'>('Feed');

    return (
        <main style={{ display: 'flex', minHeight: '100vh', background: '#FAFBFC' }}>
            <Sidebar />
            
            <style>{`
                .tab-btn { padding:6px 14px; border-radius:6px; font-size:13px; font-weight:600; border:none; cursor:pointer; transition:all 0.15s; color:#42526E; background:transparent; }
                .tab-btn.a { background:#0052CC; color:white; }
                .tab-btn:not(.a):hover { background:#F4F5F7; }
                
                .vm-btn { padding:6px 16px; font-size:13px; font-weight:600; cursor:pointer; background:transparent; border:none; color:#6B778C; transition:all 0.1s; }
                .vm-btn.a { background:#0052CC; color:white; }
                
                .act-card { padding:20px 24px; border-bottom:1px solid #DFE1E6; background:white; position:relative; }
                .act-card:hover { background:#FAFBFC; }
                .act-actions { display:none; position:absolute; right:20px; top:20px; }
                .act-card:hover .act-actions { display:block; }
                
                .c-btn { background:none; border:none; padding:6px; border-radius:6px; cursor:pointer; color:#6B778C; }
                .c-btn:hover { background:#F4F5F7; color:#172B4D; }

                .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:6px; text-align:center; font-size:12px; }
                .cal-day { padding:6px 0; border-radius:6px; cursor:pointer; color:#172B4D; }
                .cal-day.out { color:#C1C7D0; }
                .cal-day:hover:not(.sel) { background:#F4F5F7; }
                .cal-day.sel { background:#0052CC; color:white; font-weight:700; }
                .cal-day.wk { color:#6B778C; font-weight:600; font-size:11px; margin-bottom:4px; }
            `}</style>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: '240px' }}>
                {/* Header */}
                <div style={{ padding: '24px 32px 16px', background: 'white', borderBottom: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D', marginBottom: '4px' }}>Activity Center</h1>
                            <p style={{ fontSize: '13px', color: '#6B778C' }}>Track everything across your workspace</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative', width: '320px' }}>
                                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                                <input placeholder="Search activity..." style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #DFE1E6', background: '#FAFBFC', fontSize: '13px', outline: 'none' }} />
                            </div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,82,204,0.2)' }}>
                                <FileText size={15} /> Export
                            </button>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {['All', 'Mentions @', 'Tasks Only', 'Files Only'].map(t => (
                                <button key={t} className={`tab-btn ${activeTab === t ? 'a' : ''}`} onClick={() => setActiveTab(t)}>
                                    {t} {t !== 'All' && <ChevronDown size={14} style={{ marginLeft: 4, display: 'inline-block', verticalAlign: 'middle' }} />}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DFE1E6', borderRadius: '8px', overflow: 'hidden' }}>
                            <button className={`vm-btn ${viewMode === 'Feed' ? 'a' : ''}`} onClick={() => setViewMode('Feed')}>Feed</button>
                            <button className={`vm-btn ${viewMode === 'Table' ? 'a' : ''}`} style={{ borderLeft: '1px solid #DFE1E6' }} onClick={() => setViewMode('Table')}><List size={14} style={{ marginRight:5, verticalAlign:'middle' }}/> Table</button>
                        </div>
                    </div>
                </div>

                {/* Main Feed Content */}
                <div style={{ flex: 1, display: 'flex' }}>
                    {/* Activity Feed */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {ACTIVITIES.map((act) => (
                            <div key={act.id} className="act-card">
                                <div className="act-actions"><button className="c-btn"><MoreHorizontal size={14} /></button></div>
                                
                                {act.type === 'streak' && (
                                    <div style={{ background: '#F0F5FF', border: '1px solid #DEEBFF', borderRadius: '12px', padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                            <Avatar name={act.user} size={48} />
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>🔥 Nice streak!</div>
                                                <div style={{ fontSize: '15px', color: '#172B4D' }}>
                                                    <span style={{ fontWeight: 700 }}>{act.user}</span> {act.action} <span style={{ fontWeight: 700 }}>{act.count} {act.entity}</span> in {act.time}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '64px' }}>
                                            {act.items?.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#42526E' }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '6px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(9,30,66,0.08)' }}>
                                                        <item.icon size={13} color={item.color} />
                                                    </div>
                                                    {item.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {act.type === 'file_upload' && act.file && (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <Avatar name={act.user} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '14px', color: '#42526E' }}>
                                                    <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.user}</span> {act.action}{' '}
                                                    <span style={{ fontWeight: 600, color: '#172B4D' }}>{act.file.name}</span> to <span style={{ fontWeight: 600 }}>{act.project}</span>
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#8A94A6' }}>{act.time}</span>
                                            </div>
                                            <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: '1px solid #DFE1E6', borderRadius: '8px', background: '#FAFBFC', cursor: 'pointer' }}>
                                                <div style={{ width: 32, height: 32, background: act.file.type==='img'?'#E3FCEF':'#EAE6FF', color: act.file.type==='img'?'#36B37E':'#6554C0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{act.file.type==='img'?'IMG':'SQL'}</div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{act.file.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#6B778C' }}>{act.file.size} • <span style={{ color: '#0052CC', cursor: 'pointer' }}>Preview</span></div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                                                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '12px', fontWeight: 600, color: '#6B778C', cursor: 'pointer' }}><MessageSquare size={13} /> Reply</button>
                                                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '12px', fontWeight: 600, color: '#6B778C', cursor: 'pointer' }}><CheckCircle2 size={13} /> Mark Unread</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {act.type === 'task_move' && act.task && (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <Avatar name={act.user} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '14px', color: '#42526E' }}>
                                                    <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.user}</span> {act.action} <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.task.name}</span> to <span style={{ fontWeight: 600, color: act.task.color }}>{act.task.to}</span>
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#8A94A6' }}>{act.time}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B778C' }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0052CC' }} /> {act.project}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {act.type === 'mention' && (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <Avatar name={act.user} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '14px', color: '#42526E' }}>
                                                    <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.user}</span> mentioned <span style={{ fontWeight: 700, color: '#0052CC' }}>@Revotic AI CEO</span>
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#8A94A6' }}>{act.time}</span>
                                            </div>
                                            <div style={{ marginTop: '8px', padding: '12px 16px', background: '#F8FAFF', border: '1px solid rgba(0,82,204,0.15)', borderRadius: '8px', fontSize: '14px', color: '#172B4D', lineHeight: 1.5 }}>
                                                {act.content}
                                            </div>
                                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F4F5F7', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#42526E' }}>
                                                    <MessageSquare size={13} /> {act.replies} replies
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {act.type === 'task_assign' && act.task && (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <Avatar name={act.user} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '14px', color: '#42526E' }}>
                                                    <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.user}</span> assigned <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.task.name}</span> to <span style={{ fontWeight: 600, color: '#0052CC' }}>{act.task.assignee}</span>
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#8A94A6' }}>{act.time}</span>
                                            </div>
                                            <div style={{ border: '1px solid #DFE1E6', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <Avatar name={act.task.assignee} size={28} showOnline={false} />
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{act.task.name}</div>
                                                        <div style={{ fontSize: '11px', color: '#6B778C' }}>Project: {act.project}</div>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '11px', fontWeight: 600, background: '#E3FCEF', color: '#36B37E', padding: '2px 8px', borderRadius: '12px' }}>{act.task.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {act.type === 'comment' && (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <Avatar name={act.user} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '14px', color: '#42526E' }}>
                                                    <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.user}</span> {act.action} <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.target}</span>
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#8A94A6' }}>{act.time}</span>
                                            </div>
                                            
                                            <div style={{ borderLeft: '2px solid #DFE1E6', paddingLeft: '16px', marginLeft: '4px' }}>
                                                <div style={{ fontSize: '14px', color: '#172B4D', marginBottom: '12px' }}>{act.content}</div>
                                                {act.attached && (
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: '6px' }}>
                                                        <div style={{ width: 24, height: 24, background: '#E6EFFF', color: '#0052CC', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>F</div>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>Design System.fig</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ))}
                        
                        <div style={{ padding: '24px', textAlign: 'center', color: '#8A94A6', fontSize: '13px' }}>
                            You've caught up on all recent activity.
                        </div>
                    </div>

                    {/* Right Filter Panel */}
                    <div style={{ width: '320px', background: 'white', borderLeft: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>Filter Activity</span>
                            <ChevronDown size={14} color="#6B778C" />
                        </div>

                        <div style={{ padding: '24px' }}>
                            {/* Calendar Mock */}
                            <div style={{ border: '1px solid #DFE1E6', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(9,30,66,0.04)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 600, color: '#172B4D', fontSize: '14px' }}>
                                    <ChevronLeft size={16} /><span style={{ flex: 1, textAlign: 'center' }}>April 2024</span><ChevronRight size={16} />
                                </div>
                                <div className="cal-grid">
                                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="cal-day wk">{d}</div>)}
                                    {[25,26,27,28,29,30].map(d => <div key={`p${d}`} className="cal-day out">{d}</div>)}
                                    {[1,2,3,4,5,6,7].map(d => <div key={`c1${d}`} className={`cal-day ${d===7?'sel':''}`}>{d}</div>)}
                                    {[8,9,10,11,12,13,14].map(d => <div key={`c2${d}`} className="cal-day">{d}</div>)}
                                    {[15,16,17,18,19,20,21].map(d => <div key={`c3${d}`} className="cal-day">{d}</div>)}
                                </div>
                                <button style={{ width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0052CC', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    + RECENT EVENTS
                                </button>
                            </div>

                            {/* Projects Filter */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Folder size={12} /> PROJECTS</span>
                                    <ChevronDown size={12} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {PROJECTS.map((p, i) => (
                                        <label key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px', color: '#172B4D' }}>
                                            {p.name}
                                            <input type="checkbox" defaultChecked={p.checked} style={{ accentColor: '#0052CC', width: 14, height: 14 }} />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Types Filter */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><SlidersHorizontal size={12} /> ACTIVITY TYPES</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {ACTIVITY_TYPES.map((t, i) => (
                                        <label key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px', color: '#172B4D' }}>
                                            {t.name}
                                            <input type="checkbox" defaultChecked={t.checked} style={{ accentColor: '#0052CC', width: 14, height: 14 }} />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Saved Filters */}
                            <div style={{ borderTop: '1px solid #DFE1E6', paddingTop: '20px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={12} /> SAVED FILTERS</span>
                                    <ChevronDown size={12} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#F8FAFF', border: '1px solid rgba(0,82,204,0.2)', borderRadius: '6px', cursor: 'pointer', color: '#0052CC', fontSize: '13px', fontWeight: 600 }}>
                                        All Activity <ChevronRight size={14} />
                                    </button>
                                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'transparent', border: '1px solid transparent', borderRadius: '6px', cursor: 'pointer', color: '#42526E', fontSize: '13px', fontWeight: 500 }}>
                                        My Activity <ChevronRight size={14} color="#C1C7D0" />
                                    </button>
                                </div>
                                
                                <button style={{ width: '100%', padding: '10px', marginTop: '16px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#172B4D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(9,30,66,0.05)' }}>
                                    <Save size={14} color="#6B778C" /> Save Filter
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
