"use client";

import React, { useState, memo, useCallback } from 'react';
import {
    MessageSquare,
    Paperclip,
    Edit2,
    UserPlus,
    CheckCircle2,
    Calendar,
    CheckSquare
} from 'lucide-react';
import { Task } from '@/types';
import { useSortable } from '@dnd-kit/sortable';

/* ── Types ── */

interface KanbanCardProps {
    task: Task;
    onClick?: (task: Task) => void;
    onEdit?: (task: Task) => void;
    onAssign?: (task: Task) => void;
    onChangeStatus?: (task: Task) => void;
    onComment?: (task: Task) => void;
    onDelete?: (task: Task) => void;
}

/* ── Style helpers (static — no re-computation) ── */

const PRIORITY: Record<string, { color: string; bg: string; label: string }> = {
    URGENT: { color: '#e34935', bg: '#fff1f0', label: 'Urgent' },
    HIGH:   { color: '#ff8b00', bg: '#fff7e6', label: 'High' },
    MEDIUM: { color: '#36b37e', bg: '#e6fcf5', label: 'Medium' },
    LOW:    { color: '#8993a4', bg: '#f1f3f7', label: 'Low' },
};

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
    BUG:     { bg: '#fff1f0', color: '#bf2600' },
    STORY:   { bg: '#f0eeff', color: '#403294' },
    FEATURE: { bg: '#e8f0fe', color: '#0747a6' },
    DESIGN:  { bg: '#e6fcf5', color: '#006644' },
};
const DEFAULT_TYPE = { bg: '#f1f3f7', color: '#44546f' };

const AVATAR_COLORS = ['#0052CC', '#36B37E', '#FFAB00', '#FF5630', '#00B8D9', '#6554C0'];
const getAvatarColor = (name?: string | null) => {
    if (!name) return '#c1c7d0';
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

/* ── Component ── */

function KanbanCard({
    task,
    onClick,
    onEdit,
    onAssign,
    onChangeStatus,
    onComment,
}: KanbanCardProps) {
    const [hovered, setHovered] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id || '',
        data: { type: 'Task', task },
    });

    /* GPU‑accelerated translate3d — avoids layout thrash */
    const tx = transform?.x ?? 0;
    const ty = transform?.y ?? 0;
    const cardStyle: React.CSSProperties = {
        transform: `translate3d(${tx}px,${ty}px,0)`,
        transition: transition || undefined,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1000 : 1,
        willChange: isDragging ? 'transform' : 'auto',
        backfaceVisibility: 'hidden',
    };

    const ps = PRIORITY[task.priority?.toUpperCase() || ''] || PRIORITY.LOW;
    const ts = TYPE_STYLE[task.type?.toUpperCase() || ''] || DEFAULT_TYPE;
    const progress = task.progress || 0;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
    const subtaskTotal = task._count?.subTasks || 0;
    const subtaskDone = task.subTasks?.filter(s => s.status === 'DONE').length || 0;

    const stop = useCallback((e: React.MouseEvent, fn?: (t: Task) => void) => {
        e.stopPropagation();
        fn?.(task);
    }, [task]);

    return (
        <div
            ref={setNodeRef}
            style={cardStyle}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`kc ${isDragging ? 'kc-drag' : ''}`}
        >
            <style jsx>{`
                .kc {
                    background: #ffffff;
                    border: 1px solid #e3e6ee;
                    border-radius: 12px;
                    padding: 13px 15px;
                    cursor: grab;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                    transition: box-shadow 0.15s ease, border-color 0.12s;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                    user-select: none;
                }
                .kc:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                    border-color: #d0d4dc;
                }
                .kc.kc-drag {
                    box-shadow: 0 14px 36px rgba(0,0,0,0.12);
                    cursor: grabbing;
                }

                .kc-hov {
                    position: absolute;
                    top: 7px;
                    right: 7px;
                    display: flex;
                    gap: 1px;
                    background: rgba(255,255,255,0.97);
                    padding: 2px;
                    border-radius: 7px;
                    opacity: ${hovered ? 1 : 0};
                    transform: ${hovered ? 'translateY(0)' : 'translateY(-3px)'};
                    transition: all 0.12s ease;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                    z-index: 10;
                    border: 1px solid #e3e6ee;
                }
                .kc-ab {
                    padding: 4px;
                    border-radius: 5px;
                    color: #6b778c;
                    display: flex;
                    align-items: center;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.08s;
                }
                .kc-ab:hover { background: #f1f3f7; color: #172b4d; }

                .kc-proj {
                    font-size: 10px;
                    font-weight: 600;
                    color: #8993a4;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .kc-ttl {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #172b4d;
                    line-height: 1.4;
                    margin: 1px 0 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .kc-tags { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
                .kc-pill {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.25px;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .kc-prog-bg {
                    height: 3px;
                    background: #e3e6ee;
                    border-radius: 3px;
                    overflow: hidden;
                }
                .kc-prog-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.4s ease;
                }

                .kc-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 1px;
                }
                .kc-ml { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }
                .kc-mi {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 11px;
                    font-weight: 500;
                    color: #8993a4;
                }
                .kc-mi.od { color: #e34935; font-weight: 600; }

                .kc-av {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 700;
                    color: white;
                    border: 2px solid #fff;
                    box-shadow: 0 0 0 1px #e3e6ee;
                    flex-shrink: 0;
                }
            `}</style>

            {/* Hover actions */}
            <div className="kc-hov">
                <button className="kc-ab" onClick={(e) => stop(e, onEdit)} title="Edit"><Edit2 size={12} /></button>
                <button className="kc-ab" onClick={(e) => stop(e, onAssign)} title="Assign"><UserPlus size={12} /></button>
                <button className="kc-ab" onClick={(e) => stop(e, onChangeStatus)} title="Status"><CheckCircle2 size={12} /></button>
                <button className="kc-ab" onClick={(e) => stop(e, onComment)} title="Comment"><MessageSquare size={12} /></button>
            </div>

            {/* Header */}
            <div style={{ paddingRight: hovered ? '90px' : 0, transition: 'padding 0.12s' }}>
                <div className="kc-proj">{task.project?.name || 'Workflow Project'}</div>
                <p className="kc-ttl">{task.title}</p>
            </div>

            {/* Tags */}
            <div className="kc-tags">
                <span className="kc-pill" style={{ background: ts.bg, color: ts.color }}>{task.type || 'TASK'}</span>
                <span className="kc-pill" style={{ background: ps.bg, color: ps.color, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: ps.color, display: 'inline-block' }} />
                    {ps.label}
                </span>
            </div>

            {/* Progress */}
            {(progress > 0 || task.status === 'DONE') && (
                <div className="kc-prog-bg">
                    <div
                        className="kc-prog-fill"
                        style={{
                            width: `${task.status === 'DONE' ? 100 : progress}%`,
                            background: progress === 100 || task.status === 'DONE' ? '#36b37e' : '#0052CC',
                        }}
                    />
                </div>
            )}

            {/* Meta */}
            <div className="kc-meta">
                <div className="kc-ml">
                    {task.dueDate && (
                        <div className={`kc-mi ${isOverdue ? 'od' : ''}`}>
                            <Calendar size={11} strokeWidth={2.5} />
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    )}
                    {subtaskTotal > 0 && (
                        <div className="kc-mi"><CheckSquare size={11} strokeWidth={2.5} />{subtaskDone}/{subtaskTotal}</div>
                    )}
                    {(task._count?.comments || 0) > 0 && (
                        <div className="kc-mi"><MessageSquare size={11} strokeWidth={2.5} />{task._count!.comments}</div>
                    )}
                    {(task._count?.files || 0) > 0 && (
                        <div className="kc-mi"><Paperclip size={11} strokeWidth={2.5} />{task._count!.files}</div>
                    )}
                </div>
                <div className="kc-av" title={task.assignee?.name || 'Unassigned'} style={{ background: getAvatarColor(task.assignee?.name) }}>
                    {task.assignee?.name?.[0]?.toUpperCase() || '?'}
                </div>
            </div>
        </div>
    );
}

/* ── Memoized export — skip render unless task data changes ── */
export default memo(KanbanCard, (prev, next) =>
    prev.task.id === next.task.id &&
    prev.task.status === next.task.status &&
    prev.task.title === next.task.title &&
    prev.task.priority === next.task.priority &&
    prev.task.type === next.task.type &&
    prev.task.progress === next.task.progress &&
    prev.task.dueDate === next.task.dueDate &&
    prev.task.assignee?.id === next.task.assignee?.id &&
    prev.task._count?.comments === next.task._count?.comments &&
    prev.task._count?.subTasks === next.task._count?.subTasks
);
