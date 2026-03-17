"use client";

import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Table,
    Trello,
    Calendar,
    MessageSquare,
    Clock,
    Flag,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    X
} from 'lucide-react';

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
    { key: 'TODO', label: 'Scheduled', color: '#00B8D9', icon: Clock },
    { key: 'IN_PROGRESS', label: 'In progress', color: '#0052CC', icon: Flag },
    { key: 'DONE', label: 'Completed', color: '#36B37E', icon: CheckCircle2 },
];

const STATUS_OPTIONS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TYPE_OPTIONS = ['TASK', 'BUG', 'STORY', 'FEATURE'];

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterPriority, setFilterPriority] = useState<string>('');
    const [showFilter, setShowFilter] = useState<'active' | 'completed' | 'all'>('active');
    const [showDropdownOpen, setShowDropdownOpen] = useState(false);
    const [groupBy, setGroupBy] = useState<'none' | 'project' | 'status' | 'assignee'>('none');
    const [groupByOpen, setGroupByOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [saving, setSaving] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [formProjectId, setFormProjectId] = useState('');
    const [formStatus, setFormStatus] = useState('TODO');
    const [formPriority, setFormPriority] = useState('MEDIUM');
    const [formType, setFormType] = useState('TASK');
    const [formAssigneeId, setFormAssigneeId] = useState('');
    const [formDueDate, setFormDueDate] = useState('');

    const fetchTasks = useCallback(() => {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        fetch(`${API_URL}/api/tasks`)
            .then(res => res.json())
            .then(data => {
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        fetch(`${API_URL}/api/admin/projects`).then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : []));
        fetch(`${API_URL}/api/admin/users`).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DONE': return { bg: '#36B37E', fg: '#FFFFFF' };
            case 'IN_PROGRESS': return { bg: '#0052CC', fg: '#FFFFFF' };
            case 'BLOCKED': return { bg: '#FF5630', fg: '#FFFFFF' };
            case 'TODO': return { bg: '#00B8D9', fg: '#FFFFFF' };
            default: return { bg: '#6B778C', fg: '#FFFFFF' };
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'URGENT': return { color: '#FF5630', label: 'URGENT' };
            case 'HIGH': return { color: '#FFAB00', label: 'HIGH' };
            case 'MEDIUM': return { color: '#36B37E', label: 'MEDIUM' };
            default: return { color: '#6B778C', label: 'LOW' };
        }
    };

    const getAvatarColor = (name: string | null | undefined) => {
        const colors = ['#FF5630', '#FFAB00', '#36B37E', '#00B8D9', '#6554C0', '#0052CC'];
        if (!name) return '#6B778C';
        return colors[name.charCodeAt(0) % colors.length];
    };

    const getTasksByStatus = (status: string) => {
        return filteredTasks.filter(task => task.status === status);
    };

    const filteredTasks = tasks.filter(t => {
        const matchSearch = !searchQuery.trim() ||
            t.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            (t.project?.name ?? '').toLowerCase().includes(searchQuery.trim().toLowerCase());
        const matchStatus = !filterStatus || t.status === filterStatus;
        const matchPriority = !filterPriority || t.priority === filterPriority;
        
        // In Kanban mode, we typically want to see all columns including Completed
        // unless a specific status filter is applied.
        const matchShow = (viewMode === 'kanban') || 
            showFilter === 'all' ||
            (showFilter === 'active' && t.status !== 'DONE') ||
            (showFilter === 'completed' && t.status === 'DONE');
            
        return matchSearch && matchStatus && matchPriority && matchShow;
    });

    const groupedTasks = (() => {
        if (groupBy === 'none') return [{ key: '', label: 'All', tasks: filteredTasks }];
        if (groupBy === 'project') {
            const map = new Map<string, Task[]>();
            filteredTasks.forEach(t => {
                const k = t.project?.name ?? 'No project';
                if (!map.has(k)) map.set(k, []);
                map.get(k)!.push(t);
            });
            return Array.from(map.entries()).map(([key, tasks]) => ({ key, label: key, tasks }));
        }
        if (groupBy === 'status') {
            const map = new Map<string, Task[]>();
            filteredTasks.forEach(t => {
                const k = t.status;
                if (!map.has(k)) map.set(k, []);
                map.get(k)!.push(t);
            });
            return Array.from(map.entries()).map(([key, tasks]) => ({ key, label: key.replace('_', ' '), tasks }));
        }
        if (groupBy === 'assignee') {
            const map = new Map<string, Task[]>();
            filteredTasks.forEach(t => {
                const k = t.assignee?.name ?? 'Unassigned';
                if (!map.has(k)) map.set(k, []);
                map.get(k)!.push(t);
            });
            return Array.from(map.entries()).map(([key, tasks]) => ({ key, label: key, tasks }));
        }
        return [{ key: '', label: 'All', tasks: filteredTasks }];
    })();

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredTasks.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredTasks.map(t => t.id)));
    };

    const toggleSelectGroup = (groupTasks: Task[]) => {
        const ids = groupTasks.map(t => t.id);
        const allSelected = ids.every(id => selectedIds.has(id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (allSelected) ids.forEach(id => next.delete(id));
            else ids.forEach(id => next.add(id));
            return next;
        });
    };

    const openCreateModal = () => {
        setModalMode('create');
        setEditingTask(null);
        setFormTitle('');
        setFormProjectId(projects[0]?.id ?? '');
        setFormStatus('TODO');
        setFormPriority('MEDIUM');
        setFormType('TASK');
        setFormAssigneeId('');
        setFormDueDate('');
        setModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setModalMode('edit');
        setEditingTask(task);
        setFormTitle(task.title);
        setFormProjectId(task.projectId ?? '');
        setFormStatus(task.status);
        setFormPriority(task.priority);
        setFormType(task.type);
        setFormAssigneeId(task.assigneeId ?? '');
        setFormDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
        setModalOpen(true);
        setMenuOpenId(null);
    };

    const handleSaveTask = async () => {
        if (!formTitle.trim()) return;
        setSaving(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            if (modalMode === 'create') {
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
            } else if (editingTask) {
                const res = await fetch(`${API_URL}/api/tasks/${editingTask.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formTitle.trim(),
                        status: formStatus,
                        priority: formPriority,
                        type: formType,
                        assigneeId: formAssigneeId || null,
                        dueDate: formDueDate || null,
                    }),
                });
                if (res.ok) {
                    setModalOpen(false);
                    setEditingTask(null);
                    fetchTasks();
                }
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (task: Task) => {
        if (!confirm(`Delete "${task.title}"?`)) return;
        setMenuOpenId(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${API_URL}/api/tasks/${task.id}`, { method: 'DELETE' });
            if (res.ok) fetchTasks();
        } catch (_) {}
    };

    const markSelectedComplete = () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        Promise.all(
            Array.from(selectedIds).map(id =>
                fetch(`${API_URL}/api/tasks/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'DONE', progress: 100 }),
                })
            )
        ).then(() => {
            setSelectedIds(new Set());
            fetchTasks();
        });
    };

    const handleTaskDrop = async (taskId: string, newStatus: string) => {
        // Optimistic update
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
            setTasks(originalTasks); // Rollback on error
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                {/* Header */}
                <div style={{
                    padding: '20px 32px',
                    background: '#FFFFFF',
                    borderBottom: '1px solid #DFE1E6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#172B4D' }}>All Tasks</h1>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {selectedIds.size > 0 && (
                            <button
                                onClick={markSelectedComplete}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: '#36B37E',
                                    color: 'white',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                <CheckCircle2 size={14} />
                                Mark complete ({selectedIds.size})
                            </button>
                        )}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    border: '1px solid #DFE1E6',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                <Filter size={14} />
                                Filter
                                <ChevronDown size={14} />
                            </button>
                            {filterOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setFilterOpen(false)} />
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '4px',
                                        background: '#FFFFFF',
                                        border: '1px solid #DFE1E6',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        padding: '12px',
                                        minWidth: '200px',
                                        zIndex: 20
                                    }}>
                                        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Status</div>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            style={{ width: '100%', padding: '6px 8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #DFE1E6', fontSize: '13px' }}
                                        >
                                            <option value="">All</option>
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                        </select>
                                        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Priority</div>
                                        <select
                                            value={filterPriority}
                                            onChange={(e) => setFilterPriority(e.target.value)}
                                            style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #DFE1E6', fontSize: '13px' }}
                                        >
                                            <option value="">All</option>
                                            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={openCreateModal}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                background: '#0052CC',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={16} />
                            Create
                        </button>
                    </div>
                </div>

                {/* Filter Bar with View Toggle */}
                <div style={{
                    padding: '16px 32px',
                    background: '#FFFFFF',
                    borderBottom: '1px solid #DFE1E6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 36px',
                                border: '1px solid #DFE1E6',
                                borderRadius: '4px',
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* View Toggle */}
                    <div style={{ display: 'flex', gap: '4px', background: '#EBECF0', borderRadius: '6px', padding: '4px' }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '4px',
                                background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: viewMode === 'table' ? '#172B4D' : '#6B778C',
                                cursor: 'pointer'
                            }}
                        >
                            <Table size={14} />
                            Table view
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '4px',
                                background: viewMode === 'kanban' ? '#FFFFFF' : 'transparent',
                                boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: viewMode === 'kanban' ? '#172B4D' : '#6B778C',
                                cursor: 'pointer'
                            }}
                        >
                            <Trello size={14} />
                            Kanban board
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px', color: '#6B778C' }}>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => { setShowDropdownOpen(!showDropdownOpen); setGroupByOpen(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', fontSize: '13px' }}
                            >
                                Show: <b style={{ color: '#0052CC' }}>
                                    {showFilter === 'active' ? 'All active' : showFilter === 'completed' ? 'Completed' : 'All'}
                                </b>
                                <ChevronDown size={14} />
                            </button>
                            {showDropdownOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowDropdownOpen(false)} />
                                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20, minWidth: '140px' }}>
                                        {(['active', 'completed', 'all'] as const).map(opt => (
                                            <button key={opt} onClick={() => { setShowFilter(opt); setShowDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: showFilter === opt ? '#EBECF0' : 'transparent', cursor: 'pointer', fontSize: '13px' }}>
                                                {opt === 'active' ? 'All active' : opt === 'completed' ? 'Completed' : 'All'}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => { setGroupByOpen(!groupByOpen); setShowDropdownOpen(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', fontSize: '13px' }}
                            >
                                Group by: <b style={{ color: '#172B4D' }}>{groupBy === 'none' ? 'None' : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</b>
                                <ChevronDown size={14} />
                            </button>
                            {groupByOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setGroupByOpen(false)} />
                                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20, minWidth: '120px' }}>
                                        {(['none', 'project', 'status', 'assignee'] as const).map(opt => (
                                            <button key={opt} onClick={() => { setGroupBy(opt); setGroupByOpen(false); }} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: groupBy === opt ? '#EBECF0' : 'transparent', cursor: 'pointer', fontSize: '13px' }}>
                                                {opt === 'none' ? 'None' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '24px 32px' }}>

                    {/* TABLE VIEW */}
                    {viewMode === 'table' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {groupedTasks.map((group) => (
                                <div key={group.key || 'all'} style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #DFE1E6', overflow: 'hidden' }}>
                                    {groupBy !== 'none' && group.label && (
                                        <div style={{ padding: '10px 16px', background: '#F4F5F7', borderBottom: '1px solid #DFE1E6', fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>
                                            {group.label}
                                        </div>
                                    )}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'minmax(300px, 3fr) 1.5fr 140px 120px 160px 160px 48px',
                                        padding: '12px 16px',
                                        background: '#F4F5F7',
                                        borderBottom: '1px solid #DFE1E6',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#6B778C',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <input type="checkbox" checked={group.tasks.length > 0 && group.tasks.every(t => selectedIds.has(t.id))} onChange={() => groupBy === 'none' ? toggleSelectAll() : toggleSelectGroup(group.tasks)} style={{ width: '16px', height: '16px', accentColor: '#0052CC', cursor: 'pointer' }} />
                                            Name
                                        </div>
                                        <div>Project</div>
                                        <div>Status</div>
                                        <div>Priority</div>
                                        <div>Progress</div>
                                        <div>Assignee</div>
                                        <div></div>
                                    </div>

                                    {loading ? (
                                        <div style={{ padding: '60px', textAlign: 'center', color: '#6B778C' }}>Loading tasks...</div>
                                    ) : (
                                        group.tasks.map((task) => {
                                            const status = getStatusStyle(task.status);
                                            const priority = getPriorityStyle(task.priority);
                                            const avatarColor = getAvatarColor(task.assignee?.name);

                                            return (
                                                <div
                                                    key={task.id}
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'minmax(300px, 3fr) 1.5fr 140px 120px 160px 160px 48px',
                                                        padding: '16px 16px',
                                                        borderBottom: '1px solid #EBECF0',
                                                        fontSize: '13px',
                                                        alignItems: 'center',
                                                        transition: 'background 0.1s',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <input type="checkbox" checked={selectedIds.has(task.id)} onChange={() => toggleSelect(task.id)} style={{ width: '16px', height: '16px', accentColor: '#0052CC' }} />
                                                        <span style={{ fontWeight: 500, color: '#172B4D' }}>{task.title}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B778C', fontSize: '12px' }}>
                                                        <div style={{ width: '16px', height: '16px', background: '#0052CC', borderRadius: '3px' }}></div>
                                                        {task.project?.name}
                                                    </div>
                                                    <div>
                                                        <span style={{ padding: '4px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: 600, background: status.bg, color: status.fg }}>
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: priority.color, fontSize: '12px' }}>•</span>
                                                        <span style={{ color: priority.color, fontSize: '12px', fontWeight: 500 }}>{priority.label}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ flex: 1, height: '6px', background: '#DFE1E6', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${task.progress}%`, height: '100%', background: '#36B37E' }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#6B778C', minWidth: '32px' }}>{task.progress}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                                                            {task.assignee?.name?.[0] || 'U'}
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#42526E' }}>{task.assignee?.name?.split(' ')[0] || 'Unassigned'}</span>
                                                    </div>
                                                    <div style={{ position: 'relative' }}>
                                                        <button onClick={() => setMenuOpenId(menuOpenId === task.id ? null : task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: '4px' }}>
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                        {menuOpenId === task.id && (
                                                            <>
                                                                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpenId(null)} />
                                                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 20, minWidth: '120px' }}>
                                                                    <button onClick={() => openEditModal(task)} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                                                                    <button onClick={() => handleDeleteTask(task)} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#FF5630' }}>Delete</button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    {groupBy === 'none' && (
                                        <div onClick={openCreateModal} style={{ padding: '14px 16px', fontSize: '13px', color: '#0052CC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Plus size={16} />
                                            <span style={{ fontWeight: 500 }}>Create task</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {groupBy !== 'none' && (
                                <div onClick={openCreateModal} style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px dashed #DFE1E6', padding: '14px 16px', fontSize: '13px', color: '#0052CC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Plus size={16} />
                                    <span style={{ fontWeight: 500 }}>Create task</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* KANBAN VIEW */}
                    {viewMode === 'kanban' && (
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            paddingBottom: '16px',
                            minHeight: 'calc(100vh - 250px)'
                        }}>
                            <style>{`
                                .kanban-column-scroll::-webkit-scrollbar {
                                    display: none;
                                }
                                .kanban-column-scroll {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                }
                            `}</style>
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
                                            maxHeight: 'calc(100vh - 250px)'
                                        }}
                                    >
                                        {/* Column Header */}
                                        <div style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #DFE1E6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: '#FFFFFF',
                                            borderTopLeftRadius: '8px',
                                            borderTopRightRadius: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Icon size={16} color={column.color} />
                                                <span style={{ fontWeight: 600, fontSize: '14px', color: '#172B4D' }}>{column.label}</span>
                                                <span style={{ background: '#DFE1E6', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#42526E' }}>
                                                    {columnTasks.length}
                                                </span>
                                            </div>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}>
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>

                                        {/* Task Cards */}
                                        <div className="kanban-column-scroll" style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                                            {columnTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('taskId', task.id);
                                                        e.currentTarget.style.opacity = '0.5';
                                                    }}
                                                    onDragEnd={(e) => {
                                                        e.currentTarget.style.opacity = '1';
                                                    }}
                                                    onClick={() => openEditModal(task)}
                                                    style={{
                                                        background: '#FFFFFF',
                                                        border: '1px solid #DFE1E6',
                                                        borderRadius: '6px',
                                                        padding: '12px',
                                                        cursor: 'grab',
                                                        boxShadow: '0 1px 3px rgba(9,30,66,0.08)',
                                                        transition: 'transform 0.1s, box-shadow 0.1s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(9,30,66,0.12)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(9,30,66,0.08)';
                                                    }}
                                                >
                                                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '3px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            background: task.type === 'BUG' ? '#FFEBE6' : task.type === 'STORY' ? '#EAE6FF' : '#DEEBFF',
                                                            color: task.type === 'BUG' ? '#BF2600' : task.type === 'STORY' ? '#403294' : '#0747A6'
                                                        }}>
                                                            {task.type}
                                                        </span>
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: getPriorityStyle(task.priority).color
                                                        }} />
                                                    </div>
                                                    <h4 style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px', lineHeight: 1.4, color: '#172B4D' }}>
                                                        {task.title}
                                                    </h4>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '8px', color: '#6B778C', fontSize: '12px', alignItems: 'center' }}>
                                                            {task.dueDate && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Calendar size={12} />
                                                                    {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            )}
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <MessageSquare size={12} />
                                                                0
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            background: getAvatarColor(task.assignee?.name),
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '10px',
                                                            fontWeight: 700
                                                        }}>
                                                            {task.assignee?.name?.[0] || 'U'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={openCreateModal}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'transparent',
                                                    border: '1px dashed #DFE1E6',
                                                    borderRadius: '6px',
                                                    color: '#6B778C',
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Plus size={14} />
                                                Add task
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Create / Edit Task Modal */}
            {modalOpen && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }} onClick={() => setModalOpen(false)} />
                    <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 51, width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D' }}>{modalMode === 'create' ? 'Create task' : 'Edit task'}</h2>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: '4px' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Title *</label>
                                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Task title" style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                            </div>
                            {modalMode === 'create' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Project *</label>
                                    <select value={formProjectId} onChange={(e) => setFormProjectId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Status</label>
                                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Priority</label>
                                    <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                                        {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Type</label>
                                <select value={formType} onChange={(e) => setFormType(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#172B4D' }}>Assignee</label>
                                <select value={formAssigneeId} onChange={(e) => setFormAssigneeId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
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
                                <button onClick={handleSaveTask} disabled={saving || !formTitle.trim() || (modalMode === 'create' && !formProjectId)} style={{ padding: '10px 18px', border: 'none', borderRadius: '6px', background: saving || !formTitle.trim() || (modalMode === 'create' && !formProjectId) ? '#6B778C' : '#0052CC', color: 'white', fontSize: '14px', fontWeight: 500, cursor: saving || !formTitle.trim() || (modalMode === 'create' && !formProjectId) ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
