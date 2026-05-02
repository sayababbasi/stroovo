"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    useDroppable,
    defaultDropAnimationSideEffects,
    MeasuringStrategy,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    Plus,
    MoreHorizontal,
    AlertCircle,
    Clock,
    Flag,
    CheckCircle2,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { Task, TaskStatus } from '@/components/tasks/types';
import KanbanCard from './KanbanCard';

/* ───────────────────────── Types ───────────────────────── */

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdate: (taskId: string, newStatus: string) => Promise<void> | void;
    onAddTask: (status: string) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (task: Task) => void;
}

/* ───────────────────────── Columns ───────────────────────── */

const DEFAULT_COLUMNS = [
    { key: 'BACKLOG', label: 'Backlog', icon: AlertCircle, color: '#6B778C', wipLimit: 50 },
    { key: 'TODO', label: 'To Do', icon: Clock, color: '#00B8D9', wipLimit: 20 },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Flag, color: '#0052CC', wipLimit: 10 },
    { key: 'DONE', label: 'Done', icon: CheckCircle2, color: '#36B37E', wipLimit: null },
];

/* ───────────────────────── Droppable Column ───────────────────────── */

const DroppableColumn = React.memo(function DroppableColumn({
    id, className, children, style, onClick
}: {
    id: string; className: string; children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={className}
            id={id}
            onClick={onClick}
            style={{
                ...style,
                ...(isOver ? { boxShadow: 'inset 0 0 0 2px rgba(76,154,255,0.5)' } : {}),
            }}
        >
            {children}
        </div>
    );
});

/* ───────────────────────── Main Component ───────────────────────── */

export default function KanbanBoard({
    tasks: initialTasks,
    onTaskUpdate,
    onAddTask,
    onEditTask,
    onDeleteTask
}: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
    const [focusColumn, setFocusColumn] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);

    /* Sync props → state */
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    /* Keyboard shortcuts */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'n' || e.key === 'N') { e.preventDefault(); onAddTask('TODO'); }
            if (e.key === 'Escape') { setFocusColumn(null); setActiveMenu(null); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onAddTask]);

    /* Close menu on outside click */
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenu(null);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    /* ── DnD Sensors — optimized ── */
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    /* ── Memoized data ── */
    const tasksByStatus = useMemo(() => {
        const map: Record<string, Task[]> = { BACKLOG: [], TODO: [], IN_PROGRESS: [], DONE: [] };
        tasks.forEach(t => { if (map[t.status]) map[t.status].push(t); else map[t.status] = [t]; });
        return map;
    }, [tasks]);

    const activeTask = useMemo(() => tasks.find(t => t.id === activeId), [activeId, tasks]);

    const toggleCollapse = useCallback((key: string) => {
        setCollapsedColumns(prev => {
            const n = new Set(prev);
            if (n.has(key)) n.delete(key); else n.add(key);
            return n;
        });
    }, []);

    /* ── Drag Handlers — all stable, all functional setState ── */
    const handleDragStart = useCallback((e: DragStartEvent) => {
        setActiveId(e.active.id as string);
    }, []);

    const handleDragOver = useCallback((e: DragOverEvent) => {
        const { active, over } = e;
        if (!over) return;
        const aid = active.id as string;
        const oid = over.id as string;
        if (aid === oid) return;

        setTasks(prev => {
            const at = prev.find(t => t.id === aid);
            if (!at) return prev;
            const isCol = DEFAULT_COLUMNS.some(c => c.key === oid);
            if (isCol) return at.status === oid ? prev : prev.map(t => t.id === aid ? { ...t, status: oid as TaskStatus } : t);
            const ot = prev.find(t => t.id === oid);
            if (ot && at.status !== ot.status) return prev.map(t => t.id === aid ? { ...t, status: ot.status } : t);
            return prev;
        });
    }, []);

    const handleDragEnd = useCallback(async (e: DragEndEvent) => {
        const { active, over } = e;
        setActiveId(null);
        if (!over) return;
        const aid = active.id as string;
        const oid = over.id as string;

        setTasks(prev => {
            const at = prev.find(t => t.id === aid);
            if (!at) return prev;
            let ns = at.status;
            const oc = DEFAULT_COLUMNS.find(c => c.key === oid);
            if (oc) ns = oc.key as TaskStatus;
            else { const ot = prev.find(t => t.id === oid); if (ot) ns = ot.status; }
            const final = aid !== oid ? arrayMove(prev, prev.findIndex(t => t.id === aid), prev.findIndex(t => t.id === oid)) : prev;
            if (ns !== at.status) { onTaskUpdate(aid, ns); return final.map(t => t.id === aid ? { ...t, status: ns as TaskStatus } : t); }
            return final;
        });
    }, [onTaskUpdate]);

    /* ── Auto-scroll during drag ── */
    useEffect(() => {
        if (!activeId) return;
        let raf = 0;
        const EDGE = 60, SPEED = 14;
        const onMove = (ev: PointerEvent) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                // vertical auto-scroll inside each column's card area
                const lists = document.querySelectorAll('.kb-task-list');
                lists.forEach(el => {
                    const r = el.getBoundingClientRect();
                    const y = ev.clientY - r.top;
                    if (y > 0 && y < EDGE) (el as HTMLElement).scrollTop -= SPEED;
                    else if (y > r.height - EDGE && y < r.height) (el as HTMLElement).scrollTop += SPEED;
                });
            });
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
    }, [activeId]);

    /* Done column progress */
    const doneProgress = useMemo(() => {
        if (tasks.length === 0) return 0;
        return Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100);
    }, [tasks]);

    /* ───────────────────────── Render ───────────────────────── */
    return (
        <div className="kb-root">
            <style jsx global>{`
                /* ── Root: takes full remaining height ── */
                .kb-root {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    min-height: 0;
                    overflow: hidden;
                    background: #ffffff;
                    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
                }

                /* ── Board: horizontal flex, fills remaining height ── */
                .kb-root .kb-board {
                    display: flex;
                    align-items: stretch;
                    gap: 16px;
                    flex: 1;
                    min-height: 0;
                    overflow-x: auto;
                    overflow-y: hidden;
                    padding: 24px 32px;
                    box-sizing: border-box;
                }
                .kb-root .kb-board::-webkit-scrollbar { height: 8px; }
                .kb-root .kb-board::-webkit-scrollbar-track { background: transparent; }
                .kb-root .kb-board::-webkit-scrollbar-thumb { background: #dfe1e6; border-radius: 4px; }

                /* ── Column: stretches full height ── */
                .kb-root .kb-col {
                    flex: 1;
                    min-width: 250px;
                    min-height: 0;
                    background: #f1f3f7;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: box-shadow 0.15s, opacity 0.2s;
                }
                .kb-root .kb-col.focus { flex: none; width: calc(100vw - 64px); max-width: 1200px; }
                .kb-root .kb-col.dimmed { opacity: 0.3; pointer-events: none; }
                .kb-root .kb-col.collapsed {
                    flex: none;
                    min-width: 50px;
                    width: 50px;
                    background: #eaecf0;
                    cursor: pointer;
                }

                /* ── Column Header: FIXED inside column ── */
                .kb-root .kb-head {
                    padding: 16px 16px 12px;
                    flex-shrink: 0;
                }
                .kb-root .kb-head-row {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                }
                .kb-root .kb-title {
                    font-weight: 600;
                    font-size: 13.5px;
                    color: #172b4d;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                }
                .kb-root .kb-badge {
                    background: #dfe1e6;
                    padding: 2px 7px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #44546f;
                    min-width: 20px;
                    text-align: center;
                }
                .kb-root .kb-wip {
                    font-size: 11px;
                    margin-top: 4px;
                    font-weight: 600;
                }
                .kb-root .kb-wip.over { color: #e34935; }
                .kb-root .kb-wip.ok { color: #8993a4; }

                .kb-root .kb-done-bar {
                    height: 4px;
                    background: #dfe1e6;
                    border-radius: 4px;
                    margin-top: 8px;
                    overflow: hidden;
                }
                .kb-root .kb-done-fill {
                    height: 100%;
                    background: #36B37E;
                    border-radius: 4px;
                    transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
                }

                .kb-root .kb-actions {
                    display: flex;
                    gap: 2px;
                    flex-shrink: 0;
                }
                .kb-root .kb-ibtn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #8993a4;
                    padding: 5px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    transition: all 0.12s;
                }
                .kb-root .kb-ibtn:hover { background: #dfe1e6; color: #44546f; }

                /* ── Task List: SCROLLABLE area (the ONLY scrolling part) ── */
                .kb-root .kb-task-list {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 2px 12px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .kb-root .kb-task-list::-webkit-scrollbar { width: 6px; }
                .kb-root .kb-task-list::-webkit-scrollbar-track { background: transparent; }
                .kb-root .kb-task-list::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; transition: background 0.2s; }
                .kb-root .kb-col:hover .kb-task-list::-webkit-scrollbar-thumb { background: #c1c7d0; }
                .kb-root .kb-task-list::-webkit-scrollbar-thumb:hover { background: #a5adba; }

                .kb-root .kb-empty {
                    padding: 24px 16px;
                    text-align: center;
                    color: #8993a4;
                    font-size: 13px;
                    border: 2px dashed #dfe1e6;
                    border-radius: 10px;
                    margin: 2px;
                }

                /* ── Quick Add: FIXED at column bottom ── */
                .kb-root .kb-add {
                    margin: 0;
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    color: #44546f;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.12s;
                    font-family: inherit;
                    width: 100%;
                    justify-content: flex-start;
                }
                .kb-root .kb-add:hover { background: rgba(9, 30, 66, 0.08); color: #172b4d; }

                /* ── Collapsed column ── */
                .kb-root .kb-col-inner {
                    writing-mode: vertical-lr;
                    padding: 20px 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    height: 100%;
                    color: #44546f;
                }

                /* ── Dropdown ── */
                .kb-root .kb-menu { position: relative; }
                .kb-root .kb-dd {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: #fff;
                    border: 1px solid #e3e6ee;
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    width: 176px;
                    z-index: 50;
                    padding: 5px;
                    animation: kbs 0.1s ease-out;
                }
                .kb-root .kb-dd-item {
                    padding: 7px 11px;
                    font-size: 13px;
                    color: #44546f;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: background 0.08s;
                }
                .kb-root .kb-dd-item:hover { background: #f1f3f7; }
                .kb-root .kb-dd-item.dng { color: #e34935; }
                .kb-root .kb-dd-item.dng:hover { background: #fff1f0; }
                @keyframes kbs {
                    from { opacity: 0; transform: translateY(-3px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* ── Drag overlay ── */
                .kb-root .kb-overlay {
                    transform: scale(1.03) rotate(1.5deg);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
                    border-radius: 12px;
                    will-change: transform;
                    cursor: grabbing;
                }
            `}</style>

            <div className="kb-board" ref={boardRef}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                >
                    {DEFAULT_COLUMNS.map(col => {
                        const isCollapsed = collapsedColumns.has(col.key);
                        const isFocused = focusColumn === col.key;
                        const isDimmed = focusColumn && !isFocused;
                        const Icon = col.icon;
                        const colTasks = tasksByStatus[col.key] || [];
                        const isOverWip = col.wipLimit && colTasks.length > col.wipLimit;

                        if (isCollapsed && !focusColumn) {
                            return (
                                <DroppableColumn key={col.key} id={col.key} className="kb-col collapsed" onClick={() => toggleCollapse(col.key)}>
                                    <div className="kb-col-inner">
                                        <Icon size={14} color={col.color} />
                                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{col.label}</span>
                                        <span className="kb-badge">{colTasks.length}</span>
                                    </div>
                                </DroppableColumn>
                            );
                        }

                        return (
                            <DroppableColumn
                                key={col.key}
                                id={col.key}
                                className={`kb-col ${isFocused ? 'focus' : ''} ${isDimmed ? 'dimmed' : ''}`}
                            >
                                {/* FIXED HEADER */}
                                <div className="kb-head">
                                    <div className="kb-head-row">
                                        <div>
                                            <div className="kb-title">
                                                <Icon size={14} color={col.color} />
                                                {col.label}
                                                <span className="kb-badge">{colTasks.length}</span>
                                            </div>
                                            {col.wipLimit && (
                                                <div className={`kb-wip ${isOverWip ? 'over' : 'ok'}`}>
                                                    WIP limit: {col.wipLimit} {isOverWip && '(Over limit)'}
                                                </div>
                                            )}
                                            {col.key === 'DONE' && (
                                                <div className="kb-done-bar">
                                                    <div className="kb-done-fill" style={{ width: `${doneProgress}%` }} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="kb-actions">
                                            <button onClick={() => setFocusColumn(isFocused ? null : col.key)} className="kb-ibtn" title="Focus">
                                                {isFocused ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                            </button>
                                            <div className="kb-menu">
                                                <button onClick={(ev) => { ev.stopPropagation(); setActiveMenu(activeMenu === col.key ? null : col.key); }} className="kb-ibtn">
                                                    <MoreHorizontal size={14} />
                                                </button>
                                                {activeMenu === col.key && (
                                                    <div className="kb-dd" ref={menuRef}>
                                                        <div className="kb-dd-item">Rename column</div>
                                                        <div className="kb-dd-item">Set WIP limit</div>
                                                        <div className="kb-dd-item" onClick={() => { toggleCollapse(col.key); setActiveMenu(null); }}>Collapse column</div>
                                                        <div style={{ borderTop: '1px solid #e3e6ee', margin: '3px 0' }} />
                                                        <div className="kb-dd-item dng">Delete column</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SCROLLABLE CARD AREA */}
                                <SortableContext items={colTasks.map(t => t.id || '')} strategy={verticalListSortingStrategy}>
                                    <div className="kb-task-list">
                                        {colTasks.length === 0 ? (
                                            <div className="kb-empty">No tasks yet</div>
                                        ) : colTasks.map(task => (
                                            <KanbanCard
                                                key={task.id}
                                                task={task}
                                                onClick={(task) => onEditTask(task)}
                                                onEdit={onEditTask}
                                                onDelete={onDeleteTask}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>

                                {/* FIXED FOOTER */}
                                <button className="kb-add" onClick={() => onAddTask(col.key)}>
                                    <Plus size={13} /> Quick Add Task
                                </button>
                            </DroppableColumn>
                        );
                    })}

                    <DragOverlay
                        dropAnimation={{
                            duration: 250,
                            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                            sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } }),
                        }}
                    >
                        {activeId && activeTask ? (
                            <div className="kb-overlay">
                                <KanbanCard task={activeTask} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
