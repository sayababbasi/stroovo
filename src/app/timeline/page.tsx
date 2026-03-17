"use client";

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    ChevronLeft, 
    ChevronRight, 
    CheckSquare
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
    addYears
} from 'date-fns';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string | null;
    createdAt: string;
    project: { name: string };
    assignee: { name: string | null } | null;
    progress: number;
}

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function TimelinePage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');
    const [baseDate, setBaseDate] = useState(new Date());

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [projectFilter, setProjectFilter] = useState('ALL');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/tasks`)
            .then(res => res.json())
            .then(data => {
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const projects = useMemo(() => {
        const pSet = new Set<string>();
        tasks.forEach(t => { if (t.project?.name) pSet.add(t.project.name); });
        return Array.from(pSet);
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
            const matchesProject = projectFilter === 'ALL' || task.project?.name === projectFilter;
            return matchesStatus && matchesProject;
        });
    }, [tasks, statusFilter, projectFilter]);

    const timeColumns = useMemo(() => {
        const cols = [];
        let start, end;

        switch (viewMode) {
            case 'daily':
                start = addDays(baseDate, -7);
                for (let i = 0; i < 15; i++) {
                    const d = addDays(start, i);
                    cols.push({
                        date: d,
                        label: format(d, 'EEE'),
                        subLabel: format(d, 'MMM d'),
                        width: 100
                    });
                }
                break;
            case 'weekly':
                start = startOfWeek(addWeeks(baseDate, -4));
                for (let i = 0; i < 9; i++) {
                    const d = addWeeks(start, i);
                    cols.push({
                        date: d,
                        label: `Week ${format(d, 'w')}`,
                        subLabel: format(d, 'MMM d'),
                        width: 140
                    });
                }
                break;
            case 'monthly':
                start = startOfMonth(addMonths(baseDate, -3));
                for (let i = 0; i < 7; i++) {
                    const d = addMonths(start, i);
                    cols.push({
                        date: d,
                        label: format(d, 'MMMM'),
                        subLabel: format(d, 'yyyy'),
                        width: 200
                    });
                }
                break;
            case 'yearly':
                start = startOfYear(baseDate);
                for (let i = 0; i < 12; i++) {
                    const d = addMonths(start, i);
                    cols.push({
                        date: d,
                        label: format(d, 'MMM'),
                        subLabel: format(d, 'yyyy'),
                        width: 120
                    });
                }
                break;
        }
        return cols;
    }, [viewMode, baseDate]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return '#36B37E';
            case 'IN_PROGRESS': return '#0052CC';
            case 'BLOCKED': return '#FF5630';
            default: return '#6B778C';
        }
    };

    const getBarColor = (task: Task) => {
        if (task.status === 'DONE') return '#36B37E'; // Green
        if (task.status === 'BLOCKED') return '#E4552F'; // Red/Orange
        if (task.status === 'IN_PROGRESS') return '#0052CC'; // Blue
        return '#6B778C'; // Gray for TODO/Other
    };

    const handlePrevious = () => {
        switch (viewMode) {
            case 'daily': setBaseDate(prev => addDays(prev, -7)); break;
            case 'weekly': setBaseDate(prev => addWeeks(prev, -4)); break;
            case 'monthly': setBaseDate(prev => addMonths(prev, -3)); break;
            case 'yearly': setBaseDate(prev => addYears(prev, -1)); break;
        }
    };

    const handleNext = () => {
        switch (viewMode) {
            case 'daily': setBaseDate(prev => addDays(prev, 7)); break;
            case 'weekly': setBaseDate(prev => addWeeks(prev, 4)); break;
            case 'monthly': setBaseDate(prev => addMonths(prev, 3)); break;
            case 'yearly': setBaseDate(prev => addYears(prev, 1)); break;
        }
    };

    const calculateBarPosition = (task: Task) => {
        if (!timeColumns || timeColumns.length === 0) return null;

        const taskStart = task.startDate ? new Date(task.startDate) : (task.createdAt ? new Date(task.createdAt) : new Date());
        const taskEnd = task.dueDate ? new Date(task.dueDate) : addDays(taskStart, 7); 
        
        if (isNaN(taskStart.getTime()) || isNaN(taskEnd.getTime())) return null;

        const firstColDate = timeColumns[0].date;
        const lastCol = timeColumns[timeColumns.length - 1];
        
        let timelineEnd;
        if (viewMode === 'daily') timelineEnd = addDays(lastCol.date, 1);
        else if (viewMode === 'weekly') timelineEnd = addWeeks(lastCol.date, 1);
        else timelineEnd = addMonths(lastCol.date, 1);

        if (taskEnd < firstColDate || taskStart > timelineEnd) return null;

        const totalPixels = timeColumns.reduce((sum, col) => sum + (col.width || 0), 0);
        const totalDurationMs = timelineEnd.getTime() - firstColDate.getTime();
        
        if (totalDurationMs <= 0 || isNaN(totalDurationMs)) return null;

        const pixelsPerMs = totalPixels / totalDurationMs;

        const startMs = Math.max(taskStart.getTime(), firstColDate.getTime());
        const endMs = Math.min(taskEnd.getTime(), timelineEnd.getTime());
        
        let left = (startMs - firstColDate.getTime()) * pixelsPerMs;
        let width = (endMs - startMs) * pixelsPerMs;

        if (!Number.isFinite(left) || !Number.isFinite(width)) return null;

        return { 
            left: Math.round(left), 
            width: Math.max(Math.round(width), 100)
        };
    };

    return (
        <main style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: '240px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <style>{`
                    *::-webkit-scrollbar { display: none; }
                    * { -ms-overflow-style: none; scrollbar-width: none; }
                    .dual-sticky-container { overflow: auto; height: 100%; position: relative; background: #FFFFFF; }
                    .sticky-top { position: sticky; top: 0; z-index: 200; background: #FAFBFC; border-bottom: 1px solid #EBECF0; }
                    .sticky-left { position: sticky; left: 0; z-index: 100; background: white; border-right: 1px solid #F4F5F7; }
                    .sticky-corner { position: sticky; top: 0; left: 0; z-index: 300; background: #FAFBFC; border-right: 1px solid #EBECF0; }
                    .timeline-bar { transition: all 0.3s ease; display: flex; align-items: center; }
                    .timeline-bar:hover { filter: brightness(0.95); transform: translateY(-1px); z-index: 150; }
                    .grid-line { border-right: 1px solid #F4F5F7; }
                `}</style>

                <div style={{ padding: '20px 40px', borderBottom: '1px solid #DFE1E6', background: '#FFFFFF', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Project Timeline</h1>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                                {(['daily', 'weekly', 'monthly', 'yearly'] as ViewMode[]).map(mode => (
                                    <button 
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            fontSize: '14px', 
                                            fontWeight: viewMode === mode ? 600 : 500,
                                            color: viewMode === mode ? '#0052CC' : '#6B778C',
                                            paddingBottom: '8px',
                                            borderBottom: viewMode === mode ? '2px solid #0052CC' : '2px solid transparent',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #DFE1E6', fontSize: '13px', fontWeight: 600, color: '#42526E', outline: 'none', background: '#FFFFFF', cursor: 'pointer' }}
                            >
                                <option value="ALL">All Status</option>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                                <option value="BLOCKED">Blocked</option>
                            </select>

                            <select 
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #DFE1E6', fontSize: '13px', fontWeight: 600, color: '#42526E', outline: 'none', background: '#FFFFFF', cursor: 'pointer' }}
                            >
                                <option value="ALL">All Projects</option>
                                {projects.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>

                            <div style={{ display: 'flex', background: '#F4F5F7', borderRadius: '4px', padding: '2px' }}>
                                <button onClick={handlePrevious} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#42526E' }}><ChevronLeft size={18} /></button>
                                <button onClick={() => setBaseDate(new Date())} style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '13px', fontWeight: 600, color: '#172B4D', cursor: 'pointer' }}>Today</button>
                                <button onClick={handleNext} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#42526E' }}><ChevronRight size={18} /></button>
                            </div>
                            <button style={{ padding: '8px 20px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>+ Create</button>
                        </div>
                    </div>
                </div>

                <div className="dual-sticky-container">
                    <div style={{ width: 300 + timeColumns.reduce((sum, col) => sum + col.width, 0), display: 'flex', flexDirection: 'column' }}>
                        <div className="sticky-top" style={{ display: 'flex', height: '64px' }}>
                            <div className="sticky-corner" style={{ width: '300px', padding: '0 24px', fontSize: '11px', fontWeight: 700, color: '#6B778C', display: 'flex', alignItems: 'center', borderBottom: '1px solid #EBECF0' }}>TASK</div>
                            <div style={{ display: 'flex' }}>
                                {timeColumns.map((col, i) => {
                                    const isWeekend = col.label === 'Sun' || col.label === 'Sat';
                                    return (
                                        <div key={i} style={{ width: col.width, flexShrink: 0, borderRight: '1px solid #EBECF0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #EBECF0' }}>
                                            <div style={{ fontWeight: 600, fontSize: '12px', color: isWeekend ? '#E4552F' : '#6B778C' }}>{col.label}</div>
                                            <div style={{ fontWeight: 600, fontSize: '12px', color: isWeekend ? '#E4552F' : '#6B778C', marginTop: '4px' }}>{format(col.date, 'd')}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {filteredTasks.map((task) => {
                                const pos = calculateBarPosition(task);
                                const barColor = getBarColor(task);
                                return (
                                    <div key={task.id} style={{ display: 'flex', borderBottom: '1px solid #F4F5F7', height: '60px' }}>
                                        <div className="sticky-left" style={{ width: '300px', padding: '0 24px', display: 'flex', alignItems: 'center', fontSize: '14px', color: '#172B4D', whiteSpace: 'nowrap' }}>
                                            <CheckSquare size={18} style={{ marginRight: '12px', color: getStatusColor(task.status), flexShrink: 0 }} />
                                            <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</span>
                                        </div>

                                        <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
                                            {timeColumns.map((col, i) => (
                                                <div key={i} className="grid-line" style={{ width: col.width, flexShrink: 0, height: '100%' }} />
                                            ))}

                                            {pos && (
                                                <div className="timeline-bar" style={{
                                                    position: 'absolute',
                                                    left: pos.left,
                                                    width: pos.width,
                                                    height: '28px',
                                                    top: '16px',
                                                    backgroundColor: barColor === '#6B778C' ? '#6B778C' : barColor, // Default color for the bar
                                                    borderRadius: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0 4px',
                                                    color: 'white',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    overflow: 'hidden',
                                                    zIndex: 50
                                                }}>
                                                    {/* Progress Fill */}
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        left: 0, 
                                                        top: 0, 
                                                        height: '100%', 
                                                        width: `${task.progress}%`, 
                                                        background: 'rgba(255, 255, 255, 0.2)', // Lighten the original color or use a solid fill?
                                                        // In the reference, the bar is essentially one color but might have a progress indicator.
                                                        // Let's stick to simple solid bars with text as per reference aesthetic.
                                                        zIndex: 0
                                                    }}></div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1, marginLeft: '8px' }}>
                                                        <span>{task.progress}%</span>
                                                        <span style={{ fontWeight: 500, marginLeft: '4px' }}>{task.title}</span>
                                                    </div>

                                                    <div style={{ zIndex: 1 }}>
                                                        <div style={{ 
                                                            width: 20, 
                                                            height: 20, 
                                                            borderRadius: '50%', 
                                                            background: 'rgba(255,255,255,0.3)', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            fontSize: '10px', 
                                                            flexShrink: 0, 
                                                            color: 'white',
                                                            fontWeight: 700 
                                                        }}>
                                                            {task.assignee?.name?.[0] || 'U'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
