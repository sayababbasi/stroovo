"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    ChevronLeft, 
    ChevronRight, 
    CheckSquare,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Search,
    Filter,
    ArrowRight,
    Edit3,
    MoreVertical,
    Calendar
} from 'lucide-react';
import { 
    format, 
    addDays, 
    startOfWeek, 
    addWeeks, 
    startOfMonth, 
    endOfMonth, 
    addMonths,
    startOfYear,
    addYears,
    differenceInDays,
    isToday,
    subDays,
    isSameDay
} from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    startDate?: string;
    dueDate?: string;
    progress: number;
    projectId: string;
    project?: { name: string };
    assignee?: { name: string; image: string };
    createdAt: string;
    dependencies?: (Task | string)[];
}

type ViewMode = 'daily' | 'weekly' | 'monthly';

export function TimelineView({ 
    hideHeader,
    teamId,
    initialTasks
}: { 
    hideHeader?: boolean,
    teamId?: string,
    initialTasks?: any[]
} = {}) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
    const [loading, setLoading] = useState(!initialTasks);
    const [viewMode, setViewMode] = useState<ViewMode>('daily');
    const [baseDate, setBaseDate] = useState(subDays(new Date(), 2)); // Start a bit earlier to see today better
    const [zoom, setZoom] = useState(100); // Column width in pixels
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [projectFilter, setProjectFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Interaction state
    const [draggingTask, setDraggingTask] = useState<{ id: string, type: 'move' | 'resize-end', initialLeft: number, initialWidth: number, startX: number } | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

    const fetchTasks = useCallback(async () => {
        if (initialTasks) return;
        try {
            const url = teamId ? `${API_URL}/api/team-tasks?teamId=${teamId}` : `${API_URL}/api/tasks`;
            const res = await fetch(url);
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [API_URL, teamId, initialTasks]);

    useEffect(() => {
        if (initialTasks) {
            setTasks(initialTasks);
            setLoading(false);
        }
    }, [initialTasks]);

    useEffect(() => {
        if (!initialTasks) {
            fetchTasks();
        }
    }, [fetchTasks, initialTasks]);

    const updateTaskDates = async (taskId: string, startDate: Date, dueDate: Date | null) => {
        try {
            const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    startDate: startDate.toISOString(),
                    dueDate: dueDate ? dueDate.toISOString() : null 
                }),
            });
            if (!res.ok) throw new Error('Failed to update task');
            toast.success('Task timeline updated');
            fetchTasks(); // Refresh to ensure everything is synced
        } catch (err) {
            toast.error('Failed to sync changes');
            fetchTasks(); // Revert on failure
        }
    };

    const projects = useMemo(() => {
        const pSet = new Set<string>();
        tasks.forEach(t => { if (t.project?.name) pSet.add(t.project.name); });
        return Array.from(pSet);
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
            const matchesProject = projectFilter === 'ALL' || task.project?.name === projectFilter;
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesProject && matchesSearch;
        });
    }, [tasks, statusFilter, projectFilter, searchQuery]);

    const timeColumns = useMemo(() => {
        const cols = [];
        let start;
        const count = viewMode === 'daily' ? 30 : (viewMode === 'weekly' ? 12 : 12);

        switch (viewMode) {
            case 'daily':
                start = startOfWeek(baseDate);
                for (let i = 0; i < count; i++) {
                    const d = addDays(start, i);
                    cols.push({
                        date: d,
                        label: format(d, 'EEE').toUpperCase(),
                        subLabel: format(d, 'd'),
                        width: zoom
                    });
                }
                break;
            case 'weekly':
                start = startOfWeek(baseDate);
                for (let i = 0; i < count; i++) {
                    const d = addWeeks(start, i);
                    cols.push({
                        date: d,
                        label: `W${format(d, 'w')}`,
                        subLabel: format(d, 'MMM d'),
                        width: zoom * 4 // Increased from * 2
                    });
                }
                break;
            case 'monthly':
                start = startOfMonth(baseDate);
                for (let i = 0; i < count; i++) {
                    const d = addMonths(start, i);
                    cols.push({
                        date: d,
                        label: format(d, 'MMMM'),
                        subLabel: format(d, 'yyyy'),
                        width: zoom * 10 // Increased from * 3
                    });
                }
                break;
        }
        return cols;
    }, [viewMode, baseDate, zoom]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return '#36B37E';
            case 'IN_PROGRESS': return '#0052CC';
            case 'BLOCKED': return '#FF5630';
            default: return '#6B778C';
        }
    };

    const getBarColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'rgba(54, 179, 126, 0.9)'; // Green
            case 'IN_PROGRESS': return 'rgba(0, 82, 204, 0.9)'; // Blue
            case 'BLOCKED': return 'rgba(255, 86, 48, 0.9)'; // Red
            default: return 'rgba(107, 119, 140, 0.9)'; // Gray
        }
    };

    // Interaction Helpers
    const getMsFromPixels = (pixels: number) => {
        const totalPixels = timeColumns.reduce((sum, col) => sum + col.width, 0);
        const startTime = timeColumns[0].date.getTime();
        const lastCol = timeColumns[timeColumns.length - 1];
        let endTime;
        if (viewMode === 'daily') endTime = addDays(lastCol.date, 1).getTime();
        else if (viewMode === 'weekly') endTime = addWeeks(lastCol.date, 1).getTime();
        else endTime = addMonths(lastCol.date, 1).getTime();
        
        const pixelsPerMs = totalPixels / (endTime - startTime);
        return pixels / pixelsPerMs;
    };

    const handleMouseDown = (e: React.MouseEvent, taskId: string, type: 'move' | 'resize-end', left: number, width: number) => {
        e.preventDefault();
        setDraggingTask({ id: taskId, type, initialLeft: left, initialWidth: width, startX: e.clientX });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingTask) return;
            const deltaX = e.clientX - draggingTask.startX;
            const task = tasks.find(t => t.id === draggingTask.id);
            if (!task) return;

            const element = document.getElementById(`bar-${draggingTask.id}`);
            if (element) {
                if (draggingTask.type === 'move') {
                    element.style.left = `${draggingTask.initialLeft + deltaX}px`;
                } else {
                    element.style.width = `${Math.max(40, draggingTask.initialWidth + deltaX)}px`;
                }
            }
        };

        const handleMouseUp = async (e: MouseEvent) => {
            if (!draggingTask) return;
            const deltaX = e.clientX - draggingTask.startX;
            const task = tasks.find(t => t.id === draggingTask.id);
            if (!task) {
                setDraggingTask(null);
                return;
            }

            const currentStart = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
            const currentEnd = task.dueDate ? new Date(task.dueDate) : addDays(currentStart, 2);

            if (draggingTask.type === 'move') {
                const msShift = getMsFromPixels(deltaX);
                const newStart = new Date(currentStart.getTime() + msShift);
                const newEnd = new Date(currentEnd.getTime() + msShift);
                await updateTaskDates(task.id, newStart, newEnd);
            } else {
                const msShift = getMsFromPixels(deltaX);
                const newEnd = new Date(currentEnd.getTime() + msShift);
                await updateTaskDates(task.id, currentStart, newEnd);
            }
            setDraggingTask(null);
        };

        if (draggingTask) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingTask, tasks, timeColumns]);

    const calculateBarPosition = (task: Task) => {
        if (!timeColumns || timeColumns.length === 0) return null;

        const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
        const taskEnd = task.dueDate ? new Date(task.dueDate) : addDays(taskStart, 2); 
        
        const firstColDate = timeColumns[0].date;
        const lastCol = timeColumns[timeColumns.length - 1];
        
        let timelineEnd;
        if (viewMode === 'daily') timelineEnd = addDays(lastCol.date, 1);
        else if (viewMode === 'weekly') timelineEnd = addWeeks(lastCol.date, 1);
        else timelineEnd = addMonths(lastCol.date, 1);

        if (taskEnd < firstColDate || taskStart > timelineEnd) return null;

        const totalPixels = timeColumns.reduce((sum, col) => sum + col.width, 0);
        const totalDurationMs = timelineEnd.getTime() - firstColDate.getTime();
        const pixelsPerMs = totalPixels / totalDurationMs;

        const left = (taskStart.getTime() - firstColDate.getTime()) * pixelsPerMs;
        const width = (taskEnd.getTime() - taskStart.getTime()) * pixelsPerMs;

        return { 
            left: Math.round(left), 
            width: Math.round(width)
        };
    };

    const getTodayPosition = () => {
        if (!timeColumns || timeColumns.length === 0) return -1;
        const today = new Date();
        const firstColDate = timeColumns[0].date;
        const lastCol = timeColumns[timeColumns.length - 1];
        
        let timelineEnd;
        if (viewMode === 'daily') timelineEnd = addDays(lastCol.date, 1);
        else if (viewMode === 'weekly') timelineEnd = addWeeks(lastCol.date, 1);
        else timelineEnd = addMonths(lastCol.date, 1);

        if (today < firstColDate || today > timelineEnd) return -1;

        const totalPixels = timeColumns.reduce((sum, col) => sum + col.width, 0);
        const pixelsPerMs = totalPixels / (timelineEnd.getTime() - firstColDate.getTime());
        return Math.round((today.getTime() - firstColDate.getTime()) * pixelsPerMs);
    };

    const todayPos = getTodayPosition();

    const [hoveredTask, setHoveredTask] = useState<string | null>(null);

    // Grouping logic
    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {};
        filteredTasks.forEach(task => {
            const groupName = task.project?.name || 'No Project';
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(task);
        });
        return groups;
    }, [filteredTasks]);

    // Dependency Arrow rendering
    const renderDependencyArrows = () => {
        const arrowPaths: React.ReactNode[] = [];
        
        filteredTasks.forEach(task => {
            if (task.dependencies && task.dependencies.length > 0) {
                const toPos = calculateBarPosition(task);
                if (!toPos) return;

                task.dependencies.forEach((dep: any) => {
                    const depTask = tasks.find(t => t.id === (typeof dep === 'string' ? dep : dep.id));
                    if (!depTask) return;

                    const fromPos = calculateBarPosition(depTask);
                    if (!fromPos) return;

                    // Calculate row indices to find vertical position
                    // We need a reliable way to get the Y offset for each task
                    // Since tasks are grouped, we'll find their flattened index
                    const flattenedTasks = Object.values(groupedTasks).flat();
                    const fromIndex = flattenedTasks.findIndex(t => t.id === depTask.id);
                    const toIndex = flattenedTasks.findIndex(t => t.id === task.id);
                    
                    if (fromIndex === -1 || toIndex === -1) return;

                    // Header height + (Group headers * index) + (Row height * index)
                    // This is complex because group headers add height.
                    // Easier way: Get element positions if they exist, or calculate manually:
                    
                    const rowHeight = 56;
                    const groupHeaderHeight = 40;
                    
                    let fromY = 70; // Header
                    let toY = 70;
                    
                    let currentFlattenedIndex = 0;
                    Object.entries(groupedTasks).forEach(([groupName, groupTasks]) => {
                        fromY += groupHeaderHeight;
                        toY += groupHeaderHeight;
                        
                        groupTasks.forEach(t => {
                            if (currentFlattenedIndex < fromIndex) fromY += rowHeight;
                            if (currentFlattenedIndex < toIndex) toY += rowHeight;
                            currentFlattenedIndex++;
                        });
                    });
                    
                    // Center in row
                    fromY += (fromIndex % flattenedTasks.length) * 0; // Resetting logic
                    // Let's simplify: Use a Map for Y positions
                });
            }
        });
        return arrowPaths;
    };

    // Corrected Y positioning and Arrow drawing
    const dependencyOverlay = useMemo(() => {
        const flattenedTasks = Object.values(groupedTasks).flat();
        const yMap = new Map<string, number>();
        let currentY = 70; // Header height

        Object.entries(groupedTasks).forEach(([groupName, groupTasks]) => {
            currentY += 40; // Group header
            groupTasks.forEach(t => {
                yMap.set(t.id, currentY + 28); // 28 is half of 56
                currentY += 56;
            });
        });

        const paths: React.ReactNode[] = [];
        flattenedTasks.forEach(task => {
            if (task.dependencies && task.dependencies.length > 0) {
                const toPos = calculateBarPosition(task);
                const toY = yMap.get(task.id);
                if (!toPos || toY === undefined) return;

                task.dependencies.forEach((dep: any) => {
                    const depId = typeof dep === 'string' ? dep : dep.id;
                    const depTask = tasks.find(t => t.id === depId);
                    const fromPos = depTask ? calculateBarPosition(depTask) : null;
                    const fromY = yMap.get(depId);
                    
                    if (fromPos && fromY !== undefined) {
                        const startX = fromPos.left + fromPos.width + 320;
                        const startY = fromY;
                        const endX = toPos.left + 320;
                        const endY = toY;
                        
                        // Cubic bezier for smooth curve
                        const midX = (startX + endX) / 2;
                        const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                        
                        paths.push(
                            <g key={`${depId}-${task.id}`} style={{ filter: 'drop-shadow(0 0 2px rgba(76, 154, 255, 0.4))' }}>
                                <path 
                                    d={path} 
                                    fill="none" 
                                    stroke="#4C9AFF" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="4 2"
                                    style={{ opacity: 0.8 }}
                                />
                                <circle cx={startX} cy={startY} r="2.5" fill="#4C9AFF" />
                                <path d={`M ${endX-6} ${endY-3} L ${endX} ${endY} L ${endX-6} ${endY+3} Z`} fill="#4C9AFF" />
                            </g>
                        );
                    }
                });
            }
        });
        return paths;
    }, [groupedTasks, tasks, calculateBarPosition]);

    // Helper to get task bar mid-points for arrows
    const getTaskBarCoords = (taskId: string) => {
        const el = document.getElementById(`bar-${taskId}`);
        const container = document.getElementById('gantt-scroll-container');
        if (!el || !container) return null;
        
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        return {
            x: rect.left - containerRect.left + (rect.width / 2),
            y: rect.top - containerRect.top + (rect.height / 2),
            left: rect.left - containerRect.left,
            right: rect.right - containerRect.left,
            top: rect.top - containerRect.top,
            bottom: rect.bottom - containerRect.top
        };
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', overflowX: 'hidden', position: 'relative' }}>
                <style>{`
                    .timeline-container::-webkit-scrollbar { width: 8px; height: 8px; }
                    .timeline-container::-webkit-scrollbar-track { background: #f1f1f1; }
                    .timeline-container::-webkit-scrollbar-thumb { background: #dfdfdf; border-radius: 4px; }
                    .timeline-container::-webkit-scrollbar-thumb:hover { background: #c1c1c1; }
                    
                    .gantt-row { border-bottom: 1px solid #EBECF0; height: 56px; display: flex; transition: background 0.2s; position: relative; background: #FFFFFF; }
                    .gantt-row:hover { background: #F8F9FA; }
                    .group-header { background: #F4F5F7; height: 40px; display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid #EBECF0; }
                    
                    .sticky-col { position: sticky; left: 0; z-index: 160; background: #FFFFFF; border-right: 1px solid #DFE1E6; }
                    .sticky-header { position: sticky; top: 0; z-index: 200; background: #FFFFFF; border-bottom: 2px solid #DFE1E6; }
                    .sticky-header .sticky-col { z-index: 210; }
                    
                    .gantt-bar { 
                        position: absolute; 
                        height: 34px; 
                        top: 11px; 
                        border-radius: 17px; 
                        display: flex; 
                        align-items: center; 
                        color: white; 
                        font-size: 11px; 
                        font-weight: 700; 
                        cursor: grab;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        backdrop-filter: blur(12px);
                        user-select: none;
                        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .gantt-bar:hover { transform: translateY(-1px) scale(1.02); z-index: 161; filter: brightness(1.1); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                    .gantt-bar:active { cursor: grabbing; transform: scale(0.98); }
                    .sticky-col::after {
                        content: '';
                        position: absolute;
                        right: -10px;
                        top: 0;
                        bottom: 0;
                        width: 10px;
                        background: linear-gradient(to right, rgba(0,0,0,0.03), transparent);
                        pointer-events: none;
                    }
                    
                    .tooltip {
                        position: absolute;
                        top: -70px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #172B4D;
                        color: white;
                        padding: 10px 16px;
                        border-radius: 8px;
                        font-size: 12px;
                        white-space: nowrap;
                        z-index: 1000;
                        pointer-events: none;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .gantt-bar:hover .tooltip { opacity: 1; visibility: visible; top: -80px; }

                    .today-line {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 2px;
                        background: #FF5630;
                        z-index: 150;
                        pointer-events: none;
                    }
                    .today-line::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -4px;
                        width: 10px;
                        height: 10px;
                        background: #FF5630;
                        border-radius: 50%;
                        box-shadow: 0 0 10px #FF5630;
                    }
                `}</style>

                {/* Toolbar */}
                <div style={{ 
                    padding: hideHeader ? '16px 24px' : '20px 40px', 
                    background: '#FFFFFF', 
                    borderBottom: '1px solid #DFE1E6', 
                    zIndex: 300, 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                            {!hideHeader && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#172B4D', letterSpacing: '-0.03em', margin: 0 }}>Visual Planner</h1>
                                <p style={{ fontSize: '13px', color: '#6B778C', fontWeight: 600, margin: '2px 0 0 0' }}>Manage project timelines & dependencies</p>
                            </div>
                            )}
                            
                            <div style={{ display: 'flex', background: '#F4F5F7', borderRadius: '12px', padding: '4px' }}>
                                {(['daily', 'weekly', 'monthly'] as ViewMode[]).map(mode => (
                                    <button 
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        style={{ 
                                            background: viewMode === mode ? '#FFFFFF' : 'transparent', 
                                            border: 'none', 
                                            fontSize: '11px', 
                                            fontWeight: 800,
                                            color: viewMode === mode ? '#0052CC' : '#6B778C',
                                            padding: '8px 20px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            boxShadow: viewMode === mode ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => {
                                    const container = document.getElementById('gantt-scroll-container');
                                    if (container) container.scrollLeft = Math.max(0, todayPos - 400);
                                }}
                                style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #DFE1E6',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#42526E',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Calendar size={14} />
                                Today
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: '10px', padding: '6px 16px' }}>
                                <ZoomOut size={14} color="#6B778C" />
                                <input 
                                    type="range" 
                                    min="60" 
                                    max="200" 
                                    value={zoom} 
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    style={{ width: '100px', accentColor: '#0052CC', cursor: 'pointer' }}
                                />
                                <ZoomIn size={14} color="#6B778C" />
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#172B4D', width: '35px' }}>{Math.round(zoom)}%</span>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B778C' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search tasks..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #DFE1E6', fontSize: '14px', width: '180px', outline: 'none', background: '#FAFBFC', transition: 'width 0.3s' }}
                                />
                            </div>

                            {!hideHeader && (
                            <button style={{ padding: '10px 24px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0, 82, 204, 0.3)', transition: 'transform 0.2s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <span>Create Task</span>
                            </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gantt Grid */}
                <div id="gantt-scroll-container" className="timeline-container" style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                    <div style={{ width: 'fit-content', minWidth: '100%', position: 'relative' }}>
                        
                        {/* SVG Dependency Overlay */}
                        <svg 
                            style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                pointerEvents: 'none', 
                                zIndex: 60,
                                overflow: 'visible'
                            }}
                        >
                            {dependencyOverlay}
                        </svg>

                        {/* Header */}
                        <div className="sticky-header" style={{ display: 'flex', height: '70px' }}>
                            <div className="sticky-col" style={{ width: '320px', minWidth: '320px', background: '#FFFFFF', padding: '0 24px', display: 'flex', alignItems: 'center', zIndex: 210 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Filter size={14} color="#6B778C" />
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#6B778C', letterSpacing: '0.08em' }}>HIERARCHY</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', background: '#FFFFFF' }}>
                                {timeColumns.map((col, i) => (
                                    <div key={i} style={{ 
                                        width: col.width, 
                                        flexShrink: 0, 
                                        borderRight: '1px solid #EBECF0', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        background: isSameDay(col.date, new Date()) ? '#E9F2FF' : 'transparent',
                                        borderBottom: isSameDay(col.date, new Date()) ? '2px solid #0052CC' : 'none'
                                    }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#6B778C' }}>{col.label}</span>
                                        <span style={{ fontSize: '16px', fontWeight: 800, color: isSameDay(col.date, new Date()) ? '#0052CC' : '#172B4D', marginTop: '2px' }}>{col.subLabel}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ position: 'relative' }}>
                            {/* Today Indicator */}
                            {todayPos >= 0 && (
                                <div className="today-line" style={{ left: todayPos + 320 }} />
                            )}

                            {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                                <div key={groupName}>
                                    {/* Group Header */}
                                    <div className="group-header" style={{ position: 'sticky', left: 0, zIndex: 110 }}>
                                        <div className="sticky-col" style={{ position: 'static', background: 'transparent', border: 'none', padding: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ArrowRight size={14} color="#6B778C" />
                                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#42526E', textTransform: 'uppercase' }}>{groupName}</span>
                                                <span style={{ fontSize: '10px', background: '#DFE1E6', padding: '2px 6px', borderRadius: '10px', fontWeight: 700, color: '#172B4D' }}>{groupTasks.length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {groupTasks.map((task) => {
                                        const pos = calculateBarPosition(task);
                                        const barColor = getBarColor(task.status);
                                        return (
                                            <div key={task.id} className="gantt-row">
                                                {/* Task Info Cell */}
                                                <div className="sticky-col" style={{ width: '320px', minWidth: '320px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '12px', background: 'inherit' }}>
                                                    <div style={{ 
                                                        width: '12px', 
                                                        height: '12px', 
                                                        borderRadius: '3px', 
                                                        background: getStatusColor(task.status),
                                                        flexShrink: 0,
                                                        boxShadow: `0 0 8px ${getStatusColor(task.status)}44`
                                                    }} />
                                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                                                        <span style={{ fontSize: '10px', color: '#6B778C', fontWeight: 600 }}>{format(new Date(task.startDate || task.createdAt), 'MMM d')} - {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No Due Date'}</span>
                                                    </div>
                                                </div>

                                                {/* Timeline Bar Cell */}
                                                <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
                                                    {timeColumns.map((col, i) => (
                                                        <div key={i} style={{ width: col.width, flexShrink: 0, borderRight: '1px solid #EBECF0', height: '100%', opacity: 0.3 }} />
                                                    ))}

                                                    {pos && (
                                                        <div 
                                                            id={`bar-${task.id}`}
                                                            className="gantt-bar" 
                                                            style={{
                                                                left: pos.left,
                                                                width: pos.width,
                                                                background: barColor,
                                                                opacity: draggingTask?.id === task.id ? 0.7 : 1,
                                                                zIndex: draggingTask?.id === task.id ? 201 : 50
                                                            }}
                                                            onMouseDown={(e) => handleMouseDown(e, task.id, 'move', pos.left, pos.width)}
                                                        >
                                                            {/* Tooltip */}
                                                            <div className="tooltip">
                                                                <div style={{ fontWeight: 700 }}>{task.title}</div>
                                                                <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
                                                                    {format(new Date(task.startDate || task.createdAt), 'MMM d')} - {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'N/A'}
                                                                </div>
                                                                <div style={{ fontSize: '10px', marginTop: '4px', display: 'flex', gap: '8px' }}>
                                                                    <span>{task.status}</span>
                                                                    <span>•</span>
                                                                    <span>{task.progress}%</span>
                                                                </div>
                                                            </div>

                                                            {/* Progress Overlay */}
                                                            <div style={{ 
                                                                position: 'absolute', 
                                                                left: 0, 
                                                                top: 0, 
                                                                bottom: 0, 
                                                                width: `${task.progress}%`, 
                                                                background: 'rgba(255, 255, 255, 0.3)', 
                                                                borderRadius: '16px 0 0 16px',
                                                                pointerEvents: 'none',
                                                                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)'
                                                            }} />                                                             {/* Content */}
                                                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', width: '100%', pointerEvents: 'none', position: 'relative' }}>
                                                                 {task.assignee?.image ? (
                                                                     <img src={task.assignee.image} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexShrink: 0 }} />
                                                                 ) : (
                                                                     <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.6)', fontSize: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                                                                         {task.assignee?.name?.[0] || 'U'}
                                                                     </div>
                                                                 )}
                                                                 
                                                                 {pos.width >= 140 ? (
                                                                     <>
                                                                         <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, letterSpacing: '0.01em' }}>
                                                                             {task.title}
                                                                         </span>
                                                                         <div style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '8px', fontSize: '9px' }}>
                                                                             {task.progress}%
                                                                         </div>
                                                                     </>
                                                                 ) : (
                                                                     <div style={{ 
                                                                         position: 'absolute', 
                                                                         left: pos.width + 8, 
                                                                         color: '#172B4D', 
                                                                         fontSize: '11px', 
                                                                         fontWeight: 600, 
                                                                         whiteSpace: 'nowrap',
                                                                         background: 'rgba(255,255,255,0.8)',
                                                                         padding: '2px 8px',
                                                                         borderRadius: '4px',
                                                                         backdropFilter: 'blur(4px)',
                                                                         border: '1px solid #DFE1E6',
                                                                         boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                         zIndex: 10
                                                                     }}>
                                                                         {task.title}
                                                                     </div>
                                                                 )}
                                                             </div>
  

                                                            {/* Resize Handle */}
                                                            <div 
                                                                className="resize-handle"
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMouseDown(e, task.id, 'resize-end', pos.left, pos.width);
                                                                }}
                                                            >
                                                                <div style={{ width: '2px', height: '12px', background: 'white', borderRadius: '1px', opacity: 0.5 }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default function TimelinePage() {
    return (
        <main style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F4F5F7' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TimelineView />
            </div>
        </main>
    );
}
