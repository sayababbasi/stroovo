"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Plus,
    MoreHorizontal,
    Calendar,
    MessageSquare,
    CheckCircle2,
    Clock,
    Flag,
    AlertCircle,
    ChevronDown,
    X
} from 'lucide-react';
import { useCallback } from 'react';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    progress: number;
    dueDate: string | null;
    projectId?: string;
    project: { name: string };
    assigneeId?: string | null;
    assignee: { name: string | null } | null;
}

interface Project { id: string; name: string; }
interface User { id: string; name: string | null; email: string; }

const statusColumns = [
    { key: 'BACKLOG', label: 'New task', color: '#6B778C', icon: AlertCircle },
    { key: 'TODO', label: 'Scheduled', color: '#FFAB00', icon: Clock },
    { key: 'IN_PROGRESS', label: 'In progress', color: '#0052CC', icon: Flag },
    { key: 'DONE', label: 'Completed', color: '#36B37E', icon: CheckCircle2 },
];

const STATUS_OPTIONS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TYPE_OPTIONS = ['TASK', 'BUG', 'STORY', 'FEATURE'];

export default function BoardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Header States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterPriority, setFilterPriority] = useState<string>('');
    const [groupBy, setGroupBy] = useState<'none' | 'project' | 'status' | 'assignee'>('none');
    const [groupByOpen, setGroupByOpen] = useState(false);

    // Modal States
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [formProjectId, setFormProjectId] = useState('');
    const [formStatus, setFormStatus] = useState('TODO');
    const [formPriority, setFormPriority] = useState('MEDIUM');
    const [formType, setFormType] = useState('TASK');
    const [formAssigneeId, setFormAssigneeId] = useState('');
    const [formDueDate, setFormDueDate] = useState('');

    const fetchTasks = useCallback(async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${API_URL}/api/tasks`);
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
                const res = await fetch(`${API_URL}/api/admin/users`);
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); }
        };

        const fetchProjects = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
                const res = await fetch(`${API_URL}/api/admin/projects`);
                const data = await res.json();
                setProjects(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); }
        };

        fetchTasks();
        fetchUsers();
        fetchProjects();
    }, [fetchTasks]);

    const handleSaveTask = async () => {
        if (!formTitle.trim()) return;
        setSaving(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formTitle.trim(),
                    projectId: formProjectId || projects[0]?.id,
                    status: formStatus,
                    priority: formPriority,
                    type: formType,
                    assigneeId: formAssigneeId || null,
                    dueDate: formDueDate || null,
                }),
            });
            if (res.ok) {
                setModalOpen(false);
                fetchTasks();
            }
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setFormTitle('');
        setFormProjectId(projects[0]?.id ?? '');
        setFormStatus('TODO');
        setFormPriority('MEDIUM');
        setFormType('TASK');
        setFormAssigneeId('');
        setFormDueDate('');
        setModalOpen(true);
    };

    const handleTaskDrop = async (taskId: string, newStatus: string) => {
        const originalTasks = [...tasks];
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update task status');
        } catch (error) {
            console.error('Error updating task status:', error);
            setTasks(originalTasks);
        }
    };

    const filteredTasks = tasks.filter(t => {
        const matchSearch = !searchQuery.trim() ||
            t.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            (t.project?.name ?? '').toLowerCase().includes(searchQuery.trim().toLowerCase());
        const matchStatus = !filterStatus || t.status === filterStatus;
        const matchPriority = !filterPriority || t.priority === filterPriority;
        return matchSearch && matchStatus && matchPriority;
    });

    const getTasksByStatus = (status: string) => {
        return filteredTasks.filter(task => task.status === status);
    };

    const getAvatarColor = (name: string | null | undefined) => {
        const colors = ['#FF5630', '#FFAB00', '#36B37E', '#00B8D9', '#6554C0', '#0052CC'];
        if (!name) return '#6B778C';
        return colors[name.charCodeAt(0) % colors.length];
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#F4F5F7' }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <style>{`
                    .kanban-column-scroll::-webkit-scrollbar { display: none; }
                    .kanban-column-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                    *::-webkit-scrollbar { display: none; }
                    * { -ms-overflow-style: none; scrollbar-width: none; }
                    body { overflow: hidden !important; }
                `}</style>

                {/* Header */}
                <div style={{ padding: '20px 40px', borderBottom: '1px solid #DFE1E6', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Tasks Board</h1>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', marginRight: '8px', alignItems: 'center' }}>
                                {users.slice(0, 4).map((user, i) => (
                                    <div
                                        key={user.id}
                                        title={user.name || user.email}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: getAvatarColor(user.name),
                                            border: '2px solid white',
                                            marginLeft: i > 0 ? '-8px' : '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            color: 'white',
                                            fontWeight: 700,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {user.name?.[0] || user.email[0].toUpperCase()}
                                    </div>
                                ))}
                                {users.length > 4 && (
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DFE1E6', border: '2px solid white', marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#42526E', fontWeight: 600 }}>
                                        +{users.length - 4}
                                    </div>
                                )}
                            </div>

                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setGroupByOpen(!groupByOpen)}
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: '#FFFFFF', fontSize: '14px', fontWeight: 500, color: '#42526E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    Group <ChevronDown size={14} />
                                </button>
                                {groupByOpen && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '140px' }}>
                                        {['none', 'project', 'status', 'assignee'].map(opt => (
                                            <button key={opt} onClick={() => { setGroupBy(opt as any); setGroupByOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', background: groupBy === opt ? '#F4F5F7' : 'transparent', cursor: 'pointer', fontSize: '13px', color: '#172B4D' }}>
                                                {opt === 'none' ? 'None' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setFilterOpen(!filterOpen)}
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #DFE1E6', background: '#FFFFFF', fontSize: '14px', fontWeight: 500, color: '#42526E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    Filter <ChevronDown size={14} />
                                </button>
                                {filterOpen && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, padding: '16px', minWidth: '220px' }}>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B778C', marginBottom: '4px' }}>Status</label>
                                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #DFE1E6', fontSize: '13px' }}>
                                                <option value="">All Statuses</option>
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B778C', marginBottom: '4px' }}>Priority</label>
                                            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #DFE1E6', fontSize: '13px' }}>
                                                <option value="">All Priorities</option>
                                                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <button onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterOpen(false); }} style={{ width: '100%', marginTop: '12px', padding: '6px', background: 'none', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Clear All</button>
                                    </div>
                                )}
                            </div>

                            <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                <Plus size={16} /> Add new
                            </button>
                        </div>
                    </div>
                </div>

                {/* Board Content */}
                <div style={{ flex: 1, padding: '24px 40px', display: 'flex', gap: '16px', minHeight: '0', overflow: 'hidden' }}>
                    {statusColumns.map((column) => {
                        const Icon = column.icon;
                        const columnTasks = getTasksByStatus(column.key);

                        return (
                            <div
                                key={column.key}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const taskId = e.dataTransfer.getData('taskId');
                                    if (taskId) handleTaskDrop(taskId, column.key);
                                }}
                                style={{
                                    flex: 1,
                                    minWidth: '0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: '#F4F5F7',
                                    borderRadius: '8px',
                                    border: '1px solid #DFE1E6',
                                    maxHeight: '100%'
                                }}
                            >
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Icon size={16} color={column.color} />
                                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#172B4D' }}>{column.label}</span>
                                        <span style={{ background: '#DFE1E6', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#42526E' }}>{columnTasks.length}</span>
                                    </div>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><MoreHorizontal size={16} /></button>
                                </div>

                                <div className="kanban-column-scroll" style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                                    {columnTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => { e.dataTransfer.setData('taskId', task.id); e.currentTarget.style.opacity = '0.5'; }}
                                            onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
                                            style={{ background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '6px', padding: '12px', cursor: 'grab', boxShadow: '0 1px 3px rgba(9,30,66,0.08)' }}
                                        >
                                            <div style={{ marginBottom: '8px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 600, background: task.type === 'BUG' ? '#FFEBE6' : task.type === 'STORY' ? '#EAE6FF' : '#DEEBFF', color: task.type === 'BUG' ? '#BF2600' : task.type === 'STORY' ? '#403294' : '#0747A6' }}>{task.type}</span>
                                            </div>
                                            <h4 style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px', lineHeight: 1.4 }}>{task.title}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', color: '#6B778C', fontSize: '12px', alignItems: 'center' }}>
                                                    {task.dueDate && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />{new Date(task.dueDate).toLocaleDateString()}</span>}
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={12} />0</span>
                                                </div>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: getAvatarColor(task.assignee?.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{task.assignee?.name?.[0] || 'U'}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={openCreateModal} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #DFE1E6', borderRadius: '6px', color: '#6B778C', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Plus size={14} />Add task</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Modal */}
                {modalOpen && (
                    <>
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} onClick={() => setModalOpen(false)} />
                        <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1001, width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D' }}>Create task</h2>
                                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: '4px' }}><X size={20} /></button>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Title *</label>
                                    <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Task title" style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Project *</label>
                                    <select value={formProjectId} onChange={(e) => setFormProjectId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}>
                                        <option value="" disabled>Select a project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Status</label>
                                        <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} style={{ width: '100%', padding: '6px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Priority</label>
                                        <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} style={{ width: '100%', padding: '6px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                                            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Type</label>
                                    <select value={formType} onChange={(e) => setFormType(e.target.value)} style={{ width: '100%', padding: '6px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                                        {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Assignee</label>
                                    <select value={formAssigneeId} onChange={(e) => setFormAssigneeId(e.target.value)} style={{ width: '100%', padding: '6px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                                        <option value="">Unassigned</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Due date</label>
                                    <input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setModalOpen(false)} style={{ padding: '10px 18px', border: '1px solid #DFE1E6', borderRadius: '6px', background: '#FFFFFF', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={handleSaveTask} disabled={saving || !formTitle.trim() || !formProjectId} style={{ padding: '10px 18px', border: 'none', borderRadius: '6px', background: saving || !formTitle.trim() || !formProjectId ? '#6B778C' : '#0052CC', color: 'white', fontSize: '14px', fontWeight: 500, cursor: saving || !formTitle.trim() || !formProjectId ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
