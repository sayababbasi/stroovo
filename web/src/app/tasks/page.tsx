"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Search, Filter, Plus, LayoutGrid, List, Columns, Focus, ArrowUpRight, ArrowDownRight, Inbox, Check, Bot } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, TaskStatus, Priority } from '@/components/tasks/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/components/tasks/types';
import TaskRow from '@/components/tasks/TaskRow';
import BulkToolbar from '@/components/tasks/BulkToolbar';
import TaskDetailsPanel from '@/components/tasks/TaskDetailsPanel';
import AIInsightsBanner from '@/components/tasks/AIInsightsBanner';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { BoardView } from '@/app/board/page';
import { TimelineView } from '@/app/timeline/page';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

// ── Helpers to safely read project/assignee from DB response ─────────────────
function getProjectName(t: Task): string {
    if (!t.project) return 'No Project';
    if (typeof t.project === 'object') return (t.project as any).name || 'No Project';
    return t.project;
}
function getAssigneeName(t: Task): string {
    if (!t.assignee) return 'Unassigned';
    if (typeof t.assignee === 'object') return (t.assignee as any).name || 'Unassigned';
    return t.assignee;
}
function isOverdue(t: Task): boolean {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date(new Date().toDateString());
}
function isDueToday(t: Task): boolean {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).toDateString() === new Date().toDateString();
}

export default function TasksPage() {
    const { user, accessToken } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'Table' | 'Kanban' | 'Timeline'>('Table');
    const [quickFilter, setQuickFilter] = useState('All');
    const [focusMode, setFocusMode] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
    const [showInsights, setShowInsights] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchTasks = useCallback(async (isSilent = false) => {
        try {
            setError(null);
            if (!isSilent) setLoading(true);
            const response = await apiGet('/api/tasks', accessToken, { timeout: 30000 });
            
            if (response.success && response.data) {
                setTasks(Array.isArray(response.data) ? response.data : []);
            } else {
                setError(response.error || 'Failed to load tasks. Please try again.');
            }
        } catch (err: any) {
            console.error('Failed to fetch tasks:', err);
            setError(err.message || 'Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Socket initialization from environment variable
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';
        const s = io(SOCKET_URL, {
            transports: ['websocket'],
            forceNew: true
        });
        setSocket(s);

        if (user?.tenantId) {
            s.emit('join-room', `tenant-${user.tenantId}`);
        }

        const handleUpdate = () => fetchTasks(true);
        const handleRiskUpdate = (message: any) => {
            const payload = message?.payload || message || {};
            if (!payload.taskId) return;

            setTasks(current => current.map(task => task.id === payload.taskId ? {
                ...task,
                delayProbability: payload.delayProbability ?? task.delayProbability,
                aiInsights: {
                    ...((task.aiInsights as any) || {}),
                    riskAnalysis: {
                        riskLevel: String(payload.riskLevel || 'LOW').toLowerCase(),
                        delayProbability: payload.delayProbability ?? task.delayProbability ?? 0,
                        reasons: payload.reasons || [],
                        recommendations: payload.recommendations || [],
                        suggestions: payload.recommendations || [],
                    }
                } as any,
            } : task));
        };

        s.on('TASK_CREATED', handleUpdate);
        s.on('TASK_UPDATED', handleUpdate);
        s.on('TASK_DELETED', handleUpdate);
        s.on('TASK_STATUS_CHANGED', handleUpdate);
        s.on('risk_update', handleRiskUpdate);
        s.on('RISK_UPDATED', handleRiskUpdate);

        return () => { s.disconnect(); };
    }, [user?.tenantId, fetchTasks]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);


    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'All'>('All');
    const [groupBy, setGroupBy] = useState<'Status' | 'Priority' | 'Project' | 'None'>('Status');
    const [activeTipIndex, setActiveTipIndex] = useState(0);
    const tips = useMemo(() => [
        { text: 'Press / to search', icon: <Search size={12} /> },
        { text: 'Shift + N for New Task', icon: <Plus size={12} /> },
        { text: 'Group tasks by Status/Project', icon: <Columns size={12} /> },
        { text: 'Drag & Drop to reorder', icon: <List size={12} /> }
    ], []);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTipIndex(prev => (prev + 1) % tips.length);
        }, 10000);
        return () => clearInterval(timer);
    }, [tips.length]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

            // Shift + N to create task
            if (e.shiftKey && e.key.toUpperCase() === 'N') {
                e.preventDefault();
                setShowCreateModal(true);
            }
            // / to search
            if (e.key === '/') { 
                e.preventDefault(); 
                document.querySelector<HTMLInputElement>('#task-search')?.focus(); 
            }
            // Escape to close
            if (e.key === 'Escape') {
                setActiveTask(null);
                setShowCreateModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredTasks = useMemo(() => tasks.filter(t => {
        // Only show top-level tasks (no parentId) in the main table
        if (t.parentId) return false;
        if (searchQ && !t.title.toLowerCase().includes(searchQ.toLowerCase())) return false;
        
        // Quick Filters
        if (quickFilter === 'Assigned to Me' && (t as any).assigneeId !== user?.id) return false;
        if (quickFilter === 'Due Today' && !isDueToday(t)) return false;
        if (quickFilter === 'Overdue' && !isOverdue(t)) return false;
        if (quickFilter === 'High Priority' && t.priority !== 'HIGH' && t.priority !== 'URGENT') return false;
        
        // Status Filter
        if (filterStatus !== 'All' && t.status !== filterStatus) return false;

        if (focusMode) {
            // Focus mode: show only my tasks (IN_PROGRESS / HIGH priority)
            if (t.status !== 'IN_PROGRESS' && t.priority !== 'HIGH' && t.priority !== 'URGENT') return false;
        }
        
        return true;
    }), [tasks, focusMode, searchQ, quickFilter, filterStatus, user?.id]);

    // Stats computed from real DB values
    const stats = useMemo(() => [
        { label: 'Total Tasks', val: tasks.length, trend: '+12%', up: true },
        { label: 'In Progress', val: tasks.filter(t => t.status === 'IN_PROGRESS').length, trend: '+4%', up: true },
        { label: 'Blocked', val: tasks.filter(t => t.status === 'BLOCKED').length, trend: '-2%', up: false },
        { label: 'Completed', val: tasks.filter(t => t.status === 'DONE').length, trend: '+24%', up: true },
        { label: 'Overdue', val: tasks.filter(t => isOverdue(t)).length, trend: '+1%', up: false },
    ], [tasks]);

    const groupedTasks = useMemo(() => {
        if (groupBy === 'None') return { 'All Tasks': filteredTasks };
        const groups: Record<string, Task[]> = {};
        filteredTasks.forEach(t => {
            let key = 'Other';
            if (groupBy === 'Status') key = STATUS_LABELS[t.status] || t.status;
            else if (groupBy === 'Priority') key = PRIORITY_LABELS[t.priority] || t.priority;
            else if (groupBy === 'Project') key = getProjectName(t);
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        return groups;
    }, [filteredTasks, groupBy]);

    const handleUpdate = useCallback(async (id: string, fieldOrUpdates: keyof Task | any, val?: unknown) => {
        const updates = typeof fieldOrUpdates === 'string' ? { [fieldOrUpdates]: val } : fieldOrUpdates;
        
        // Whitelist for API calls to prevent validation errors with computed fields
        const allowedFields = ['title', 'description', 'status', 'priority', 'type', 'projectId', 'assigneeId', 'parentId', 'teamId', 'dueDate', 'progress'];
        const apiUpdates = Object.keys(updates)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {} as any);

        setSavingIds(s => new Set(s).add(id));
        // Optimistic update
        setTasks(ts => ts.map(t => t.id === id ? { ...t, ...updates } : t));
        setActiveTask(prev => prev?.id === id ? { ...prev, ...updates } : prev);
        
        // If no API fields are being changed, skip the network request
        if (Object.keys(apiUpdates).length === 0) {
            setSavingIds(s => { const n = new Set(s); n.delete(id); return n; });
            return;
        }

        try {
            const response = await apiPatch(`/api/tasks/${id}`, null, apiUpdates, { timeout: 30000 });
            
            if (response.success && response.data) {
                setTasks(ts => ts.map(t => t.id === id ? { ...t, ...response.data } : t));
                setActiveTask(prev => prev?.id === id ? { ...prev, ...response.data } : prev);
            } else {
                throw new Error(response.error || 'Failed to update task');
            }
        } catch (err: any) {
            console.error('Update failed:', err.message);
            toast.error(err.message || 'Task update failed');
            fetchTasks();
        } finally {
            setSavingIds(s => { const n = new Set(s); n.delete(id); return n; });
        }
    }, [fetchTasks]);

    const toggleSelect = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTasks(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }, []);

    const toggleExpand = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRows(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const oldTasks = [...tasks];
        setTasks(ts => ts.filter(t => t.id !== id));
        setSelectedTasks(s => { const n = new Set(s); n.delete(id); return n; });
        if (activeTask?.id === id) setActiveTask(null);
        try {
            const response = await apiDelete(`/api/tasks/${id}`, null, { timeout: 30000 });
            if (!response.success) {
                throw new Error(response.error || 'Failed to delete task');
            }
        } catch (err: any) {
            console.error('Delete failed:', err);
            toast.error(err.message || 'Task delete failed');
            setTasks(oldTasks);
        }
    }, [tasks, activeTask]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setTasks(ts => {
                const oldIdx = ts.findIndex(t => t.id === active.id);
                const newIdx = ts.findIndex(t => t.id === over.id);
                return arrayMove(ts, oldIdx, newIdx);
            });
        }
    }, []);

    const bulkStatus = useCallback((status: TaskStatus) => {
        setTasks(ts => ts.map(t => selectedTasks.has(t.id) ? { ...t, status } : t));
        // Persist bulk status to DB
        Promise.all([...selectedTasks].map(id =>
            apiPatch(`/api/tasks/${id}`, null, { status }, { timeout: 30000 })
        )).catch(console.error);
        setSelectedTasks(new Set());
    }, [selectedTasks]);

    const bulkPriority = useCallback((priority: Priority) => {
        setTasks(ts => ts.map(t => selectedTasks.has(t.id) ? { ...t, priority } : t));
        Promise.all([...selectedTasks].map(id =>
            apiPatch(`/api/tasks/${id}`, null, { priority }, { timeout: 30000 })
        )).catch(console.error);
        setSelectedTasks(new Set());
    }, [selectedTasks]);

    const bulkAssign = useCallback((assignee: string) => {
        setTasks(ts => ts.map(t => selectedTasks.has(t.id) ? { ...t, assignee } : t));
        setSelectedTasks(new Set());
    }, [selectedTasks]);

    const bulkDelete = useCallback(async () => {
        const ids = [...selectedTasks];
        setTasks(ts => ts.filter(t => !selectedTasks.has(t.id)));
        setSelectedTasks(new Set());
        await Promise.all(ids.map(id => apiDelete(`/api/tasks/${id}`, null, { timeout: 30000 }))).catch(console.error);
    }, [selectedTasks]);

    const handleCreateSuccess = useCallback((newTask: Task) => {
        setTasks(ts => [newTask, ...ts]);
        setShowCreateModal(false);
    }, []);

    // Keyboard shortcut: press / to focus search
    const toggleSelectAll = () => {
        if (selectedTasks.size === filteredTasks.length) setSelectedTasks(new Set());
        else setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
    };

    return (
        <main style={{ display: 'flex', minHeight: '100vh', background: '#FAFBFC' }}>
            <Sidebar />
            <style>{`
                @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
                @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
                @keyframes spin { to{transform:rotate(360deg)} }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                .qf-btn { padding:6px 14px; border-radius:14px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; border:1px solid transparent; color:#42526E; background:transparent; }
                .qf-btn:hover { background:rgba(9,30,66,0.04); }
                .qf-btn.active { background:#F0F5FF; color:#0052CC; border-color:#B3D4FF; }
                .stat-card { background:white; border-radius:12px; padding:16px 18px; border:1px solid #E8EAED; cursor:pointer; transition:all 0.2s; }
                .stat-card:hover { border-color:#B3D4FF; transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,82,204,0.08); }
                .vw-btn { padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; border:none; background:transparent; display:flex; gap:6px; align-items:center; color:#6B778C; border-radius:6px; transition:0.15s; }
                .vw-btn.active { background:white; color:#0052CC; box-shadow:0 1px 3px rgba(9,30,66,0.08); }
                .t-head { font-size:11px; font-weight:700; color:#8A94A6; text-transform:uppercase; padding:10px 10px; letter-spacing:0.03em; }
            `}</style>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: '260px' }}>
                {/* Header */}
                <div style={{ padding: '24px 32px 16px', background: 'white', borderBottom: '1px solid #E8EAED' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ background: '#E6EFFF', color: '#0052CC', padding: 8, borderRadius: 10 }}><Inbox size={20} /></div>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#172B4D', letterSpacing: '-0.02em', margin: 0 }}>All Tasks</h1>
                            {loading && <span style={{ fontSize: '11px', color: '#8A94A6', fontWeight: 600 }}>Refreshing...</span>}
                        </div>
                        <div style={{ flex: 1, maxWidth: 600, margin: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                                <input id="task-search" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                    placeholder="Search tasks... ( / )"
                                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, border: '1px solid #E8EAED', background: '#FAFBFC', fontSize: '13px', outline: 'none' }} />
                            </div>

                            {/* Rotating Keyboard Tips */}
                            <div key={activeTipIndex} style={{ 
                                display: 'flex', alignItems: 'center', gap: 8, 
                                background: '#F4F5F7', padding: '7px 14px', borderRadius: 20, 
                                fontSize: '11px', fontWeight: 700, color: '#42526E', 
                                animation: 'slideUp 0.3s ease-out',
                                whiteSpace: 'nowrap',
                                border: '1px solid #EBECF0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}>
                                <span style={{ color: '#0052CC', fontSize: '10px', background: '#E6EFFF', padding: '2px 6px', borderRadius: 4, marginRight: 2 }}>PRO TIP</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {tips[activeTipIndex].icon}
                                    {tips[activeTipIndex].text}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ position: 'relative' }}>
                                <select 
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value as any)}
                                    style={{ padding: '8px 12px 8px 30px', border: '1px solid #E8EAED', background: 'white', borderRadius: 8, fontSize: '13px', fontWeight: 600, color: '#42526E', cursor: 'pointer', appearance: 'none', outline: 'none' }}
                                >
                                    <option value="All">All Statuses</option>
                                    {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                                <Filter size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8A94A6', pointerEvents: 'none' }} />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <select 
                                    value={groupBy}
                                    onChange={e => setGroupBy(e.target.value as any)}
                                    style={{ padding: '8px 12px 8px 30px', border: '1px solid #E8EAED', background: 'white', borderRadius: 8, fontSize: '13px', fontWeight: 600, color: '#42526E', cursor: 'pointer', appearance: 'none', outline: 'none' }}
                                >
                                    <option value="None">No Grouping</option>
                                    <option value="Status">Group: Status</option>
                                    <option value="Priority">Group: Priority</option>
                                    <option value="Project">Group: Project</option>
                                </select>
                                <Columns size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8A94A6', pointerEvents: 'none' }} />
                            </div>

                            <div style={{ width: 1, height: 24, background: '#E8EAED', margin: '0 4px' }} />
                            <button onClick={() => setShowCreateModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#0052CC', border: 'none', borderRadius: 8, fontSize: '13px', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,82,204,0.2)' }}>
                                <Plus size={16} /> Create Task
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['All', 'Assigned to Me', 'Due Today', 'Overdue', 'High Priority'].map(f => (
                                <button key={f} className={`qf-btn ${quickFilter === f ? 'active' : ''}`} onClick={() => setQuickFilter(f)}>{f}</button>
                            ))}
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', fontWeight: 600, color: focusMode ? '#0052CC' : '#6B778C', cursor: 'pointer', background: focusMode ? '#E6EFFF' : 'transparent', padding: '6px 12px', borderRadius: 14, transition: '0.2s' }}>
                            <Focus size={14} /> Focus Mode
                            <input type="checkbox" checked={focusMode} onChange={e => setFocusMode(e.target.checked)} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div style={{ margin: '16px 32px 0', padding: '12px 16px', background: '#FFEBE6', border: '1px solid #FF5630', borderRadius: 8, fontSize: '13px', color: '#FF5630', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                        {error}
                        <button onClick={() => fetchTasks()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF5630', fontWeight: 700, fontSize: '13px' }}>Retry</button>
                    </div>
                )}

                {/* Stats + AI Banner */}
                <div style={{ padding: '20px 32px 0' }}>
                    {showInsights && <AIInsightsBanner tasks={tasks} onDismiss={() => setShowInsights(false)} />}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 24 }}>
                        {stats.map((s, i) => (
                            <div key={i} className="stat-card">
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8A94A6', marginBottom: 8 }}>{s.label}</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{s.val}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 700, color: s.up ? '#36B37E' : '#FF5630', background: s.up ? '#E3FCEF' : '#FFEBE6', padding: '2px 6px', borderRadius: 12 }}>
                                        {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {s.trend}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View switcher */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ background: '#EBECF0', padding: 4, borderRadius: 8, display: 'inline-flex' }}>
                            {[{ v: 'Table', i: List }, { v: 'Kanban', i: LayoutGrid }, { v: 'Timeline', i: Columns }].map(m => (
                                <button key={m.v} className={`vw-btn ${viewMode === m.v ? 'active' : ''}`} onClick={() => setViewMode(m.v as typeof viewMode)}>
                                    <m.i size={14} /> {m.v}
                                </button>
                            ))}
                        </div>
                        {selectedTasks.size > 0 && (
                            <BulkToolbar count={selectedTasks.size} onClear={() => setSelectedTasks(new Set())}
                                onBulkStatus={bulkStatus} onBulkPriority={bulkPriority}
                                onBulkAssign={bulkAssign} onBulkDelete={bulkDelete} />
                        )}
                    </div>
                </div>

                {/* Table View */}
                {viewMode === 'Table' && (
                    <div style={{ flex: 1, margin: '0 32px 32px', background: 'white', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(9,30,66,0.04)' }}>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '28px 36px 1fr 180px 130px 110px 140px 130px 110px', alignItems: 'center', borderBottom: '1px solid #E8EAED', background: '#FAFBFC', position: 'sticky', top: 0, zIndex: 10 }}>
                            <div className="t-head" />
                            <div className="t-head" style={{ display: 'flex', justifyContent: 'center' }}>
                                <div onClick={toggleSelectAll} style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selectedTasks.size === filteredTasks.length && filteredTasks.length > 0 ? '#0052CC' : '#DFE1E6'}`, background: selectedTasks.size === filteredTasks.length && filteredTasks.length > 0 ? '#0052CC' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    {selectedTasks.size === filteredTasks.length && filteredTasks.length > 0 && <Check size={10} color="white" strokeWidth={3} />}
                                </div>
                            </div>
                            <div className="t-head">Task Name</div>
                            <div className="t-head">Project</div>
                            <div className="t-head">Status</div>
                            <div className="t-head">Priority</div>
                            <div className="t-head">Progress</div>
                            <div className="t-head">Assignee</div>
                            <div className="t-head">Due Date</div>
                        </div>

                        {/* Table Body */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {loading && tasks.length === 0 ? (
                                <div style={{ padding: 64, textAlign: 'center', color: '#8A94A6' }}>
                                    <div style={{ width: 40, height: 40, border: '3px solid #E8EAED', borderTopColor: '#0052CC', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
                                    Loading tasks...
                                </div>
                            ) : filteredTasks.length === 0 ? (
                                <div style={{ padding: 64, textAlign: 'center', color: '#8A94A6' }}>
                                    <div style={{ width: 64, height: 64, background: '#F4F5F7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <Bot size={28} color="#DFE1E6" />
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', marginBottom: 8 }}>No tasks found</div>
                                    <Inbox size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D', marginBottom: 4 }}>No tasks found</div>
                                    <div style={{ fontSize: '13px' }}>Try adjusting your search or filters</div>
                                </div>
                            ) : (
                                Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                                    <React.Fragment key={groupName}>
                                        {groupBy !== 'None' && (
                                            <div style={{ background: '#F4F5F7', padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#42526E', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #EBECF0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8A94A6' }} />
                                                {groupName} <span style={{ color: '#8A94A6', fontWeight: 600 }}>({groupTasks.length})</span>
                                            </div>
                                        )}
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={groupTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                                {groupTasks.map(task => (
                                                    <TaskRow
                                                        key={task.id}
                                                        task={task}
                                                        isSelected={selectedTasks.has(task.id)}
                                                        isExpanded={expandedRows.has(task.id)}
                                                        isSaving={savingIds.has(task.id)}
                                                        onSelect={toggleSelect}
                                                        onToggleExpand={toggleExpand}
                                                        onUpdate={handleUpdate}
                                                        onOpenDetails={setActiveTask}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    </React.Fragment>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Kanban / Timeline Views */}
                {viewMode === 'Kanban' && (
                    <div style={{ flex: 1, margin: '0 32px 32px', display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
                        <BoardView hideHeader={true} />
                    </div>
                )}
                {viewMode === 'Timeline' && (
                    <div style={{ flex: 1, margin: '0 32px 32px', display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
                        <TimelineView hideHeader={true} />
                    </div>
                )}
            </div>

            {/* Task Details Side Panel */}
            {activeTask && (
                <TaskDetailsPanel
                    key={activeTask.id}
                    task={activeTask}
                    onClose={() => setActiveTask(null)}
                    onUpdate={handleUpdate}
                />
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <CreateTaskModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
            )}
        </main>
    );
}
