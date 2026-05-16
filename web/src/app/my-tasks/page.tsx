"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import BoardView from '@/components/BoardView';
import TaskModal from '@/components/TaskModal';
import { useAuth } from '@/contexts/AuthContext';
import {
    CheckSquare,
    Circle,
    Clock,
    Filter,
    Search,
    MoreHorizontal,
    ChevronDown,
    Calendar,
    Table,
    Trello,
    Edit2,
    Trash2
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    project: { id?: string; name: string };
    assignee?: { name: string };
    description?: string;
    projectId?: string;
}

interface Project {
    id: string;
    name: string;
}

export default function MyTasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, IN_PROGRESS, DONE
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchMyTasks();
        fetchProjects();
    }, [user]);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_URL}/api/projects`);
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const fetchMyTasks = async (isSilent = false) => {
        if (!user) return;
        if (!isSilent) setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/tasks?assigneeId=${user.id}`);
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch my tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initialize Socket from live URL
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';
        const s = io(SOCKET_URL, {
            transports: ['websocket'],
            forceNew: true
        });
        setSocket(s);

        if (user?.tenantId) {
            s.emit('join-room', `tenant-${user.tenantId}`);
        }

        const handleUpdate = () => fetchMyTasks(true);
        
        s.on('TASK_CREATED', handleUpdate);
        s.on('TASK_UPDATED', handleUpdate);
        s.on('TASK_DELETED', handleUpdate);
        s.on('TASK_STATUS_CHANGED', handleUpdate);

        return () => {
            s.disconnect();
        };
    }, [user?.tenantId]);

    const handleTaskUpdate = async (taskId: string, newStatus: string) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error('Failed to update task status:', error);
            fetchMyTasks(); // Revert on failure
        }
    };

    const handleSaveTask = async (taskData: { title?: string; status?: string; priority?: string; dueDate?: string | null; description?: string; projectId?: string; assigneeId?: string }) => {
        const isEdit = !!editingTask;
        const url = isEdit
            ? `${API_URL}/api/tasks/${editingTask.id}`
            : `${API_URL}/api/tasks`;
        const method = isEdit ? 'PATCH' : 'POST';

        // For new tasks, assign to current user if not specified
        const dataToSend = {
            ...taskData,
            assigneeId: taskData.assigneeId || user?.id,
        };

        console.log('Saving task with data:', dataToSend);

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Task save error:', errorData);
            throw new Error(errorData.error || 'Failed to save task');
        }

        // Refresh tasks list
        await fetchMyTasks();
        setEditingTask(null);
    };

    const handleCreateClick = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Failed to delete task');
            }

            // Remove from local state
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task');
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'ALL') return task.status !== 'DONE';
        if (filter === 'DONE') return task.status === 'DONE';
        if (filter === 'REVIEW') return task.status === 'REVIEW';
        return task.status === filter;
    });

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'URGENT': return '#FF5630';
            case 'HIGH': return '#FFAB00';
            case 'MEDIUM': return '#0052CC';
            default: return '#36B37E';
        }
    };

    const statusMap: Record<string, string> = {
        'TODO': 'To Do',
        'IN_PROGRESS': 'In Progress',
        'REVIEW': 'Review',
        'DONE': 'Done',
        'BLOCKED': 'Blocked'
    };

    return (
        <ProtectedRoute>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />

                <main style={{ flex: 1, marginLeft: '260px', background: '#FFFFFF' }}>
                    {/* Header */}
                    <div style={{
                        padding: '24px 32px',
                        borderBottom: '1px solid #DFE1E6',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#172B4D' }}>My Tasks</h1>
                            <p style={{ fontSize: '14px', color: '#6B778C', marginTop: '4px' }}>
                                Tasks assigned to you across all projects
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '4px', background: '#EBECF0', borderRadius: '6px', padding: '4px', marginRight: '12px' }}>
                                <button onClick={() => setViewMode('table')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: 'none', borderRadius: '4px', background: viewMode === 'table' ? '#FFFFFF' : 'transparent', boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontSize: '13px', fontWeight: 500, color: viewMode === 'table' ? '#172B4D' : '#6B778C', cursor: 'pointer' }}>
                                    <Table size={14} />
                                    List
                                </button>
                                <button onClick={() => setViewMode('kanban')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: 'none', borderRadius: '4px', background: viewMode === 'kanban' ? '#FFFFFF' : 'transparent', boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontSize: '13px', fontWeight: 500, color: viewMode === 'kanban' ? '#172B4D' : '#6B778C', cursor: 'pointer' }}>
                                    <Trello size={14} />
                                    Board
                                </button>
                            </div>
                            <button style={{
                                padding: '8px 12px',
                                border: '1px solid #DFE1E6',
                                borderRadius: '6px',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '14px',
                                fontWeight: 500
                            }}>
                                <Filter size={16} color="#6B778C" />
                                Filter
                            </button>
                            <button
                                onClick={handleCreateClick}
                                style={{
                                    padding: '8px 16px',
                                    background: '#0052CC',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Create Task
                            </button>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    {viewMode === 'table' && (
                        <div style={{
                            padding: '0 32px',
                            borderBottom: '1px solid #DFE1E6',
                            display: 'flex',
                            gap: '24px'
                        }}>
                            {['ALL', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '16px 0',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: filter === f ? '2px solid #0052CC' : '2px solid transparent',
                                        color: filter === f ? '#0052CC' : '#6B778C',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {f === 'ALL' ? 'Active Tasks' : (f === 'IN_PROGRESS' ? 'In Progress' : (f === 'REVIEW' ? 'Review' : 'Completed'))}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content Area */}
                    <div style={{ padding: '24px 32px' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C' }}>Loading tasks...</div>
                        ) : viewMode === 'table' ? (
                            filteredTasks.length === 0 ? (
                                <div style={{
                                    padding: '60px',
                                    textAlign: 'center',
                                    background: '#F4F5F7',
                                    borderRadius: '8px',
                                    border: '1px dashed #DFE1E6'
                                }}>
                                    <CheckSquare size={48} color="#6B778C" style={{ opacity: 0.5, marginBottom: '16px' }} />
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#172B4D' }}>No tasks found</h3>
                                    <p style={{ fontSize: '14px', color: '#6B778C' }}>You're all caught up!</p>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #DFE1E6' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 0', color: '#6B778C', fontSize: '12px', fontWeight: 600, width: '30%' }}>TASK NAME</th>
                                            <th style={{ textAlign: 'left', padding: '12px 0', color: '#6B778C', fontSize: '12px', fontWeight: 600 }}>PROJECT</th>
                                            <th style={{ textAlign: 'left', padding: '12px 0', color: '#6B778C', fontSize: '12px', fontWeight: 600 }}>STATUS</th>
                                            <th style={{ textAlign: 'left', padding: '12px 0', color: '#6B778C', fontSize: '12px', fontWeight: 600 }}>PRIORITY</th>
                                            <th style={{ textAlign: 'left', padding: '12px 0', color: '#6B778C', fontSize: '12px', fontWeight: 600 }}>DUE DATE</th>
                                            <th style={{ textAlign: 'center', padding: '12px 0', color: '#6B778C', fontSize: '12px', fontWeight: 600, width: '100px' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.map(task => (
                                            <tr key={task.id} style={{
                                                borderBottom: '1px solid #EBECF0',
                                                opacity: task.status === 'DONE' ? 0.6 : 1
                                            }}>
                                                <td style={{ padding: '16px 0' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <button
                                                            onClick={() => handleTaskUpdate(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
                                                            style={{
                                                                background: task.status === 'DONE' ? '#36B37E' : 'none',
                                                                border: task.status === 'DONE' ? 'none' : '1.5px solid #DFE1E6',
                                                                borderRadius: '4px',
                                                                width: '18px',
                                                                height: '18px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            {task.status === 'DONE' && '✓'}
                                                        </button>
                                                        <span style={{
                                                            fontSize: '14px',
                                                            color: '#172B4D',
                                                            fontWeight: 500,
                                                            textDecoration: task.status === 'DONE' ? 'line-through' : 'none'
                                                        }}>
                                                            {task.title}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 0', fontSize: '14px', color: '#6B778C' }}>
                                                    {task.project?.name || 'No Project'}
                                                </td>
                                                <td style={{ padding: '16px 0' }}>
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => handleTaskUpdate(task.id, e.target.value)}
                                                        style={{
                                                            fontSize: '12px',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #DFE1E6',
                                                            background: '#F4F5F7',
                                                            color: '#42526E',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            outline: 'none'
                                                        }}
                                                    >
                                                        <option value="TODO">To Do</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="REVIEW">Review</option>
                                                        <option value="DONE">Done</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '16px 0' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(task.priority) }} />
                                                        <span style={{ fontSize: '13px', color: '#172B4D' }}>{task.priority}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 0' }}>
                                                    {task.dueDate ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B778C', fontSize: '13px' }}>
                                                            <Calendar size={14} />
                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '13px', color: '#C1C7D0' }}>--</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px 0', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleEditClick(task)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                color: '#6B778C',
                                                                padding: '4px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                            title="Edit task"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                color: '#FF5630',
                                                                padding: '4px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                            title="Delete task"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        ) : (
                            <BoardView
                                tasks={tasks}
                                onTaskUpdate={handleTaskUpdate}
                            />
                        )}
                    </div>
                </main>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
                onSave={handleSaveTask}
                task={editingTask}
                projects={projects}
            />
        </ProtectedRoute>
    );
}
