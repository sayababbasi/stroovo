"use client";

import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Search, Users, Zap, AlertTriangle, MoreHorizontal, Send,
    CheckCircle2, Clock, Shield, UserPlus, Settings,
    X, ListPlus, MessageSquare, Activity, Network,
    FileCode, FileText, Image as ImageIcon, Mail, Phone,
    Star, TrendingUp, Target, Calendar, ChevronRight
} from 'lucide-react';

/* ─── Types ─────────────────────────── */
interface TeamMember {
    name: string;
    role: string;
    email: string;
    status: 'Active' | 'Busy' | 'Away' | 'Offline';
    workload: number;
    tasksCompleted: number;
    tasksActive: number;
    avatar?: string;
}

interface TeamTask {
    name: string;
    status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
    assignee: string;
    priority: 'High' | 'Medium' | 'Low';
    progress: number;
    dueDate: string;
}

/* ─── Mock Data ─────────────────────── */
const MY_TEAM = {
    name: 'Revotic AI',
    description: 'Core product team building the next generation of workflow management tools',
    status: 'Active' as const,
    sprint: 'Sprint 14 — Q1 2026',
    sprintProgress: 68,
    sprintEnd: 'Apr 2, 2026',
    health: 82,
    totalTasks: 47,
    completedTasks: 32,
    blockedTasks: 2,
};

const MEMBERS: TeamMember[] = [
    { name: 'Sayab Ali', role: 'Chief Executive Officer', email: 'sayab@revotic.ai', status: 'Active', workload: 75, tasksCompleted: 24, tasksActive: 5 },
    { name: 'Alex Johnson', role: 'Frontend Developer', email: 'alex@revotic.ai', status: 'Active', workload: 90, tasksCompleted: 18, tasksActive: 4 },
    { name: 'Sara Khan', role: 'Backend Developer', email: 'sara@revotic.ai', status: 'Busy', workload: 65, tasksCompleted: 21, tasksActive: 3 },
    { name: 'David Kim', role: 'ML Engineer', email: 'david@revotic.ai', status: 'Active', workload: 55, tasksCompleted: 15, tasksActive: 2 },
    { name: 'Anna Williams', role: 'UI/UX Designer', email: 'anna@revotic.ai', status: 'Away', workload: 20, tasksCompleted: 12, tasksActive: 1 },
    { name: 'Chris Lee', role: 'DevOps Engineer', email: 'chris@revotic.ai', status: 'Active', workload: 45, tasksCompleted: 19, tasksActive: 3 },
    { name: 'Priya Sharma', role: 'QA Engineer', email: 'priya@revotic.ai', status: 'Active', workload: 60, tasksCompleted: 16, tasksActive: 2 },
    { name: 'Mike Wilson', role: 'Product Manager', email: 'mike@revotic.ai', status: 'Busy', workload: 80, tasksCompleted: 22, tasksActive: 4 },
];

const TASKS: TeamTask[] = [
    { name: 'Kanban Board Full-Screen Layout', status: 'Completed', assignee: 'Alex Johnson', priority: 'High', progress: 100, dueDate: 'Mar 26' },
    { name: 'AI Workflow Suggestions Engine', status: 'In Progress', assignee: 'David Kim', priority: 'High', progress: 65, dueDate: 'Apr 1' },
    { name: 'Team Analytics Dashboard', status: 'In Progress', assignee: 'Sara Khan', priority: 'Medium', progress: 40, dueDate: 'Mar 30' },
    { name: 'Design System v2 Components', status: 'In Review', assignee: 'Anna Williams', priority: 'Medium', progress: 85, dueDate: 'Mar 28' },
    { name: 'CI/CD Pipeline Optimization', status: 'In Progress', assignee: 'Chris Lee', priority: 'Low', progress: 55, dueDate: 'Apr 3' },
    { name: 'API Performance Testing Suite', status: 'To Do', assignee: 'Priya Sharma', priority: 'Medium', progress: 0, dueDate: 'Apr 5' },
    { name: 'Sprint Planning Automation', status: 'Blocked', assignee: 'Mike Wilson', priority: 'High', progress: 30, dueDate: 'Mar 29' },
    { name: 'User Onboarding Flow Redesign', status: 'In Progress', assignee: 'Sayab Ali', priority: 'High', progress: 50, dueDate: 'Apr 2' },
];

const ACTIVITY = [
    { user: 'Alex', action: 'completed', target: 'Kanban Board Full-Screen Layout', time: '10 min ago', type: 'complete' },
    { user: 'David', action: 'pushed code to', target: 'AI Workflow Engine', time: '25 min ago', type: 'code' },
    { user: 'Anna', action: 'submitted for review', target: 'Design System v2', time: '1 hour ago', type: 'review' },
    { user: 'Sayab', action: 'created sprint', target: 'Sprint 14', time: '2 hours ago', type: 'create' },
    { user: 'Sara', action: 'fixed bug in', target: 'Analytics API', time: '3 hours ago', type: 'fix' },
    { user: 'Chris', action: 'deployed', target: 'Staging Environment', time: '4 hours ago', type: 'deploy' },
];

/* ─── Component ─────────────────────── */
export default function MyTeamPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [memberTab, setMemberTab] = useState('All');
    const [taskTab, setTaskTab] = useState('All');
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    const filteredMembers = useMemo(() => {
        return MEMBERS.filter(m => {
            const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.role.toLowerCase().includes(searchQuery.toLowerCase());
            const matchTab = memberTab === 'All' || m.status === memberTab;
            return matchSearch && matchTab;
        });
    }, [searchQuery, memberTab]);

    const filteredTasks = useMemo(() => {
        if (taskTab === 'All') return TASKS;
        return TASKS.filter(t => t.status === taskTab);
    }, [taskTab]);

    const getAvatarColor = (str: string) => {
        const c = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0', '#00B8D9', '#FF8B00', '#8777D9'];
        let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
        return c[Math.abs(h) % c.length];
    };
    const getInitials = (n: string) => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const getStatusColor = (s: string) => s === 'Active' ? '#36B37E' : s === 'Busy' ? '#FFAB00' : s === 'Away' ? '#8993A4' : '#DFE1E6';
    const getWorkloadColor = (w: number) => w >= 80 ? '#FF5630' : w >= 50 ? '#FFAB00' : '#36B37E';
    const getPriorityColor = (p: string) => p === 'High' ? '#FF5630' : p === 'Medium' ? '#FFAB00' : '#36B37E';
    const getTaskStatusColor = (s: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            'Completed': { bg: '#E3FCEF', color: '#006644' },
            'In Progress': { bg: '#DEEBFF', color: '#0052CC' },
            'In Review': { bg: '#EAE6FF', color: '#5243AA' },
            'To Do': { bg: '#F4F5F7', color: '#42526E' },
            'Blocked': { bg: '#FFEBE6', color: '#BF2600' },
        };
        return map[s] || { bg: '#F4F5F7', color: '#42526E' };
    };

    const activeMembers = MEMBERS.filter(m => m.status === 'Active').length;
    const avgWorkload = Math.round(MEMBERS.reduce((a, m) => a + m.workload, 0) / MEMBERS.length);

    return (
        <main style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8F9FA' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <style>{`
                    body { overflow: hidden !important; margin: 0; }
                    .mt-card { background: white; border-radius: 12px; border: 1px solid rgba(9,30,66,0.08); transition: all 0.2s cubic-bezier(0.2,0,0,1); }
                    .mt-card:hover { border-color: rgba(0,82,204,0.2); box-shadow: 0 4px 16px rgba(9,30,66,0.06); }
                    .mt-stat { background: white; border-radius: 10px; border: 1px solid rgba(9,30,66,0.08); padding: 16px 20px; flex: 1; min-width: 0; }
                    .mt-bar { height: 6px; background: #EBECF0; border-radius: 3px; overflow: hidden; flex: 1; }
                    .mt-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.2,0,0,1); }
                    .mt-tab { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s; }
                    .mt-tab.active { background: #0052CC; color: white; }
                    .mt-tab:not(.active) { background: transparent; color: #6B778C; }
                    .mt-tab:not(.active):hover { background: #F4F5F7; }
                    .mt-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; border: 1px solid #DFE1E6; background: white; color: #42526E; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s; }
                    .mt-btn:hover { background: #F4F5F7; border-color: #c1c7d0; }
                    .mt-btn-primary { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; background: #0052CC; color: white; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; box-shadow: 0 2px 8px rgba(0,82,204,0.2); }
                    .mt-btn-primary:hover { background: #0747A6; }
                    .mt-member { display: flex; align-items: center; padding: 12px 16px; gap: 12px; border-bottom: 1px solid rgba(9,30,66,0.06); cursor: pointer; transition: all 0.12s; }
                    .mt-member:hover { background: rgba(0,82,204,0.03); }
                    .mt-member:last-child { border-bottom: none; }
                    .mt-av { width: 36px; height: 36px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; position: relative; flex-shrink: 0; }
                    .mt-task-row { display: grid; grid-template-columns: 2.5fr 100px 100px 120px 130px; align-items: center; padding: 10px 16px; border-bottom: 1px solid rgba(9,30,66,0.06); font-size: 13px; transition: background 0.12s; }
                    .mt-task-row:hover { background: rgba(0,82,204,0.02); }
                    .mt-search { display: flex; align-items: center; background: #F4F5F7; border-radius: 8px; padding: 6px 12px; border: 1px solid transparent; transition: all 0.2s; }
                    .mt-search:focus-within { background: white; border-color: #4C9AFF; box-shadow: 0 0 0 2px rgba(76,154,255,0.15); }
                    .panel-overlay { position: fixed; inset: 0; background: rgba(9,30,66,0.3); z-index: 99; animation: fadeIn 0.15s; }
                    .panel-slide { position: fixed; top: 0; right: 0; width: 400px; max-width: 90vw; height: 100vh; background: white; box-shadow: -8px 0 24px rgba(9,30,66,0.12); z-index: 100; display: flex; flex-direction: column; animation: slideIn 0.2s cubic-bezier(0.2,0,0,1); }
                    @keyframes fadeIn { from{opacity:0}to{opacity:1} }
                    @keyframes slideIn { from{transform:translateX(100%)}to{transform:translateX(0)} }
                `}</style>

                {/* ─── Header ─────────────────── */}
                <div style={{ padding: '20px 32px 16px', background: 'white', borderBottom: '1px solid #e3e6ee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0052CC, #0747A6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Network size={22} color="white" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', letterSpacing: '-0.01em' }}>{MY_TEAM.name}</h1>
                                <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '2px' }}>{MY_TEAM.description}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="mt-btn"><Settings size={14} /> Settings</button>
                            <button className="mt-btn-primary"><UserPlus size={14} /> Invite Member</button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {[
                            { label: 'Members', value: MEMBERS.length, sub: `${activeMembers} active`, icon: Users, color: '#0052CC' },
                            { label: 'Tasks', value: MY_TEAM.totalTasks, sub: `${MY_TEAM.completedTasks} done`, icon: CheckCircle2, color: '#36B37E' },
                            { label: 'Avg Workload', value: `${avgWorkload}%`, sub: avgWorkload >= 70 ? 'High' : 'Balanced', icon: TrendingUp, color: avgWorkload >= 70 ? '#FF5630' : '#36B37E' },
                            { label: 'Sprint', value: `${MY_TEAM.sprintProgress}%`, sub: MY_TEAM.sprint, icon: Target, color: '#0052CC' },
                            { label: 'Blocked', value: MY_TEAM.blockedTasks, sub: 'Need attention', icon: AlertTriangle, color: '#FF5630' },
                        ].map(s => (
                            <div key={s.label} className="mt-stat">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <s.icon size={13} color={s.color} />
                                    <span style={{ fontSize: '11px', color: '#6B778C', fontWeight: 500 }}>{s.label}</span>
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D' }}>{s.value}</div>
                                <span style={{ fontSize: '11px', color: '#8993A4' }}>{s.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Content ────────────────── */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px', display: 'flex', gap: '24px' }}>
                    {/* Left Column — Members + Tasks */}
                    <div style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Members Section */}
                        <div className="mt-card">
                            <div style={{ padding: '16px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(9,30,66,0.06)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>Team Members</h3>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B778C', background: '#F4F5F7', padding: '2px 8px', borderRadius: '10px' }}>{MEMBERS.length}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {['All', 'Active', 'Busy', 'Away'].map(f => (
                                        <button key={f} className={`mt-tab ${memberTab === f ? 'active' : ''}`} onClick={() => setMemberTab(f)}>{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                {filteredMembers.map((m, i) => (
                                    <div key={i} className="mt-member" onClick={() => setSelectedMember(m)}>
                                        <div className="mt-av" style={{ background: getAvatarColor(m.name) }}>
                                            {getInitials(m.name)}
                                            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: getStatusColor(m.status), border: '2px solid white' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{m.name}</span>
                                                {m.name === 'Sayab Ali' && <Star size={11} color="#FFAB00" fill="#FFAB00" />}
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#6B778C' }}>{m.role}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>{m.tasksActive}</div>
                                                <div style={{ fontSize: '9px', color: '#8993A4', fontWeight: 500 }}>ACTIVE</div>
                                            </div>
                                            <div style={{ width: '60px' }}>
                                                <div className="mt-bar"><div className="mt-bar-fill" style={{ width: `${m.workload}%`, background: getWorkloadColor(m.workload) }} /></div>
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: getWorkloadColor(m.workload), minWidth: '28px', textAlign: 'right' }}>{m.workload}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tasks Section */}
                        <div className="mt-card">
                            <div style={{ padding: '16px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(9,30,66,0.06)' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>Team Tasks</h3>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {['All', 'In Progress', 'To Do', 'Blocked', 'Completed'].map(f => (
                                        <button key={f} className={`mt-tab ${taskTab === f ? 'active' : ''}`} onClick={() => setTaskTab(f)} style={{ fontSize: '11px', padding: '4px 10px' }}>{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-task-row" style={{ fontSize: '10px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #DFE1E6' }}>
                                <div>Task</div><div>Status</div><div>Priority</div><div>Assignee</div><div>Progress</div>
                            </div>
                            {filteredTasks.map((t, i) => {
                                const sc = getTaskStatusColor(t.status);
                                return (
                                    <div key={i} className="mt-task-row">
                                        <div style={{ fontWeight: 500, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                                        <div><span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: sc.bg, color: sc.color }}>{t.status}</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: getPriorityColor(t.priority) }} />
                                            <span style={{ fontSize: '12px', color: '#42526E' }}>{t.priority}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: getAvatarColor(t.assignee), color: 'white', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getInitials(t.assignee)}</div>
                                            <span style={{ fontSize: '12px', color: '#42526E' }}>{t.assignee.split(' ')[0]}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div className="mt-bar" style={{ maxWidth: '70px' }}>
                                                <div className="mt-bar-fill" style={{ width: `${t.progress}%`, background: t.status === 'Completed' ? '#36B37E' : t.status === 'Blocked' ? '#FF5630' : '#0052CC' }} />
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: t.status === 'Completed' ? '#36B37E' : '#42526E' }}>{t.progress}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column — Sprint & Activity */}
                    <div style={{ flex: 1.2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Sprint Progress */}
                        <div className="mt-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>Sprint Progress</h3>
                                <span style={{ fontSize: '11px', color: '#6B778C', fontWeight: 500 }}>{MY_TEAM.sprint}</span>
                            </div>
                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 16px' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#EBECF0" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#0052CC" strokeWidth="10"
                                        strokeDasharray={`${MY_TEAM.sprintProgress * 3.14} 314`}
                                        strokeLinecap="round" transform="rotate(-90 60 60)"
                                        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{MY_TEAM.sprintProgress}%</span>
                                    <span style={{ fontSize: '10px', color: '#6B778C' }}>Complete</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#36B37E' }}>{MY_TEAM.completedTasks}</div>
                                    <div style={{ color: '#8993A4', fontSize: '10px' }}>Done</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#0052CC' }}>{MY_TEAM.totalTasks - MY_TEAM.completedTasks - MY_TEAM.blockedTasks}</div>
                                    <div style={{ color: '#8993A4', fontSize: '10px' }}>In Progress</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#FF5630' }}>{MY_TEAM.blockedTasks}</div>
                                    <div style={{ color: '#8993A4', fontSize: '10px' }}>Blocked</div>
                                </div>
                            </div>
                            <div style={{ marginTop: '14px', padding: '8px 12px', background: '#F4F5F7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#42526E' }}>
                                <Clock size={12} color="#6B778C" />
                                Sprint ends {MY_TEAM.sprintEnd}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="mt-card" style={{ padding: '20px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>Activity</h3>
                                <Activity size={14} color="#6B778C" />
                            </div>
                            {ACTIVITY.map((a, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(9,30,66,0.06)' : 'none', alignItems: 'flex-start' }}>
                                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: getAvatarColor(a.user), color: 'white', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>{a.user[0]}</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '12px', color: '#42526E', lineHeight: '1.4' }}><strong style={{ color: '#172B4D' }}>{a.user}</strong> {a.action} <span style={{ color: '#0052CC', fontWeight: 500 }}>{a.target}</span></p>
                                        <span style={{ fontSize: '10px', color: '#8993A4' }}>{a.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ MEMBER DETAIL PANEL ═══ */}
            {selectedMember && (
                <>
                    <div className="panel-overlay" onClick={() => setSelectedMember(null)} />
                    <div className="panel-slide">
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button onClick={() => setSelectedMember(null)} style={{ background: '#F4F5F7', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#6B778C' }}><X size={16} /></button>
                                <div className="mt-av" style={{ background: getAvatarColor(selectedMember.name), width: '44px', height: '44px', fontSize: '14px' }}>
                                    {getInitials(selectedMember.name)}
                                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: getStatusColor(selectedMember.status), border: '2px solid white' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D' }}>{selectedMember.name}</h2>
                                    <p style={{ fontSize: '12px', color: '#6B778C' }}>{selectedMember.role}</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                            {/* Contact */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '13px', color: '#42526E' }}>
                                    <Mail size={14} color="#6B778C" /> {selectedMember.email}
                                </div>
                            </div>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                {[
                                    { label: 'Workload', value: `${selectedMember.workload}%`, color: getWorkloadColor(selectedMember.workload) },
                                    { label: 'Status', value: selectedMember.status, color: getStatusColor(selectedMember.status) },
                                    { label: 'Active Tasks', value: selectedMember.tasksActive, color: '#0052CC' },
                                    { label: 'Completed', value: selectedMember.tasksCompleted, color: '#36B37E' },
                                ].map(s => (
                                    <div key={s.label} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(9,30,66,0.08)' }}>
                                        <div style={{ fontSize: '10px', color: '#6B778C', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: s.color as string }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Assigned Tasks */}
                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', marginBottom: '10px' }}>Assigned Tasks</h4>
                            {TASKS.filter(t => t.assignee === selectedMember.name).map((t, i) => {
                                const sc = getTaskStatusColor(t.status);
                                return (
                                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(9,30,66,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#172B4D' }}>{t.name}</div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: sc.bg, color: sc.color }}>{t.status}</span>
                                                <span style={{ fontSize: '10px', color: '#8993A4' }}>Due {t.dueDate}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div className="mt-bar" style={{ width: '50px' }}>
                                                <div className="mt-bar-fill" style={{ width: `${t.progress}%`, background: t.status === 'Completed' ? '#36B37E' : '#0052CC' }} />
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#42526E' }}>{t.progress}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #DFE1E6', display: 'flex', gap: '8px' }}>
                            <button className="mt-btn" style={{ flex: 1, justifyContent: 'center' }}><MessageSquare size={13} /> Message</button>
                            <button className="mt-btn" style={{ flex: 1, justifyContent: 'center' }}><ListPlus size={13} /> Assign Task</button>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}
