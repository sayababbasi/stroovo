"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical, ChevronRight, MessageSquare, Paperclip,
    User, MoreHorizontal, AlertTriangle, Bot, Check, Loader2, Trash2, ExternalLink, ChevronDown, GitBranch
} from 'lucide-react';
import type { Task, TaskStatus, Priority, RiskLevel } from './types';
import {
    STATUS_COLORS, STATUS_BG, STATUS_LABELS,
    PRIORITY_COLORS, PRIORITY_LABELS,
    RISK_CONFIG, HEALTH_COLORS, STATUSES, PRIORITIES
} from './types';

function Avatar({ name, size = 24 }: { name: string; size?: number }) {
    const palette = ['#0052CC', '#36B37E', '#FF5630', '#FFAB00', '#6554C0', '#00B8D9'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return (
        <div title={name} style={{
            width: size, height: size, borderRadius: '50%',
            background: palette[Math.abs(h) % palette.length],
            color: 'white', fontSize: size * 0.38, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
            {name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
        </div>
    );
}

function StatusPill({ value, onChange }: { value: TaskStatus; onChange: (v: TaskStatus) => void }) {
    const [open, setOpen] = useState(false);
    const bg = STATUS_BG[value] || '#F4F5F7';
    const color = STATUS_COLORS[value] || '#42526E';
    return (
        <div style={{ position: 'relative' }}>
            <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{
                fontSize: '11px', fontWeight: 700, padding: '0 10px', borderRadius: 20,
                background: bg, color, border: `1px solid ${color}50`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '120px', height: '26px'
            }}>
                <span style={{ flex: 1, textAlign: 'center' }}>{STATUS_LABELS[value] || value}</span>
                <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
            </button>
            {open && (
                <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
                    background: 'white', borderRadius: 10, border: '1px solid #E8EAED',
                    boxShadow: '0 12px 40px rgba(9,30,66,0.18)', padding: 4, minWidth: 150
                }}>
                    {STATUSES.map(s => (
                        <button key={s} onClick={() => { onChange(s); setOpen(false); }} style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '7px 12px', border: 'none', cursor: 'pointer', borderRadius: 7,
                            background: s === value ? '#F0F5FF' : 'transparent',
                            fontSize: '12px', fontWeight: 600, color: STATUS_COLORS[s] || '#42526E'
                        }}>{STATUS_LABELS[s]}</button>
                    ))}
                </div>
            )}
        </div>
    );
}

function PriorityChip({ value, onChange }: { value: Priority; onChange: (v: Priority) => void }) {
    const [open, setOpen] = useState(false);
    const color = PRIORITY_COLORS[value] || '#42526E';
    return (
        <div style={{ position: 'relative' }}>
            <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700, color, padding: '2px 0'
            }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 0 2px ${color}33` }} />
                {PRIORITY_LABELS[value] || value}
            </button>
            {open && (
                <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
                    background: 'white', borderRadius: 10, border: '1px solid #E8EAED',
                    boxShadow: '0 12px 40px rgba(9,30,66,0.18)', padding: 4, minWidth: 120
                }}>
                    {PRIORITIES.map(p => (
                        <button key={p} onClick={() => { onChange(p); setOpen(false); }} style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                            padding: '7px 12px', border: 'none', cursor: 'pointer', borderRadius: 7,
                            background: p === value ? '#F0F5FF' : 'transparent',
                            fontSize: '12px', fontWeight: 700, color: PRIORITY_COLORS[p] || '#42526E'
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_COLORS[p] || '#42526E' }} />
                            {PRIORITY_LABELS[p]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface TaskRowProps {
    task: Task;
    isSelected: boolean;
    isExpanded: boolean;
    isSaving: boolean;
    onSelect: (id: string, e: React.MouseEvent) => void;
    onToggleExpand: (id: string, e: React.MouseEvent) => void;
    onUpdate: (id: string, fieldOrUpdates: keyof Task | any, value?: unknown) => void;
    onOpenDetails: (task: Task) => void;
    onDelete: (id: string) => void;
}

const TaskRow = memo(function TaskRow({
    task, isSelected, isExpanded, isSaving,
    onSelect, onToggleExpand, onUpdate, onOpenDetails, onDelete
}: TaskRowProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleVal, setTitleVal] = useState(task.title);
    const [hovered, setHovered] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const handleTitleSubmit = useCallback(() => {
        if (titleVal.trim() && titleVal !== task.title) onUpdate(task.id, 'title', titleVal.trim());
        else setTitleVal(task.title);
        setEditingTitle(false);
    }, [task.id, task.title, titleVal, onUpdate]);

    const handleSubtaskToggle = async (subtaskId: string, newStatus: TaskStatus) => {
        const updatedSubtasks = subtasks.map((st: any) => st.id === subtaskId ? { ...st, status: newStatus } : st);
        setSubtasks(updatedSubtasks);

        // Optimistically update parent progress AND subtasks
        const doneCount = updatedSubtasks.filter((s: any) => s.status === 'DONE').length;
        const totalCount = updatedSubtasks.length;
        const newProgress = Math.round((doneCount / totalCount) * 100);
        
        onUpdate(task.id, { 
            progress: newProgress, 
            subTasks: updatedSubtasks 
        } as any);

        try {
            const res = await fetch(`/api/tasks/${subtaskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed');
        } catch (err) {
            setSubtasks(subtasks); // Revert local
            onUpdate(task.id, { 
                progress: task.progress, 
                subTasks: task.subtasks || (task as any).subTasks 
            } as any);
        }
    };

    const handleSubtaskDelete = async (subtaskId: string) => {
        const previousSubtasks = [...subtasks];
        setSubtasks(subtasks.filter((st: any) => st.id !== subtaskId));
        try {
            const res = await fetch(`/api/tasks/${subtaskId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
        } catch (err) {
            setSubtasks(previousSubtasks);
        }
    };
    const rawAi = task.ai || (task as any).aiInsights || {};
    const ai = {
        riskLevel: (rawAi.riskLevel?.toLowerCase() || 'low') as RiskLevel,
        delayProbability: (task as any).delayProbability || rawAi.delayProbability || 0,
        overloadWarning: rawAi.overloadWarning || false,
    };
    const risk = RISK_CONFIG[ai.riskLevel] || RISK_CONFIG['low'];

    // Safe name extraction for object relations from Prisma
    const projectName = typeof task.project === 'object' && task.project
        ? (task.project as any).name || 'No Project'
        : task.project || 'No Project';
    const assigneeName = typeof task.assignee === 'object' && task.assignee
        ? (task.assignee as any).name || 'Unassigned'
        : (task.assignee as string) || 'Unassigned';

    // Subtasks come as subTasks from Prisma
    const [subtasks, setSubtasks] = useState<any[]>(task.subtasks || (task as any).subTasks || []);

    // Sync subtasks if task prop changes
    useEffect(() => {
        const freshSubtasks = task.subtasks || (task as any).subTasks || [];
        setSubtasks(freshSubtasks);
    }, [task.id, task.subtasks, (task as any).subTasks]);

    // Comment / file counts from _count or legacy number fields
    const commentCount = (task as any)._count?.comments ?? task.comments ?? 0;
    const fileCount = (task as any)._count?.files ?? task.files ?? 0;

    // Health color safe access
    const healthColor = task.health ? (HEALTH_COLORS[task.health] || '#36B37E') : '#36B37E';

    const subtasksDone = subtasks.filter((s: any) => s.status === 'DONE').length;

    // Due date formatting
    const dueDateDisplay = (() => {
        if (!task.dueDate) return '—';
        const d = new Date(task.dueDate);
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        const isYesterday = d.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString();
        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    })();
    const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date(new Date().toDateString()) : false;

    return (
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition: transition || undefined }}>
            {/* Main Row */}
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => onOpenDetails(task)}
                style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 36px 1fr 180px 130px 110px 140px 130px 110px',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(9,30,66,0.05)',
                    borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#DFE1E6'}`,
                    background: isDragging ? '#EEF4FF' : isSelected ? '#F0F5FF' : hovered ? '#FAFBFF' : 'white',
                    minHeight: 52,
                    position: 'relative',
                    cursor: 'pointer',
                    opacity: isDragging ? 0.85 : 1,
                    boxShadow: isDragging ? '0 8px 30px rgba(0,82,204,0.18)' : 'none',
                    transition: 'background 0.1s, box-shadow 0.15s',
                    zIndex: isDragging ? 10 : 'auto',
                }}
            >
                {/* Drag handle */}
                <div {...attributes} {...listeners} onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', cursor: 'grab', color: hovered ? '#8A94A6' : 'transparent', transition: 'color 0.15s' }}>
                    <GripVertical size={14} />
                </div>

                {/* Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { e.stopPropagation(); onSelect(task.id, e); }}>
                    <div style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${isSelected ? '#0052CC' : '#DFE1E6'}`,
                        background: isSelected ? '#0052CC' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.12s', cursor: 'pointer'
                    }}>
                        {isSelected && <Check size={10} color="white" strokeWidth={3} />}
                    </div>
                </div>

                {/* Title */}
                <div style={{ padding: '0 20px 0 10px', display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
                    <button onClick={e => { e.stopPropagation(); onToggleExpand(task.id, e); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A94A6', padding: 2, flexShrink: 0 }}>
                        <ChevronRight size={13} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
                    </button>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: healthColor, flexShrink: 0, boxShadow: `0 0 0 2px ${healthColor}30` }} />
                    {editingTitle ? (
                        <div onClick={e => e.stopPropagation()} style={{ flex: 1, display: 'flex' }}>
                            <input ref={titleRef} value={titleVal}
                                onChange={e => setTitleVal(e.target.value)}
                                onBlur={handleTitleSubmit}
                                onKeyDown={e => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') { setTitleVal(task.title); setEditingTitle(false); } }}
                                autoFocus style={{ flex: 1, border: '1.5px solid #0052CC', borderRadius: 6, padding: '3px 8px', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
                        </div>
                    ) : (
                        <span 
                            onDoubleClick={e => { e.stopPropagation(); setEditingTitle(true); }}
                            onClick={e => { e.stopPropagation(); onOpenDetails(task); }}
                            style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                        >
                            {task.title}
                        </span>
                    )}
                    {isSaving && <Loader2 size={11} color="#0052CC" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />}
                    {(commentCount > 0 || fileCount > 0 || subtasks.length > 0) && (
                        <div onClick={e => { e.stopPropagation(); onOpenDetails(task); }} style={{ display: 'flex', gap: 7, color: '#8A94A6', fontSize: '11px', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}>
                            {subtasks.length > 0 && (
                                <span style={{ display: 'flex', gap: 2, alignItems: 'center', background: '#F4F5F7', padding: '2px 6px', borderRadius: 10, color: subtasksDone === subtasks.length ? '#36B37E' : '#42526E', fontWeight: 600 }}>
                                    <GitBranch size={10} />
                                    {subtasksDone}/{subtasks.length}
                                </span>
                            )}
                            {commentCount > 0 && <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}><MessageSquare size={10} />{commentCount}</span>}
                            {fileCount > 0 && <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}><Paperclip size={10} />{fileCount}</span>}
                        </div>
                    )}
                </div>

                {/* Project */}
                <div style={{ padding: '0 10px', fontSize: '12px', color: '#42526E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {projectName}
                </div>

                {/* Status */}
                <div style={{ padding: '0 6px' }} onClick={e => e.stopPropagation()}>
                    <StatusPill value={task.status} onChange={v => onUpdate(task.id, 'status', v)} />
                </div>

                {/* Priority */}
                <div style={{ padding: '0 8px' }} onClick={e => e.stopPropagation()}>
                    <PriorityChip value={task.priority} onChange={v => onUpdate(task.id, 'priority', v)} />
                </div>

                {/* Progress */}
                <div style={{ padding: '0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 5, background: '#EBECF0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${task.progress || 0}%`, height: '100%', borderRadius: 3, transition: 'width 0.3s ease', background: (task.progress || 0) === 100 ? '#36B37E' : (task.progress || 0) > 60 ? '#0052CC' : '#FFAB00' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#6B778C', fontWeight: 600, minWidth: 24 }}>{task.progress || 0}%</span>
                </div>

                {/* Assignee */}
                <div style={{ padding: '0 10px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <Avatar name={assigneeName} size={22} />
                    <span style={{ fontSize: '12px', color: '#172B4D', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assigneeName}</span>
                </div>

                {/* Due Date */}
                <div style={{ padding: '0 10px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, color: isOverdue ? '#FF5630' : dueDateDisplay === 'Today' ? '#0052CC' : '#6B778C' }}>
                    {isOverdue && <AlertTriangle size={11} />}
                    {dueDateDisplay}
                </div>
            </div>

            {/* Expanded subtasks */}
            {isExpanded && subtasks.length > 0 && (
                <div style={{ background: '#FAFBFC', borderBottom: '1px solid #EBECF0', padding: '12px 16px 12px 80px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A94A6', textTransform: 'uppercase', marginBottom: 8 }}>
                        Subtasks · {subtasks.filter((s: any) => s.status === 'DONE').length}/{subtasks.length}
                    </div>
                    {subtasks.map((st: any) => (
                        <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: '13px', color: st.status === 'DONE' ? '#8A94A6' : '#172B4D', textDecoration: st.status === 'DONE' ? 'line-through' : 'none' }}>
                            <input 
                                type="checkbox" 
                                checked={st.status === 'DONE'} 
                                onChange={e => handleSubtaskToggle(st.id, e.target.checked ? 'DONE' : 'TODO')}
                                style={{ accentColor: '#0052CC', width: 14, height: 14, cursor: 'pointer' }} 
                            />
                            <span style={{ flex: 1 }}>{st.title}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleSubtaskDelete(st.id); }}
                                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#8A94A6', opacity: 0.6 }}
                                onMouseOver={e => e.currentTarget.style.color = '#FF5630'}
                                onMouseOut={e => e.currentTarget.style.color = '#8A94A6'}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default TaskRow;
