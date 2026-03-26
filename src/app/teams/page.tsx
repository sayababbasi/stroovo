"use client";

import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Plus, Search, Users, Zap,
    AlertTriangle, MoreHorizontal, ExternalLink, ListPlus,
    MessageSquare, Activity, Network, Palette, Megaphone, BrainCircuit,
    Rocket, Code2, Database, Globe2, BarChart2,
    X, Shield, Globe, Send, CheckCircle2, Clock, FileText, FileCode, Image,
    Filter, ChevronDown
} from 'lucide-react';

/* ─── Types ─────────────────────────── */
interface TeamMember {
    name: string; role: string; status: 'Active' | 'Busy' | 'Blocked'; workload: number;
}
interface TeamTask {
    name: string; status: string; assignee: string; progress: number;
}
interface Team {
    id: string; name: string; Icon: React.ElementType; iconColor: string; status: 'Active' | 'Busy' | 'Blocked';
    members: TeamMember[]; tasks: TeamTask[]; health: number; category: string;
    blockedTasks: number; completedTasks: number;
}

/* ─── Mock Data ─────────────────────── */
const TEAMS: Team[] = [
    {
        id: 'core', name: 'Core Development', Icon: Network, iconColor: '#0052CC', status: 'Active', category: 'Engineering',
        health: 72, blockedTasks: 2, completedTasks: 24,
        members: [
            { name: 'Alex Johnson', role: 'Frontend Developer', status: 'Active', workload: 90 },
            { name: 'Sara Khan', role: 'QA Engineer', status: 'Busy', workload: 65 },
            { name: 'John Smith', role: 'Backend Developer', status: 'Blocked', workload: 55 },
            { name: 'Anna Williams', role: 'UI/UX Designer', status: 'Active', workload: 20 },
            { name: 'Adam Brown', role: 'Release Manager', status: 'Active', workload: 50 },
            { name: 'Chris Lee', role: 'Product Owner', status: 'Blocked', workload: 97 },
            { name: 'Emma Davis', role: 'DevOps Engineer', status: 'Active', workload: 40 },
            { name: 'Mike Wilson', role: 'Tech Lead', status: 'Active', workload: 75 },
        ],
        tasks: [
            { name: 'API Integration', status: 'In Progress', assignee: 'Alex Johnson', progress: 60 },
            { name: 'Fix Auth Bug', status: 'Blocked', assignee: 'Sara Khan', progress: 20 },
            { name: 'UI Redesign', status: 'Completed', assignee: 'John Smith', progress: 100 },
            { name: 'Admin Panel UI', status: 'Completed', assignee: 'Anna Williams', progress: 100 },
            { name: 'Database Optimization', status: 'Blocked', assignee: 'Adam Brown', progress: 35 },
            { name: 'CI/CD Pipeline', status: 'In Progress', assignee: 'Emma Davis', progress: 70 },
        ],
    },
    {
        id: 'design', name: 'Design Systems', Icon: Palette, iconColor: '#6554C0', status: 'Busy', category: 'Design',
        health: 47, blockedTasks: 1, completedTasks: 18,
        members: [
            { name: 'Rachel Green', role: 'Lead Designer', status: 'Busy', workload: 85 },
            { name: 'Tom Hardy', role: 'Visual Designer', status: 'Active', workload: 60 },
            { name: 'Lisa Park', role: 'UX Researcher', status: 'Active', workload: 45 },
            { name: 'Mark Chen', role: 'Motion Designer', status: 'Busy', workload: 70 },
            { name: 'Nina Patel', role: 'Design Ops', status: 'Active', workload: 30 },
        ],
        tasks: [
            { name: 'Component Library v2', status: 'In Progress', assignee: 'Rachel Green', progress: 55 },
            { name: 'Icon Set Refresh', status: 'In Progress', assignee: 'Tom Hardy', progress: 40 },
            { name: 'User Flow Audit', status: 'Blocked', assignee: 'Lisa Park', progress: 15 },
        ],
    },
    {
        id: 'marketing', name: 'Marketing Team', Icon: Megaphone, iconColor: '#FF8B00', status: 'Blocked', category: 'Marketing',
        health: 20, blockedTasks: 4, completedTasks: 12,
        members: [
            { name: 'Diana Ross', role: 'Marketing Lead', status: 'Active', workload: 50 },
            { name: 'James Bond', role: 'Content Writer', status: 'Blocked', workload: 30 },
            { name: 'Sophie Turner', role: 'SEO Specialist', status: 'Active', workload: 65 },
            { name: 'Ryan Gosling', role: 'Social Media', status: 'Busy', workload: 80 },
            { name: 'Kate Moss', role: 'Brand Designer', status: 'Active', workload: 25 },
            { name: 'Leo Messi', role: 'Analytics', status: 'Active', workload: 55 },
            { name: 'Eva Luna', role: 'PR Manager', status: 'Blocked', workload: 40 },
        ],
        tasks: [
            { name: 'Q2 Campaign Launch', status: 'Blocked', assignee: 'Diana Ross', progress: 30 },
            { name: 'Blog Redesign', status: 'In Progress', assignee: 'James Bond', progress: 60 },
            { name: 'SEO Audit', status: 'In Progress', assignee: 'Sophie Turner', progress: 45 },
        ],
    },
    {
        id: 'ai', name: 'AI Research Team', Icon: BrainCircuit, iconColor: '#36B37E', status: 'Active', category: 'Research',
        health: 90, blockedTasks: 0, completedTasks: 31,
        members: [
            { name: 'David Kim', role: 'ML Engineer', status: 'Active', workload: 70 },
            { name: 'Priya Sharma', role: 'Data Scientist', status: 'Active', workload: 55 },
            { name: 'Oscar Wilde', role: 'Research Lead', status: 'Active', workload: 45 },
            { name: 'Mei Lin', role: 'NLP Specialist', status: 'Busy', workload: 80 },
        ],
        tasks: [
            { name: 'Model Fine-tuning', status: 'In Progress', assignee: 'David Kim', progress: 75 },
            { name: 'Dataset Pipeline', status: 'Completed', assignee: 'Priya Sharma', progress: 100 },
            { name: 'Research Paper Draft', status: 'In Progress', assignee: 'Oscar Wilde', progress: 50 },
        ],
    },
];

const ACTIVITY = [
    { user: 'Alex', action: 'completed', target: 'UI Component Refactoring', time: '20 min ago' },
    { user: 'Sara', action: 'reported a bug in', target: 'Database Migration', time: '1 hour ago' },
    { user: 'Michelle', action: 'joined', target: 'the Marketing Team', time: '3 hours ago' },
    { user: 'Adam', action: 'moved', target: 'Database Optimization to In Progress', time: '3 hours ago' },
];

/* ─── Component ─────────────────────── */
export default function TeamsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [memberFilter, setMemberFilter] = useState('');
    const [memberRoleFilter, setMemberRoleFilter] = useState('All');
    const [detailMemberTab, setDetailMemberTab] = useState('All');

    const filteredTeams = useMemo(() => {
        return TEAMS.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    const totalMembers = TEAMS.reduce((a, t) => a + t.members.length, 0);
    const totalActiveTasks = TEAMS.reduce((a, t) => a + t.tasks.filter(tk => tk.status === 'In Progress').length, 0);
    const totalBlocked = TEAMS.reduce((a, t) => a + t.blockedTasks, 0);

    const getAvatarColor = (str: string) => {
        const c = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0', '#00B8D9', '#FF8B00', '#8777D9'];
        let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
        return c[Math.abs(h) % c.length];
    };
    const getInitials = (n: string) => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const getStatusColor = (s: string) => s === 'Active' ? '#36B37E' : s === 'Busy' ? '#FFAB00' : '#FF5630';
    const getHealthLabel = (h: number) => h >= 70 ? 'Good' : h >= 40 ? 'Overloaded' : 'Critical';
    const getHealthColor = (h: number) => h >= 70 ? '#36B37E' : h >= 40 ? '#FFAB00' : '#FF5630';
    const getWorkloadColor = (w: number) => w >= 80 ? '#FF5630' : w >= 50 ? '#FFAB00' : '#36B37E';

    return (
        <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
                <style>{`
                    .team-card { background: white; border-radius: 12px; border: 1px solid rgba(9,30,66,0.08); padding: 20px; transition: all 0.2s cubic-bezier(0.2,0,0,1); cursor: pointer; position: relative; }
                    .team-card:hover { border-color: rgba(0,82,204,0.25); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(9,30,66,0.08); }
                    .team-card .card-actions { display: none; }
                    .team-card:hover .card-actions { display: flex; }
                    .stat-card { background: white; border-radius: 10px; border: 1px solid rgba(9,30,66,0.08); padding: 16px 20px; flex: 1; }
                    .av { width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; font-size: 9px; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; margin-left: -8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.15s; position: relative; }
                    .av:first-child { margin-left: 0; }
                    .av:hover { transform: translateY(-3px); z-index: 10; }
                    .wb { height: 6px; background: #EBECF0; border-radius: 3px; overflow: hidden; flex: 1; }
                    .wb-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.2,0,0,1); }
                    .filter-tab { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s; }
                    .filter-tab.active { background: #0052CC; color: white; }
                    .filter-tab:not(.active) { background: transparent; color: #6B778C; }
                    .filter-tab:not(.active):hover { background: #F4F5F7; }
                    .action-btn { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; border: 1px solid #DFE1E6; background: white; color: #42526E; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s; }
                    .action-btn:hover { background: #0052CC; color: white; border-color: #0052CC; }
                    .modal-overlay { position: fixed; inset: 0; background: rgba(9,30,66,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
                    .modal-box { background: white; border-radius: 14px; width: 480px; max-width: 90vw; box-shadow: 0 16px 48px rgba(9,30,66,0.2); animation: scaleIn 0.2s cubic-bezier(0.2,0,0,1); }
                    @keyframes fadeIn { from{opacity:0}to{opacity:1} }
                    @keyframes scaleIn { from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1} }
                    .form-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #DFE1E6; font-size: 13px; outline: none; transition: all 0.2s; background: #FAFBFC; }
                    .form-input:focus { border-color: #0052CC; box-shadow: 0 0 0 3px rgba(0,82,204,0.08); background: white; }
                    .detail-panel { position: fixed; top: 0; right: 0; width: 55vw; max-width: 800px; height: 100vh; background: white; box-shadow: -8px 0 24px rgba(9,30,66,0.12); z-index: 100; display: flex; flex-direction: column; animation: slideIn 0.25s cubic-bezier(0.2,0,0,1); }
                    @keyframes slideIn { from{transform:translateX(100%)}to{transform:translateX(0)} }
                    .member-row { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(9,30,66,0.06); gap: 12px; transition: background 0.15s; }
                    .member-row:hover { background: rgba(0,82,204,0.02); margin: 0 -12px; padding: 10px 12px; border-radius: 8px; }
                    .member-row:last-child { border-bottom: none; }
                    .task-table-row { display: grid; grid-template-columns: 2fr 100px 120px 140px; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(9,30,66,0.06); font-size: 13px; }
                    .task-table-row:hover { background: rgba(0,82,204,0.02); }
                `}</style>

                {/* ─── Header ─────────────────── */}
                <div style={{ padding: '24px 32px 16px', background: 'white', borderBottom: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: '#E6EFFF', padding: '8px', borderRadius: '8px', color: '#0052CC' }}><Users size={20} /></div>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D' }}>Teams</h1>
                        </div>
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,82,204,0.2)' }}>
                            <Plus size={16} /> Create Team
                        </button>
                    </div>
                    {/* Search */}
                    <div style={{ position: 'relative', maxWidth: '440px', marginBottom: '16px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                        <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="Search teams..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    {/* Filter Tabs + Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {['All', 'Active', 'Busy', 'Blocked'].map(f => (
                                <button key={f} className={`filter-tab ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)}>{f}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontWeight: 500, color: '#42526E' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} color="#0052CC" /> {totalMembers} Members</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} color="#FF8B00" /> {totalActiveTasks} Active Tasks</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} color="#FF5630" /> {totalBlocked} Blocked</span>
                        </div>
                    </div>
                </div>

                {/* ─── Content ────────────────── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                    {/* Team Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {filteredTeams.map(team => {
                            const isExpanded = expandedTeam === team.id;
                            return (
                                <div key={team.id} className="team-card" onClick={() => setSelectedTeam(team)}>
                                    {/* Top: Name + Status */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${team.iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <team.Icon size={18} color={team.iconColor} />
                                            </div>
                                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D' }}>{team.name}</h3>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: getStatusColor(team.status), display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(team.status) }} />
                                                {team.status}
                                            </span>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: '2px' }} onClick={e => { e.stopPropagation(); }}>
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Meta */}
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B778C', marginBottom: '12px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={11} /> {team.members.length} Members</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={11} /> {team.tasks.filter(t => t.status !== 'Completed').length} Tasks</span>
                                    </div>
                                    {/* Avatars */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                        {team.members.slice(0, 4).map((m, i) => (
                                            <div key={i} className="av" style={{ background: getAvatarColor(m.name), zIndex: 5 - i }} title={m.name}>{getInitials(m.name)}</div>
                                        ))}
                                        {team.members.length > 4 && <div className="av" style={{ background: '#42526E', zIndex: 0 }}>+{team.members.length - 4}</div>}
                                    </div>
                                    {/* Workload Bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <div className="wb">
                                            <div className="wb-fill" style={{ width: `${team.health}%`, background: getHealthColor(team.health) }} />
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: getHealthColor(team.health) }}>{team.health}%</span>
                                    </div>
                                    {/* Health Indicator */}
                                    <div style={{ fontSize: '11px', color: getHealthColor(team.health), fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                                        {team.health >= 70 ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                                        Health: <strong>{team.health}%</strong> {getHealthLabel(team.health)}
                                        {team.blockedTasks > 0 && <span style={{ color: '#6B778C', marginLeft: '4px' }}>• {team.blockedTasks} blocked</span>}
                                    </div>
                                    {/* Quick Actions */}
                                    <div className="card-actions" style={{ gap: '6px', position: 'absolute', bottom: '16px', right: '16px' }}>
                                        <button className="action-btn" onClick={e => { e.stopPropagation(); setSelectedTeam(team); }}><ExternalLink size={10} /> Open Team</button>
                                        <button className="action-btn" onClick={e => { e.stopPropagation(); setShowAssignModal(true); }}><ListPlus size={10} /> Assign Task</button>
                                        <button className="action-btn"><MessageSquare size={10} /> Message</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ─── Recent Activity ────────── */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(9,30,66,0.08)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D' }}>Recent Activity</h3>
                            <MoreHorizontal size={14} color="#6B778C" style={{ cursor: 'pointer' }} />
                        </div>
                        {ACTIVITY.map((a, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(9,30,66,0.06)' : 'none' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getAvatarColor(a.user), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>{a.user[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '13px', color: '#42526E' }}><strong style={{ color: '#172B4D' }}>{a.user}</strong> {a.action} <span style={{ color: '#0052CC', fontWeight: 500 }}>{a.target}</span></p>
                                    <span style={{ fontSize: '11px', color: '#8A94A6' }}>{a.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Create Team Button (Fixed) */}
                <div style={{ padding: '12px 32px', borderTop: '1px solid #DFE1E6', background: 'white' }}>
                    <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0052CC', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        <Plus size={14} /> Create Team
                    </button>
                </div>
            </div>

            {/* ═══ TEAM DETAIL PANEL ═══ */}
            {selectedTeam && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.3)', zIndex: 99 }} onClick={() => setSelectedTeam(null)} />
                    <div className="detail-panel">
                        {/* Detail Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <button onClick={() => setSelectedTeam(null)} style={{ background: '#F4F5F7', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#6B778C' }}><X size={16} /></button>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${selectedTeam.iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <selectedTeam.Icon size={22} color={selectedTeam.iconColor} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D' }}>{selectedTeam.name}</h2>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>
                                        <span><Users size={11} /> {selectedTeam.members.length} Members</span>
                                        <span><Zap size={11} /> {selectedTeam.tasks.length} Tasks</span>
                                        <span style={{ color: getStatusColor(selectedTeam.status), fontWeight: 600 }}>● {selectedTeam.status}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Sprint Progress */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '11px', color: '#6B778C', fontWeight: 500 }}>Sprint Progress</span>
                                <div className="wb" style={{ flex: 1 }}><div className="wb-fill" style={{ width: `${selectedTeam.health}%`, background: '#0052CC' }} /></div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC' }}>{selectedTeam.health}%</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="action-btn" onClick={() => setShowAssignModal(true)}><ListPlus size={12} /> Assign Task</button>
                                <button className="action-btn"><Send size={12} /> Invite Member</button>
                                <button className="action-btn"><Users size={12} /> Join Team</button>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
                            {/* ─ Left Column ─ */}
                            <div style={{ flex: 6, padding: '20px 24px', borderRight: '1px solid #DFE1E6', overflowY: 'auto' }}>
                                {/* Stat Cards */}
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                    {[
                                        { label: 'Total', value: selectedTeam.members.length, icon: Users, color: '#0052CC' },
                                        { label: 'Active', value: selectedTeam.tasks.filter(t => t.status === 'In Progress').length, icon: Zap, color: '#FF8B00' },
                                        { label: 'Completed', value: selectedTeam.completedTasks, icon: CheckCircle2, color: '#36B37E' },
                                        { label: 'Blocked', value: selectedTeam.blockedTasks, icon: AlertTriangle, color: '#FF5630' },
                                    ].map(s => (
                                        <div key={s.label} className="stat-card">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                <s.icon size={12} color={s.color} />
                                                <span style={{ fontSize: '11px', color: '#6B778C', fontWeight: 500 }}>{s.label}</span>
                                            </div>
                                            <span style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D' }}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Members */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {['All', 'Active', 'Busy', 'Blocked'].map(f => (
                                                <button key={f} className={`filter-tab ${detailMemberTab === f ? 'active' : ''}`} onClick={() => setDetailMemberTab(f)} style={{ fontSize: '11px', padding: '4px 10px' }}>{f}</button>
                                            ))}
                                        </div>
                                        <div style={{ position: 'relative', width: '180px' }}>
                                            <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                                            <input className="form-input" style={{ paddingLeft: '28px', fontSize: '11px', padding: '5px 10px 5px 28px' }} placeholder="Search members..." value={memberFilter} onChange={e => setMemberFilter(e.target.value)} />
                                        </div>
                                    </div>
                                    {selectedTeam.members
                                        .filter(m => (detailMemberTab === 'All' || m.status === detailMemberTab) && m.name.toLowerCase().includes(memberFilter.toLowerCase()))
                                        .map((m, i) => (
                                            <div key={i} className="member-row">
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: getAvatarColor(m.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, position: 'relative', flexShrink: 0 }}>
                                                    {getInitials(m.name)}
                                                    <span style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderRadius: '50%', background: getStatusColor(m.status), border: '1.5px solid white' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{m.name}</span>
                                                    <div style={{ fontSize: '11px', color: '#6B778C' }}>{m.role}</div>
                                                </div>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color: getStatusColor(m.status) }}>● {m.status}</span>
                                                <div className="wb" style={{ maxWidth: '80px' }}>
                                                    <div className="wb-fill" style={{ width: `${m.workload}%`, background: getWorkloadColor(m.workload) }} />
                                                </div>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: getWorkloadColor(m.workload), minWidth: '30px', textAlign: 'right' }}>{m.workload}%</span>
                                            </div>
                                        ))}
                                </div>

                                {/* Tasks Table */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '12px' }}>Team Tasks</h4>
                                    <div className="task-table-row" style={{ fontSize: '10px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', borderBottom: '1px solid #DFE1E6' }}>
                                        <div>Task</div><div>Status</div><div>Assignee</div><div>Progress</div>
                                    </div>
                                    {selectedTeam.tasks.map((t, i) => (
                                        <div key={i} className="task-table-row">
                                            <div style={{ fontWeight: 500, color: '#172B4D' }}>● {t.name}</div>
                                            <div><span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: t.status === 'Completed' ? '#E3FCEF' : t.status === 'Blocked' ? '#FFEBE6' : '#E6EFFF', color: t.status === 'Completed' ? '#006644' : t.status === 'Blocked' ? '#BF2600' : '#0052CC' }}>{t.status}</span></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: getAvatarColor(t.assignee), color: 'white', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getInitials(t.assignee)}</div>
                                                <span style={{ fontSize: '12px', color: '#42526E' }}>{t.assignee.split(' ')[0]}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div className="wb" style={{ maxWidth: '80px' }}>
                                                    <div className="wb-fill" style={{ width: `${t.progress}%`, background: t.status === 'Completed' ? '#36B37E' : t.status === 'Blocked' ? '#FF5630' : '#0052CC' }} />
                                                </div>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: t.status === 'Completed' ? '#36B37E' : '#42526E' }}>{t.progress}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Activity */}
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '12px' }}>Recent Activity</h4>
                                    {ACTIVITY.slice(0, 4).map((a, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(9,30,66,0.06)' : 'none', alignItems: 'center' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: getAvatarColor(a.user), color: 'white', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{a.user[0]}</div>
                                            <p style={{ fontSize: '12px', color: '#42526E', flex: 1 }}><strong style={{ color: '#172B4D' }}>{a.user}</strong> {a.action} <span style={{ color: '#0052CC' }}>{a.target}</span></p>
                                            <span style={{ fontSize: '10px', color: '#8A94A6', whiteSpace: 'nowrap' }}>{a.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ─ Right Column ─ */}
                            <div style={{ flex: 4, padding: '20px', background: '#FAFBFC', overflowY: 'auto' }}>
                                {/* Workload Distribution */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workload Distribution</h4>
                                        <MoreHorizontal size={12} color="#6B778C" />
                                    </div>
                                    {selectedTeam.members.map((m, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                                            <span style={{ fontSize: '11px', color: '#42526E', fontWeight: 500, minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name.split(' ')[0]}</span>
                                            <div className="wb" style={{ flex: 1 }}><div className="wb-fill" style={{ width: `${m.workload}%`, background: getWorkloadColor(m.workload) }} /></div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: getWorkloadColor(m.workload), minWidth: '32px', textAlign: 'right' }}>{m.workload}%</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Sprint Card */}
                                <div style={{ background: 'white', borderRadius: '10px', border: '1px solid rgba(9,30,66,0.08)', padding: '16px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>Sprint</h4>
                                        <MoreHorizontal size={12} color="#6B778C" />
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#42526E', marginBottom: '10px' }}>Refactor API and improve frontend UX</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div className="wb" style={{ flex: 1 }}><div className="wb-fill" style={{ width: '65%', background: '#FF5630' }} /></div>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#172B4D' }}>65%</span>
                                        <span style={{ fontSize: '10px', color: '#6B778C' }}>End May 28</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6B778C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={10} /> Ends May 28, 2024
                                    </div>
                                </div>

                                {/* Attached Files */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attached Files</h4>
                                        <MoreHorizontal size={12} color="#6B778C" />
                                    </div>
                                    {[
                                        { Icon: FileCode, color: '#0052CC', name: 'database_schema.sql', time: 'Yesterday' },
                                        { Icon: FileText, color: '#6554C0', name: 'frontend_refactor.sketch', time: '2 days ago' },
                                        { Icon: Image, color: '#36B37E', name: 'dark_mode_toggle_icon.png', time: '4 days ago' },
                                    ].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(9,30,66,0.06)' : 'none' }}>
                                            <f.Icon size={14} color={f.color} />
                                            <div style={{ flex: 1 }}>
                                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#172B4D' }}>{f.name}</span>
                                            </div>
                                            <span style={{ fontSize: '10px', color: '#8A94A6' }}>{f.time}</span>
                                        </div>
                                    ))}
                                    <button style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '6px', border: '1px dashed #DFE1E6', background: 'transparent', fontSize: '11px', fontWeight: 500, color: '#0052CC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>
                                        + Upload File
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ CREATE TEAM MODAL ═══ */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D' }}>Create Team</h3>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: '#F4F5F7', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#6B778C' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E', display: 'block', marginBottom: '6px' }}>Team Name</label>
                                <input className="form-input" placeholder="e.g. Core Development" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E', display: 'block', marginBottom: '6px' }}>Icon</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[
                                        { I: Network, c: '#0052CC' }, { I: Palette, c: '#6554C0' }, { I: Megaphone, c: '#FF8B00' },
                                        { I: BrainCircuit, c: '#36B37E' }, { I: Rocket, c: '#FF5630' }, { I: Code2, c: '#00B8D9' },
                                        { I: BarChart2, c: '#FFAB00' }, { I: Database, c: '#42526E' },
                                    ].map(({ I, c }, idx) => (
                                        <button key={idx} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #DFE1E6', background: `${c}12`, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <I size={16} color={c} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E', display: 'block', marginBottom: '6px' }}>Description</label>
                                <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} placeholder="What does this team do?" />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E', display: 'block', marginBottom: '8px' }}>Privacy</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {[{ label: 'Public', icon: Globe, desc: 'Anyone can join' }, { label: 'Private', icon: Shield, desc: 'Invite only' }].map(p => (
                                        <div key={p.label} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #DFE1E6', cursor: 'pointer', transition: 'all 0.15s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <p.icon size={14} color="#0052CC" />
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{p.label}</span>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#6B778C' }}>{p.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                                Create Team
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ ASSIGN TASK MODAL ═══ */}
            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D' }}>Assign Task</h3>
                            <button onClick={() => setShowAssignModal(false)} style={{ background: '#F4F5F7', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#6B778C' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E', display: 'block', marginBottom: '6px' }}>Task Name</label>
                                <input className="form-input" placeholder="Enter task name..." />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E', display: 'block', marginBottom: '6px' }}>Assign To</label>
                                <select className="form-input" style={{ appearance: 'none', paddingRight: '28px', backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%236B778C\' viewBox=\'0 0 24 24\'><path d=\'M7 10l5 5 5-5z\'/></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                                    <option>Select member...</option>
                                    {selectedTeam?.members.map(m => <option key={m.name}>{m.name}</option>)}
                                    {!selectedTeam && TEAMS[0].members.map(m => <option key={m.name}>{m.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E', display: 'block', marginBottom: '6px' }}>Priority</label>
                                    <select className="form-input" style={{ appearance: 'none', paddingRight: '28px', backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%236B778C\' viewBox=\'0 0 24 24\'><path d=\'M7 10l5 5 5-5z\'/></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                                        <option>High</option><option>Medium</option><option>Low</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E', display: 'block', marginBottom: '6px' }}>Deadline</label>
                                    <input className="form-input" type="date" />
                                </div>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
