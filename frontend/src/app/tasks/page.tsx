"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import BoardView from '@/components/BoardView';
import CalendarView from '@/components/CalendarView';
import TimelineView from '@/components/TimelineView';
import TaskModal from '@/components/TaskModal';
import { useAuth } from '@/contexts/AuthContext';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Paperclip,
    Table,
    Trello,
    Calendar,
    MessageSquare,
    Clock,
    Flag,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';

import { Task } from '@/types';
// Remove local Task interface


const statusColumns = [
    { key: 'TODO', label: 'To Do', color: '#0052CC', icon: Clock },
    { key: 'IN_PROGRESS', label: 'In Progress', color: '#00B8D9', icon: Flag },
    { key: 'REVIEW', label: 'Review', color: '#6554C0', icon: Paperclip },
    { key: 'DONE', label: 'Done', color: '#36B37E', icon: CheckCircle2 },
];

export default function TasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'timeline' | 'calendar'>('table');

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchProjects();
        }
    }, [user]);

    const fetchTasks = () => {
        if (!user) return;
        setLoading(true);
        // Fetch tasks for the current user (matches "My Tasks" behavior)
        fetch(`${API_URL}/api/tasks?assigneeId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch tasks:', error);
                setLoading(false);
            });
    };

    const fetchProjects = () => {
        fetch(`${API_URL}/api/projects`)
            .then(res => res.json())
            .then(data => setProjects(Array.isArray(data) ? data : []))
            .catch(err => console.error('Failed to fetch projects:', err));
    };

    const handleCreateTask = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData: Partial<Task>) => {
        try {
            const url = selectedTask
                ? `${API_URL}/api/tasks/${selectedTask.id}`
                : `${API_URL}/api/tasks`;

            const method = selectedTask ? 'PATCH' : 'POST';

            // Clean up data before sending
            const { status, title, priority, dueDate, description, projectId } = taskData;
            
            // Add assigneeId if creating new task
            const payload = { 
                status, 
                title, 
                priority, 
                dueDate, 
                description, 
                projectId,
                assigneeId: selectedTask ? undefined : user?.id
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchTasks(); // Reload to get fresh data
            } else {
                console.error('Failed to save task');
            }
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DONE': return { bg: '#36B37E', fg: '#FFFFFF' };
            case 'IN_PROGRESS': return { bg: '#0747A6', fg: '#FFFFFF' };
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
        return tasks.filter(task => task.status === status);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                {/* Header */}
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#172B4D' }}>All Tasks</h1>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #DFE1E6', borderRadius: '6px', background: '#FFFFFF', fontSize: '14px', fontWeight: 500, color: '#42526E', cursor: 'pointer' }}>
                                <Filter size={16} />
                                Filter
                            </button>
                        </div>
                        <button onClick={handleCreateTask} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#0052CC', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                            <Plus size={16} />
                            Create
                        </button>
                    </div>
                </div>

                {/* Filter Bar with View Toggle */}
                <div style={{ padding: '12px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                        <input type="text" placeholder="Search tasks..." style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '4px', background: '#EBECF0', borderRadius: '6px', padding: '4px' }}>
                        <button onClick={() => setViewMode('table')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', border: 'none', borderRadius: '4px', background: viewMode === 'table' ? '#FFFFFF' : 'transparent', boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontSize: '13px', fontWeight: 600, color: (viewMode === 'table' ? '#172B4D' : '#6B778C'), cursor: 'pointer' }}>
                            <Table size={14} />
                            Table view
                        </button>
                        <button onClick={() => setViewMode('kanban')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', border: 'none', borderRadius: '4px', background: viewMode === 'kanban' ? '#FFFFFF' : 'transparent', boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontSize: '13px', fontWeight: 600, color: (viewMode === 'kanban' ? '#172B4D' : '#6B778C'), cursor: 'pointer' }}>
                            <Trello size={14} />
                            Kanban board
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6B778C', fontWeight: 500 }}>
                        <div>Show: <span style={{ color: '#0052CC', cursor: 'pointer' }}>All active</span></div>
                        <div>Group by: <span style={{ color: '#0052CC', cursor: 'pointer' }}>None</span></div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '24px 32px' }}>
                    {viewMode === 'table' ? (
                        <div style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #DFE1E6', overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 120px 100px 140px 140px 48px', padding: '12px 16px', background: '#F4F5F7', borderBottom: '1px solid #DFE1E6', fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <div>NAME</div><div>PROJECT</div><div>STATUS</div><div>PRIORITY</div><div>PROGRESS</div><div>ASSIGNEE</div><div></div>
                            </div>
                            {loading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C' }}>Loading tasks...</div>
                            ) : (
                                tasks.map((task) => {
                                    const status = getStatusStyle(task.status);
                                    const priority = getPriorityStyle(task.priority);
                                    return (
                                        <div key={task.id}
                                            onClick={() => handleEditTask(task)}
                                            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 120px 100px 140px 140px 48px', padding: '14px 16px', borderBottom: '1px solid #EBECF0', fontSize: '13px', alignItems: 'center', cursor: 'pointer' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input type="checkbox" onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ width: '16px', height: '16px', border: '1px solid #DFE1E6', borderRadius: '2px' }} />
                                                <span style={{ fontWeight: 500, color: '#172B4D' }}>{task.title}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#0052CC', fontWeight: 500 }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '8px', height: '12px', background: '#0052CC', borderRadius: '2px' }}></div>
                                                    {task.project?.name}
                                                </span>
                                            </div>
                                            <div><span style={{ padding: '4px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: 700, background: status.bg, color: status.fg }}>{task.status.replace('_', ' ')}</span></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#42526E' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: priority.color }}></div>
                                                <span style={{ color: priority.color }}>{priority.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ flex: 1, height: '6px', background: '#F4F5F7', borderRadius: '3px' }}><div style={{ width: `${task.progress}%`, height: '100%', background: '#36B37E', borderRadius: '3px' }}></div></div>
                                                <span style={{ fontSize: '12px', color: '#6B778C', minWidth: '30px' }}>{task.progress}%</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: getAvatarColor(task.assignee?.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{task.assignee?.name?.[0] || 'U'}</div>
                                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#42526E' }}>{task.assignee?.name || 'Project'}</span>
                                            </div>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><MoreHorizontal size={16} /></button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : viewMode === 'kanban' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#172B4D' }}>Kanban Board</h1>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', marginLeft: '12px' }}>
                                        {['S', 'A', 'M', 'D'].map((initial, i) => (
                                            <div key={i} style={{ 
                                                width: '32px', 
                                                height: '32px', 
                                                borderRadius: '50%', 
                                                background: ['#FF5630', '#FFAB00', '#36B37E', '#0052CC'][i], 
                                                color: 'white', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontSize: '12px', 
                                                fontWeight: 700, 
                                                border: '2px solid white',
                                                marginLeft: i === 0 ? 0 : '-12px'
                                            }}>
                                                {initial}
                                            </div>
                                        ))}
                                        <div style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '50%', 
                                            background: '#EBECF0', 
                                            color: '#42526E', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '11px', 
                                            fontWeight: 600, 
                                            border: '2px solid white',
                                            marginLeft: '-12px'
                                        }}>+3</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={{ padding: '8px 16px', border: '1px solid #DFE1E6', borderRadius: '6px', background: 'white', fontSize: '14px', fontWeight: 500, color: '#42526E', cursor: 'pointer' }}>Group</button>
                                        <button style={{ padding: '8px 16px', border: '1px solid #DFE1E6', borderRadius: '6px', background: 'white', fontSize: '14px', fontWeight: 500, color: '#42526E', cursor: 'pointer' }}>Filter</button>
                                        <button onClick={handleCreateTask} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none', borderRadius: '6px', background: '#0052CC', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                            <Plus size={16} />
                                            Add new
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <BoardView
                                tasks={tasks.map(t => ({
                                    ...t,
                                    assignee: t.assignee ? { name: t.assignee.name || 'Unknown' } : undefined
                                }))}
                                onTaskUpdate={async (taskId: string, newStatus: string) => {
                                    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
                                    setTasks(updatedTasks);
                                    try {
                                        await fetch(`${API_URL}/api/tasks/${taskId}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: newStatus })
                                        });
                                    } catch (error) {
                                        console.error('Failed to update task status:', error);
                                    }
                                }}
                            />
                        </div>
                    ) : viewMode === 'timeline' ? (
                        <TimelineView tasks={tasks.map(t => ({
                            ...t,
                            assignee: t.assignee ? { name: t.assignee.name || 'Unknown' } : null
                        }))} />
                    ) : (
                        <CalendarView 
                            tasks={tasks.map(t => ({
                                ...t,
                                assignee: t.assignee ? { name: t.assignee.name || 'Unknown' } : undefined
                            }))} 
                            onTaskClick={handleEditTask}
                        />
                    )}
                </div>

                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                    onSave={handleSaveTask}
                    projects={projects}
                />
            </main>
        </div>
    );
}
