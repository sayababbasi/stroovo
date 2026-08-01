"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
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
    Calendar,
    ChevronDown,
    Plus,
    CalendarDays,
    Target,
    AlertCircle,
    CheckCircle2,
    CheckSquare2,
    PieChart,
    BarChartHorizontal,
    AlignLeft,
    GripVertical
} from 'lucide-react';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
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
    const [groupBy, setGroupBy] = useState<'project' | 'status' | 'assignee'>('project');
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Interaction state
    const [draggingTask, setDraggingTask] = useState<{ id: string, type: 'move' | 'resize-end', initialLeft: number, initialWidth: number, startX: number } | null>(null);

    const API_URL = '';

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

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
            case 'DONE': return '#E3FCEF'; // Light Green
            case 'IN_PROGRESS': return '#EAE6FF'; // Light Indigo/Purple
            case 'BLOCKED': return '#FFEBE6'; // Light Red
            default: return '#F4F5F7'; // Light Gray
        }
    };

    const getBarTextColor = (status: string) => {
        switch (status) {
            case 'DONE': return '#006644';
            case 'IN_PROGRESS': return '#403294';
            case 'BLOCKED': return '#BF2600';
            default: return '#42526E';
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
    const uniqueAssignees = useMemo(() => {
        const map = new Map();
        tasks.forEach(t => {
            if (t.assignee && !map.has(t.assignee.name)) {
                map.set(t.assignee.name, t.assignee);
            }
        });
        return Array.from(map.values());
    }, [tasks]);

    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {};
        filteredTasks.forEach(task => {
            let groupName = 'Unknown';
            if (groupBy === 'project') groupName = task.project?.name || 'No Project';
            else if (groupBy === 'status') groupName = task.status || 'No Status';
            else if (groupBy === 'assignee') groupName = task.assignee?.name || 'Unassigned';
            
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(task);
        });
        return groups;
    }, [filteredTasks, groupBy]);

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
                        height: 32px; 
                        top: 10px; 
                        border-radius: 8px; 
                        display: flex; 
                        align-items: center; 
                        font-size: 11px; 
                        font-weight: 600; 
                        cursor: grab;
                        user-select: none;
                        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .gantt-bar:hover { transform: translateY(-1px); z-index: 161; filter: brightness(0.95); }
                    .gantt-bar:active { cursor: grabbing; }
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

                {/* New Unified Header Area */}
                <div style={{ 
                    padding: hideHeader ? '16px 24px' : '24px 32px 16px 32px', 
                    background: '#FFFFFF', 
                    borderBottom: '1px solid #DFE1E6', 
                    zIndex: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    {/* Top Row: Title, Search, Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {!hideHeader && (
                            <>
                                <div style={{ 
                                    width: '32px', height: '32px', background: '#F0F5FF', borderRadius: '8px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                }}>
                                    <BarChartHorizontal size={18} color="#0052CC" />
                                </div>
                                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D', letterSpacing: '-0.02em', margin: 0 }}>Timeline</h1>
                            </>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: '320px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8993A4' }} />
                                <input 
                                    ref={searchInputRef}
                                    type="text" 
                                    placeholder="Search tasks..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ 
                                        padding: '8px 12px 8px 36px', borderRadius: '16px', border: '1px solid #DFE1E6', 
                                        fontSize: '13px', width: '100%', outline: 'none', background: '#FAFBFC', 
                                        transition: 'all 0.2s', fontWeight: 500, color: '#172B4D'
                                    }}
                                />
                                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0052CC', background: '#F0F5FF', padding: '2px 6px', borderRadius: '4px' }}>PRO TIP</span>
                                    <span style={{ fontSize: '11px', color: '#8993A4', fontWeight: 500 }}>Press / to search</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {uniqueAssignees.slice(0, 3).map((assignee: any, idx: number) => (
                                    <div key={assignee.name} title={assignee.name} style={{ width: '28px', height: '28px', borderRadius: '50%', background: ['#403294', '#FF5630', '#FF8B00'][idx % 3], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, border: '2px solid white', marginLeft: idx > 0 ? '-8px' : '0', zIndex: 3 - idx }}>
                                        {assignee.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                    </div>
                                ))}
                                {uniqueAssignees.length > 3 && (
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DFE1E6', color: '#42526E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, border: '2px solid white', marginLeft: '-8px', zIndex: 0 }}>
                                        +{uniqueAssignees.length - 3}
                                    </div>
                                )}
                                {uniqueAssignees.length === 0 && (
                                    <div style={{ fontSize: '12px', color: '#8993A4', fontWeight: 500, marginRight: '8px' }}>No assignees</div>
                                )}
                            </div>

                            {!hideHeader && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                style={{ 
                                    padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', 
                                    borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', 
                                    display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px rgba(0, 82, 204, 0.15)'
                                }} 
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'} 
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Plus size={16} />
                                <span>New Task</span>
                            </button>
                            )}
                        </div>
                    </div>

                    {/* Sub Row: Tabs and Filters */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', background: '#FAFBFC', padding: '4px', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                                {['ALL', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                                    const labels: Record<string, string> = { ALL: 'All Tasks', BACKLOG: 'Backlog', TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
                                    const active = statusFilter === status;
                                    return (
                                        <button 
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            style={{
                                                padding: '6px 14px',
                                                background: active ? '#FFFFFF' : 'transparent',
                                                border: active ? '1px solid #DFE1E6' : '1px solid transparent',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: active ? '#0052CC' : '#6B778C',
                                                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.03)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {labels[status]}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', color: '#6B778C', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s', borderRadius: '6px' }} onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Filter size={14} />
                                <span>Filter</span>
                            </button>
                            
                            <div style={{ position: 'relative' }}>
                                <div onClick={() => setShowGroupDropdown(!showGroupDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid #DFE1E6', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>Group: {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</span>
                                    <ChevronDown size={14} color="#6B778C" />
                                </div>
                                {showGroupDropdown && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, width: '160px', overflow: 'hidden' }}>
                                        {['project', 'status', 'assignee'].map(opt => (
                                            <div key={opt} onClick={() => { setGroupBy(opt as any); setShowGroupDropdown(false); }} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', background: groupBy === opt ? '#F4F5F7' : '#FFFFFF', fontWeight: groupBy === opt ? 600 : 500 }} onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'} onMouseLeave={e => e.currentTarget.style.background = groupBy === opt ? '#F4F5F7' : '#FFFFFF'}>
                                                Group by {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ position: 'relative' }}>
                                <div onClick={() => setShowViewDropdown(!showViewDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid #DFE1E6', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span>
                                    <ChevronDown size={14} color="#6B778C" />
                                </div>
                                {showViewDropdown && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, width: '120px', overflow: 'hidden' }}>
                                        {['daily', 'weekly', 'monthly'].map(opt => (
                                            <div key={opt} onClick={() => { setViewMode(opt as any); setShowViewDropdown(false); }} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', background: viewMode === opt ? '#F4F5F7' : '#FFFFFF', fontWeight: viewMode === opt ? 600 : 500 }} onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'} onMouseLeave={e => e.currentTarget.style.background = viewMode === opt ? '#F4F5F7' : '#FFFFFF'}>
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DFE1E6', background: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', color: '#6B778C', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#F4F5F7'} onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Metric Cards Section */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                        {[
                            { title: 'Total Tasks', value: tasks.length, trend: '+12%', trendLabel: 'vs last 7 days', icon: <CalendarDays size={18} color="#0052CC" />, color: '#0052CC', bg: '#F0F5FF', trendColor: '#22A06B' },
                            { title: 'Overdue', value: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length, trend: '+1', trendLabel: 'vs last 7 days', icon: <AlertCircle size={18} color="#DE350B" />, color: '#DE350B', bg: '#FFEBE6', trendColor: '#DE350B' },
                            { title: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, trend: '—', trendLabel: 'vs last 7 days', icon: <Target size={18} color="#0052CC" />, color: '#0052CC', bg: '#F0F5FF', trendColor: '#8993A4' },
                            { title: 'Completed', value: tasks.filter(t => t.status === 'DONE').length, trend: '+24%', trendLabel: 'vs last 7 days', icon: <CheckCircle2 size={18} color="#22A06B" />, color: '#22A06B', bg: '#E3FCEF', trendColor: '#22A06B' },
                        ].map((card, idx) => (
                            <div key={idx} style={{ 
                                flex: 1, padding: '16px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', 
                                display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {card.icon}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#42526E' }}>{card.title}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '28px', fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{card.value}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: card.trendColor }}>{card.trend}</span>
                                        <span style={{ fontSize: '10px', color: '#8993A4', fontWeight: 500 }}>{card.trendLabel}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Completion Card with circular progress */}
                        <div style={{ 
                            flex: 1.2, padding: '16px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '12px', 
                            display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                                <svg width="56" height="56" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F0F5FF" strokeWidth="4" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0052CC" strokeWidth="4" strokeDasharray="32, 100" />
                                </svg>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#172B4D' }}>32%</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#42526E' }}>Completion</span>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>32%</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '11px', color: '#8993A4', fontWeight: 500 }}>vs last 7 days</span>
                                    </div>
                                </div>
                            </div>
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
                        <div className="sticky-header" style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
                            <div style={{ display: 'flex', height: '48px', borderBottom: '1px solid #DFE1E6' }}>
                                <div className="sticky-col" style={{ width: '320px', minWidth: '320px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 210 }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>Task</span>
                                    <Maximize2 size={14} color="#6B778C" style={{ cursor: 'pointer' }} />
                                </div>
                                <div style={{ display: 'flex', flex: 1, padding: '0 24px', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', color: '#6B778C', borderRadius: '4px' }}>
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', cursor: 'pointer' }} onClick={() => { const container = document.getElementById('gantt-scroll-container'); if (container) container.scrollLeft = Math.max(0, todayPos - 400); }}>Today</span>
                                        <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', color: '#6B778C', borderRadius: '4px' }}>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>May 2026</span>
                                        <ChevronDown size={14} color="#6B778C" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DFE1E6', background: '#FFFFFF', cursor: 'pointer', color: '#6B778C', borderRadius: '6px' }} onClick={() => setZoom(z => Math.max(60, z - 10))}>
                                            <span style={{ fontSize: '16px', fontWeight: 600 }}>-</span>
                                        </button>
                                        <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DFE1E6', background: '#FFFFFF', cursor: 'pointer', color: '#6B778C', borderRadius: '6px' }} onClick={() => setZoom(z => Math.min(200, z + 10))}>
                                            <span style={{ fontSize: '16px', fontWeight: 600 }}>+</span>
                                        </button>
                                        <button style={{ padding: '0 12px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DFE1E6', background: '#FFFFFF', cursor: 'pointer', color: '#172B4D', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                            Fit
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', height: '40px' }}>
                                <div className="sticky-col" style={{ width: '320px', minWidth: '320px', background: '#FFFFFF', zIndex: 210, borderBottom: 'none' }} />
                                <div style={{ display: 'flex', background: '#FFFFFF' }}>
                                    {timeColumns.map((col, i) => (
                                        <div key={i} style={{ 
                                            width: col.width, 
                                            flexShrink: 0, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}>
                                            <span style={{ fontSize: '11px', fontWeight: 500, color: '#8993A4' }}>{col.label}</span>
                                            <span style={{ fontSize: '11px', fontWeight: isSameDay(col.date, new Date()) ? 700 : 500, color: isSameDay(col.date, new Date()) ? '#0052CC' : '#172B4D', background: isSameDay(col.date, new Date()) ? '#E9F2FF' : 'transparent', padding: '2px 6px', borderRadius: '4px' }}>{col.subLabel}</span>
                                        </div>
                                    ))}
                                </div>
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
                                    <div className="group-header" style={{ display: 'flex', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6', height: '36px' }}>
                                        <div className="sticky-col" style={{ width: '320px', minWidth: '320px', padding: '0 16px', display: 'flex', alignItems: 'center', background: '#FFFFFF', zIndex: 160 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(groupTasks[0]?.status || 'ALL') }} />
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{groupName}</span>
                                                <span style={{ fontSize: '11px', color: '#6B778C' }}>({groupTasks.length})</span>
                                            </div>
                                        </div>
                                        {/* Grid lines for group header row */}
                                        <div style={{ display: 'flex', flex: 1 }}>
                                            {timeColumns.map((col, i) => (
                                                <div key={i} style={{ width: col.width, flexShrink: 0, borderRight: '1px solid #EBECF0', height: '100%', opacity: 0.3 }} />
                                            ))}
                                        </div>
                                    </div>

                                    {groupTasks.map((task) => {
                                        const pos = calculateBarPosition(task);
                                        const barColor = getBarColor(task.status);
                                        return (
                                            <div key={task.id} className="gantt-row" style={{ height: '52px' }}>
                                                {/* Task Info Cell */}
                                                <div className="sticky-col" style={{ width: '320px', minWidth: '320px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'inherit' }}>
                                                    <GripVertical size={14} color="#DFE1E6" style={{ cursor: 'grab' }} />
                                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, gap: '4px' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                                                            <span style={{ fontSize: '9px', fontWeight: 700, color: '#0052CC', background: '#F0F5FF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #D9E2EC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{task.project?.name || 'TASK'}</span>
                                                            <span style={{ fontSize: '11px', color: '#8993A4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.assignee?.name || 'Unassigned'}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#403294', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                                                        {task.assignee?.name ? task.assignee.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                                    </div>
                                                    <GripVertical size={14} color="#DFE1E6" style={{ cursor: 'pointer', visibility: 'hidden' }} />
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
                                                                border: `1px solid ${getBarTextColor(task.status)}44`,
                                                                color: getBarTextColor(task.status),
                                                                opacity: draggingTask?.id === task.id ? 0.7 : 1,
                                                                zIndex: draggingTask?.id === task.id ? 201 : 50
                                                            }}
                                                            onMouseDown={(e) => handleMouseDown(e, task.id, 'move', pos.left, pos.width)}
                                                        >
                                                            {/* Tooltip */}
                                                            <div className="tooltip">
                                                                <div style={{ fontWeight: 700 }}>{task.title}</div>
                                                                <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
                                                                    {format(new Date(task.startDate || task.createdAt), 'MMM dd')} - {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'N/A'}
                                                                </div>
                                                                <div style={{ fontSize: '10px', marginTop: '4px', display: 'flex', gap: '8px' }}>
                                                                    <span>{task.status}</span>
                                                                    <span>•</span>
                                                                    <span>{task.progress}%</span>
                                                                </div>
                                                            </div>

                                                            {/* Progress outside */}
                                                            <div style={{ position: 'absolute', right: '-48px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `1.5px solid ${getBarTextColor(task.status)}`, background: 'white' }} />
                                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#42526E' }}>{task.progress}%</span>
                                                            </div>

                                                            {/* Content inside bar */}
                                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px', width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
                                                                {pos.width >= 100 && (
                                                                    <>
                                                                        <span style={{ fontSize: '12px', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block', width: '100%' }}>
                                                                            {task.title}
                                                                        </span>
                                                                        <span style={{ fontSize: '10px', fontWeight: 500, opacity: 0.8, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block', width: '100%' }}>
                                                                            {format(new Date(task.startDate || task.createdAt), 'MMM dd')} - {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'N/A'}
                                                                        </span>
                                                                    </>
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

                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '16px', background: '#FFFFFF', borderTop: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#4C9AFF' }} /><span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Task</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#36B37E' }} /><span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Story</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#FF5630' }} /><span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Design</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14} color="#DE350B" /><span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Blocked</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', background: '#FF8B00' }} /><span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Milestone</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '14px', color: '#6B778C', fontWeight: 800 }}>-</span><span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Dependency</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '2px', background: '#FF5630' }} /><span style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>Today</span></div>
                </div>

                {/* Floating AI Action Button (Existing structure mocked if needed, but the screenshot shows a purple circle with stars icon bottom right) */}
                <button style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: '#403294', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(64, 50, 148, 0.3)', cursor: 'pointer', zIndex: 1000, transition: 'transform 0.2s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                </button>

                {isCreateModalOpen && (
                    <CreateTaskModal 
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={(newTask) => {
                            setTasks(prev => [newTask, ...prev]);
                            setIsCreateModalOpen(false);
                        }}
                    />
                )}
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
