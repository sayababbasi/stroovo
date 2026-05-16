"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Plus,
    Calendar,
    MessageSquare,
    CheckCircle2,
    Clock,
    Flag,
    AlertCircle,
    ChevronDown,
    X,
    Search,
    Inbox,
    Columns,
    List
} from 'lucide-react';
import KanbanBoard from '@/components/KanbanBoard';
import type { Task, TaskStatus, Priority } from '@/components/tasks/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/components/tasks/types';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import TaskDetailsPanel from '@/components/tasks/TaskDetailsPanel';

interface Project { id: string; name: string; }
interface User { id: string; name: string | null; email: string; }

export function BoardView({ hideHeader }: { hideHeader?: boolean } = {}) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

    // Header States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'All'>('All');
    const [groupBy, setGroupBy] = useState<'Status' | 'Priority' | 'Project' | 'None'>('Status');
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    const fetchTasks = useCallback(async () => {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [uRes, pRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/projects')
                ]);
                if (uRes.ok) {
                    const uData = await uRes.json();
                    setUsers(Array.isArray(uData) ? uData : (uData.users || []));
                }
                if (pRes.ok) {
                    const pData = await pRes.json();
                    setProjects(Array.isArray(pData) ? pData : (pData.projects || []));
                }
            } catch (err) { console.error(err); }
        };
        fetchTasks();
        fetchData();
    }, [fetchTasks]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            if (e.key === '/') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.shiftKey && e.key.toUpperCase() === 'N') {
                e.preventDefault();
                setShowCreateModal(true);
            }
            if (e.key === 'Escape') {
                setActiveTask(null);
                setShowCreateModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleUpdate = useCallback(async (id: string, fieldOrUpdates: keyof Task | any, val?: unknown) => {
        const updates = typeof fieldOrUpdates === 'string' ? { [fieldOrUpdates]: val } : fieldOrUpdates;
        setSavingIds(s => new Set(s).add(id));
        setTasks(ts => ts.map(t => t.id === id ? { ...t, ...updates } : t));
        if (activeTask?.id === id) setActiveTask(prev => prev ? { ...prev, ...updates } : null);

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                const updated = await res.json();
                setTasks(ts => ts.map(t => t.id === id ? { ...t, ...updated } : t));
                if (activeTask?.id === id) setActiveTask(prev => prev ? { ...prev, ...updated } : null);
            }
        } catch (err) {
            console.error('Update failed:', err);
            fetchTasks();
        } finally {
            setSavingIds(s => { const n = new Set(s); n.delete(id); return n; });
        }
    }, [activeTask, fetchTasks]);

    const handleTaskDrop = useCallback(async (taskId: string, newStatus: string) => {
        handleUpdate(taskId, 'status', newStatus);
    }, [handleUpdate]);

    const handleCreateSuccess = (newTask: Task) => {
        setTasks(prev => [newTask, ...prev]);
        setShowCreateModal(false);
    };

    const filteredTasks = useMemo(() => tasks.filter(t => {
        // Hide subtasks from the board
        if (t.parentId) return false;

        const matchSearch = !searchQuery.trim() ||
            t.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
        const matchStatus = filterStatus === 'All' || t.status === filterStatus;
        return matchSearch && matchStatus;
    }), [tasks, searchQuery, filterStatus]);

    const getAvatarColor = (name: string | null | undefined) => {
        const colors = ['#FF5630', '#FFAB00', '#36B37E', '#00B8D9', '#6554C0', '#0052CC'];
        if (!name) return '#6B778C';
        return colors[name.charCodeAt(0) % colors.length];
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                <style>{`
                    body { overflow: hidden !important; margin: 0; }
                    .board-search-bar:focus-within { background: #FFFFFF !important; border-color: #4C9AFF !important; box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.15) !important; }
                    @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
                `}</style>

                {/* Header */}
                {!hideHeader && (
                    <div style={{ padding: '20px 32px 16px', background: 'white', borderBottom: '1px solid #E8EAED' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ background: '#E6EFFF', color: '#0052CC', padding: 8, borderRadius: 10 }}><Inbox size={20} /></div>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#172B4D', letterSpacing: '-0.02em', margin: 0 }}>Tasks Board</h1>
                            {loading && <span style={{ fontSize: '11px', color: '#8A94A6', fontWeight: 600 }}>Refreshing...</span>}
                        </div>

                        <div style={{ flex: 1, maxWidth: 600, margin: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
                                <input 
                                    ref={searchInputRef}
                                    id="task-search" 
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search tasks... ( / )"
                                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, border: '1px solid #E8EAED', background: '#FAFBFC', fontSize: '13px', outline: 'none' }} 
                                />
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
                            <div style={{ display: 'flex', marginRight: '8px', alignItems: 'center' }}>
                                {users.slice(0, 4).map((user, i) => (
                                    <div key={user.id} title={user.name || user.email} style={{ width: '32px', height: '32px', borderRadius: '50%', background: getAvatarColor(user.name), border: '2px solid white', marginLeft: i > 0 ? '-10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: 700, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        {user.name?.[0] || user.email[0].toUpperCase()}
                                    </div>
                                ))}
                                {users.length > 4 && (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#DFE1E6', border: '2px solid white', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#42526E', fontWeight: 600 }}>
                                        +{users.length - 4}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowCreateModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#0052CC', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,82,204,0.2)' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Plus size={16} /> New Task
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', background: '#F4F5F7', padding: 4, borderRadius: 10, border: '1px solid #E8EAED' }}>
                            <button onClick={() => setFilterStatus('All')} className={`vw-btn ${filterStatus === 'All' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, border: 'none', background: filterStatus === 'All' ? 'white' : 'transparent', borderRadius: 6, cursor: 'pointer', color: filterStatus === 'All' ? '#0052CC' : '#6B778C' }}>All Tasks</button>
                            {Object.keys(STATUS_LABELS).slice(0, 3).map((s) => (
                                <button key={s} onClick={() => setFilterStatus(s as any)} className={`vw-btn ${filterStatus === s ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, border: 'none', background: filterStatus === s ? 'white' : 'transparent', borderRadius: 6, cursor: 'pointer', color: filterStatus === s ? '#0052CC' : '#6B778C' }}>{STATUS_LABELS[s as TaskStatus]}</button>
                            ))}
                        </div>
                        
                        <div style={{ width: 1, height: 20, background: '#E8EAED' }} />

                        <div style={{ position: 'relative' }}>
                            <select 
                                value={groupBy}
                                onChange={e => setGroupBy(e.target.value as any)}
                                style={{ padding: '8px 12px', border: '1px solid #E8EAED', background: 'white', borderRadius: 8, fontSize: '13px', fontWeight: 600, color: '#42526E', cursor: 'pointer', outline: 'none' }}
                            >
                                <option value="Status">Group: Status</option>
                                <option value="Priority">Group: Priority</option>
                                <option value="Project">Group: Project</option>
                                <option value="None">No Grouping</option>
                            </select>
                        </div>
                    </div>
                </div>
                )}

                {/* Board Content */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <KanbanBoard 
                        tasks={filteredTasks}
                        onTaskUpdate={handleTaskDrop}
                        onAddTask={(status) => {
                            // Can pre-select status in create modal if we update CreateTaskModal props, 
                            // for now just open the generic one
                            setShowCreateModal(true);
                        }}
                        onEditTask={(task) => {
                            setActiveTask(task);
                        }}
                        onDeleteTask={async (task) => {
                            if (!confirm(`Delete "${task.title}"?`)) return;
                            try {
                                await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
                                fetchTasks();
                            } catch (err) { console.error(err); }
                        }}
                    />
                </div>

                {/* Shared Side Panel */}
                {activeTask && (
                    <TaskDetailsPanel
                        key={activeTask.id}
                        task={activeTask}
                        onClose={() => setActiveTask(null)}
                        onUpdate={handleUpdate}
                    />
                )}

                {/* Shared Create Modal */}
                {showCreateModal && (
                    <CreateTaskModal 
                        onClose={() => setShowCreateModal(false)} 
                        onSuccess={handleCreateSuccess} 
                    />
                )}
            </div>
    );
}

export default function BoardPage() {
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#FAFBFC' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <BoardView />
            </div>
        </div>
    );
}
