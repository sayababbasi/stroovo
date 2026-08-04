"use client";

import React from 'react';
import { ProjectTask } from './TaskBoard';
import { ChevronDown, MoreHorizontal, MessageSquare, Paperclip, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function ListView({ 
    tasks,
    onTaskUpdate,
    onTaskClick
}: { 
    tasks: ProjectTask[],
    onTaskUpdate?: (taskId: string, field: string, value: any) => void,
    onTaskClick?: (task: ProjectTask) => void
}) {
    // Group tasks by status
    const groupedTasks = {
        TODO: tasks.filter(t => t.status === 'TODO'),
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
        REVIEW: tasks.filter(t => t.status === 'REVIEW'),
        DONE: tasks.filter(t => t.status === 'DONE'),
        BACKLOG: tasks.filter(t => t.status === 'BACKLOG'),
    };

    const statusColors: any = {
        TODO: '#0052CC',
        IN_PROGRESS: '#F59E0B',
        REVIEW: '#8B5CF6',
        DONE: '#10B981',
        BACKLOG: '#6B778C'
    };

    const getPriorityColor = (p: string) => {
        if (p === 'HIGH') return '#EF4444';
        if (p === 'MEDIUM') return '#F59E0B';
        if (p === 'LOW') return '#10B981';
        return '#6B778C';
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', background: 'white', border: '1px solid #DFE1E6', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr style={{ background: '#F4F5F7', borderBottom: '1px solid #DFE1E6', textAlign: 'left', color: '#6B778C', fontWeight: 600 }}>
                        <th style={{ padding: '12px 24px', width: '40%' }}>Task Name</th>
                        <th style={{ padding: '12px 16px', width: '15%' }}>Assignee</th>
                        <th style={{ padding: '12px 16px', width: '15%' }}>Due Date</th>
                        <th style={{ padding: '12px 16px', width: '10%' }}>Priority</th>
                        <th style={{ padding: '12px 16px', width: '10%' }}>Status</th>
                        <th style={{ padding: '12px 24px', width: '10%', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                        <React.Fragment key={status}>
                            {/* Group Header */}
                            {statusTasks.length > 0 && (
                                <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #DFE1E6' }}>
                                    <td colSpan={6} style={{ padding: '12px 24px', fontWeight: 700, color: statusColors[status] }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <ChevronDown size={14} />
                                            {status.replace('_', ' ')}
                                            <span style={{ background: '#DFE1E6', color: '#42526E', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>{statusTasks.length}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {/* Tasks */}
                            {statusTasks.map(task => (
                                <tr 
                                    key={task.id} 
                                    style={{ borderBottom: '1px solid #DFE1E6', cursor: 'pointer' }}
                                    className="hover-row"
                                    onClick={() => onTaskClick && onTaskClick(task)}
                                >
                                    <td style={{ padding: '12px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 2, background: statusColors[task.status] }} />
                                            <div>
                                                <div style={{ color: '#172B4D', fontWeight: 600, marginBottom: 2 }}>{task.title}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#8A94A6' }}>
                                                    {task.type === 'MILESTONE' && <span style={{ color: '#8B5CF6', fontWeight: 700 }}>Milestone</span>}
                                                    {(task._count?.comments || 0) > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} /> {task._count?.comments}</span>}
                                                    {(task._count?.files || 0) > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Paperclip size={12} /> {task._count?.files}</span>}
                                                    {(task.delayProbability || 0) > 50 && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#EF4444' }}><AlertTriangle size={12} /> High Risk</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {task.assignee ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <img src={task.assignee.image || `https://ui-avatars.com/api/?name=${task.assignee.name}`} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                                <span style={{ color: '#42526E' }}>{task.assignee.name}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#8A94A6' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#42526E' }}>
                                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ color: getPriorityColor(task.priority), fontWeight: 700, fontSize: 11 }}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <select 
                                            value={task.status} 
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onTaskUpdate && onTaskUpdate(task.id, 'status', e.target.value);
                                            }}
                                            style={{ 
                                                padding: '4px 8px', borderRadius: 4, border: '1px solid #DFE1E6', 
                                                fontSize: 12, fontWeight: 600, color: statusColors[task.status], 
                                                background: `${statusColors[task.status]}15`, cursor: 'pointer', outline: 'none'
                                            }}
                                        >
                                            <option value="TODO">TODO</option>
                                            <option value="IN_PROGRESS">IN PROGRESS</option>
                                            <option value="REVIEW">REVIEW</option>
                                            <option value="DONE">DONE</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }} onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            <style>{`
                .hover-row:hover { background: #F4F5F7; }
            `}</style>
        </div>
    );
}
