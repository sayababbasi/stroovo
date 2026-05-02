"use client";

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    ChevronLeft,
    ChevronRight,
    Plus
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    startOfDay,
    endOfDay,
    getHours,
    getMinutes,
    differenceInDays
} from 'date-fns';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    startDate: string | null;
    dueDate: string | null;
    createdAt: string;
    project: { name: string };
    assignee: { name: string | null } | null;
    progress: number;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

export function CalendarView({ 
    hideHeader, 
    hideSidebar,
    teamId,
    initialTasks 
}: { 
    hideHeader?: boolean, 
    hideSidebar?: boolean,
    teamId?: string,
    initialTasks?: any[]
} = {}) {
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
    const [loading, setLoading] = useState(!initialTasks);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDayTasks, setSelectedDayTasks] = useState<{ day: Date, tasks: Task[] } | null>(null);
    const [quickAddDay, setQuickAddDay] = useState<Date | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchProjects = async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        try {
            const res = await fetch(`${API_URL}/api/projects`);
            if (res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    setProjects(Array.isArray(data) ? data : []);
                } else {
                    console.error("Expected JSON but got:", contentType);
                }
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const fetchTasks = () => {
        if (initialTasks) return;
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        const url = teamId ? `${API_URL}/api/team-tasks?teamId=${teamId}` : `${API_URL}/api/tasks`;
        
        fetch(url)
            .then(res => {
                const contentType = res.headers.get("content-type");
                if (res.ok && contentType && contentType.includes("application/json")) {
                    return res.json();
                }
                throw new Error(`Invalid response: ${res.status} ${contentType}`);
            })
            .then(data => {
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleAddTask = async () => {
        if (!newTaskTitle || !quickAddDay) return;
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        try {
            const res = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTaskTitle,
                    startDate: quickAddDay.toISOString(),
                    dueDate: quickAddDay.toISOString(),
                    status: 'TODO',
                    priority: 'MEDIUM',
                    progress: 0
                })
            });
            if (res.ok) {
                setNewTaskTitle('');
                setQuickAddDay(null);
                fetchTasks();
            }
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    };

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
        fetchProjects();
    }, [teamId]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [tasks, searchQuery]);

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return '#E3FCEF'; // Softer green
            case 'IN_PROGRESS': return '#E9F2FF'; // Softer blue
            case 'BLOCKED': return '#FFEBE6'; // Softer red
            case 'TODO': return '#F4F5F7'; // Minimalist grey
            default: return '#E9F2FF';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'DONE': return '#006644';
            case 'IN_PROGRESS': return '#0052CC';
            case 'BLOCKED': return '#BF2600';
            case 'TODO': return '#42526E';
            default: return '#0052CC';
        }
    };

    const renderEventCard = (task: Task, size: 'sm' | 'md' | 'lg' = 'md') => {
        const bgColor = getStatusColor(task.status);
        const textColor = getStatusTextColor(task.status);
        
        return (
            <div key={task.id} style={{
                background: bgColor,
                borderLeft: `3px solid ${textColor}`,
                padding: size === 'sm' ? '4px 8px' : '10px 12px',
                borderRadius: '4px',
                marginBottom: '2px',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
                position: 'relative',
                overflow: 'hidden'
            }} className="calendar-event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                        fontSize: size === 'sm' ? '11px' : '13px', 
                        fontWeight: 600, 
                        color: textColor, 
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {task.title}
                    </span>
                </div>
                {size !== 'sm' && task.dueDate && (
                    <div style={{ fontSize: '10px', color: textColor, fontWeight: 500, marginTop: '2px', opacity: 0.8 }}>
                        {format(new Date(task.dueDate), 'h:mm a')}
                    </div>
                )}
            </div>
        );
    };

    const handlePrev = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
        if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
    };

    const handleNext = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
        if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    return (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#F4F5F7', position: 'relative' }}>
            {/* Left Mini-Calendar Sidebar area */}
            {!hideSidebar && (
            <div style={{ width: '280px', flexShrink: 0, background: 'white', borderRight: '1px solid #EDF2F7', display: 'flex', flexDirection: 'column', padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#172B4D' }}>{format(currentDate, 'MMMM yyyy')}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handlePrev} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C' }}><ChevronLeft size={18} /></button>
                            <button onClick={handleNext} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C' }}><ChevronRight size={18} /></button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                        {['S','M','T','W','T','F','S'].map((d, i) => (
                            <div key={`${d}-${i}`} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#97A0AF', padding: '4px 0' }}>{d}</div>
                        ))}
                        {eachDayOfInterval({
                            start: startOfWeek(startOfMonth(currentDate)),
                            end: endOfWeek(endOfMonth(currentDate))
                        }).map((day, i) => {
                            const isSelected = isSameDay(day, currentDate);
                            const today = isToday(day);
                            return (
                                <div 
                                    key={day.toString()} 
                                    onClick={() => setCurrentDate(day)}
                                    style={{ 
                                        textAlign: 'center', 
                                        padding: '8px 0', 
                                        fontSize: '12px', 
                                        cursor: 'pointer',
                                        borderRadius: '50%',
                                        fontWeight: today || isSelected ? 600 : 400,
                                        color: isSelected ? 'white' : (today ? '#0052CC' : (isSameMonth(day, currentDate) ? '#172B4D' : '#BFDBFE')),
                                        background: isSelected ? '#0052CC' : 'transparent',
                                        position: 'relative'
                                    }}
                                >
                                    {format(day, 'd')}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Project Name at Bottom of Small Calendar */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid #EDF2F7', paddingTop: '20px' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#97A0AF', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Project</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #EDF2F7' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0052CC' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {projects[0]?.name || 'Stroovo Cloud'}
                        </span>
                    </div>
                </div>
            </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
                <style>{`
                    .view-tab { padding: 6px 14px; font-size: 13px; font-weight: 500; color: #6B778C; cursor: pointer; border-radius: 4px; transition: all 0.2s; }
                    .view-tab.active { background: white; color: #0052CC; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 600; }
                    .calendar-event-card:hover { transform: translateY(-1px); }
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>

                <div style={{ 
                    padding: hideHeader ? '12px 24px' : '20px 32px', 
                    borderBottom: '1px solid #EDF2F7', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        {!hideHeader && <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#172B4D' }}>Calendar</h1>}
                        
                        <div style={{ display: 'flex', background: '#F4F5F7', padding: '3px', borderRadius: '6px' }}>
                            {(['day', 'week', 'month', 'agenda'] as ViewMode[]).map(mode => (
                                <div 
                                    key={mode} 
                                    className={`view-tab ${viewMode === mode ? 'active' : ''}`}
                                    onClick={() => setViewMode(mode)}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                         <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', fontSize: '13px', width: '180px', outline: 'none' }}
                            />
                        </div>
                        <button onClick={handleToday} style={{ border: '1px solid #DFE1E6', background: 'white', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, color: '#42526E', cursor: 'pointer' }}>Today</button>
                        {!hideHeader && (
                        <button 
                            onClick={() => setQuickAddDay(new Date())}
                            style={{ padding: '8px 20px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                        >
                            <Plus size={18} /> Add Event
                        </button>
                        )}
                    </div>
                </div>

                {/* Secondary Navigation */}
                <div style={{ padding: '12px 32px', borderBottom: '1px solid #EDF2F7', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={handlePrev} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#6B778C' }}><ChevronLeft size={20} /></button>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#172B4D', minWidth: '160px', textAlign: 'center' }}>
                        {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : format(currentDate, 'MMM d, yyyy')}
                    </span>
                    <button onClick={handleNext} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#6B778C' }}><ChevronRight size={20} /></button>
                </div>

                {/* Calendar Content */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {viewMode === 'month' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F4F5F7', borderBottom: '1px solid #EDF2F7' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                    <div key={i} style={{ padding: '10px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#97A0AF', textTransform: 'uppercase' }}>{day}</div>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflow: 'auto', background: 'white', display: 'flex', flexDirection: 'column' }}>
                                {(() => {
                                    const weeks: Date[][] = [];
                                    for (let i = 0; i < days.length; i += 7) {
                                        weeks.push(days.slice(i, i + 7));
                                    }

                                    return weeks.map((week, weekIdx) => {
                                        const weekStart = week[0];
                                        const weekEnd = week[6];
                                        
                                        const weekTasks = filteredTasks.filter(t => {
                                            const start = new Date(t.startDate || t.createdAt);
                                            const end = new Date(t.dueDate || t.startDate || t.createdAt);
                                            return (start <= weekEnd && end >= weekStart);
                                        }).sort((a, b) => {
                                            const d1 = differenceInDays(new Date(a.dueDate || a.createdAt), new Date(a.startDate || a.createdAt));
                                            const d2 = differenceInDays(new Date(b.dueDate || b.createdAt), new Date(b.startDate || b.createdAt));
                                            return d2 - d1;
                                        });

                                        const taskPositions: { task: Task, colStart: number, span: number, row: number }[] = [];
                                        const occupied = new Set<string>();

                                        weekTasks.forEach(t => {
                                            const start = new Date(t.startDate || t.createdAt);
                                            const end = new Date(t.dueDate || t.startDate || t.createdAt);
                                            const startInWeek = start < weekStart ? weekStart : start;
                                            const endInWeek = end > weekEnd ? weekEnd : end;
                                            const colStart = week.findIndex(d => isSameDay(d, startInWeek));
                                            const colEnd = week.findIndex(d => isSameDay(d, endInWeek));
                                            const span = colEnd - colStart + 1;

                                            let row = 0;
                                            while (true) {
                                                let isFree = true;
                                                for (let c = colStart; c <= colEnd; c++) {
                                                    if (occupied.has(`${row}-${c}`)) { isFree = false; break; }
                                                }
                                                if (isFree) break;
                                                row++;
                                            }
                                            for (let c = colStart; c <= colEnd; c++) { occupied.add(`${row}-${c}`); }
                                            taskPositions.push({ task: t, colStart, span, row });
                                        });

                                         return (
                                            <div key={weekIdx} style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(7, 1fr)', 
                                                minHeight: '140px',
                                                borderBottom: '1px solid #EDF2F7',
                                                position: 'relative',
                                                background: 'white',
                                                overflow: 'hidden'
                                            }}>
                                                {week.map((day, i) => (
                                                    <div key={i} onClick={() => setQuickAddDay(day)} style={{ 
                                                        borderRight: i < 6 ? '1px solid #EDF2F7' : 'none',
                                                        padding: '10px',
                                                        position: 'relative',
                                                        opacity: isSameMonth(day, currentDate) ? 1 : 0.4
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                            <span style={{ 
                                                                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '13px', fontWeight: isToday(day) ? 700 : 500,
                                                                color: isToday(day) ? 'white' : '#172B4D',
                                                                background: isToday(day) ? '#0052CC' : 'transparent'
                                                            }}>{format(day, 'd')}</span>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: '40px', 
                                                    left: 0, 
                                                    right: 0, 
                                                    bottom: 0, 
                                                    pointerEvents: 'none', 
                                                    display: 'grid', 
                                                    gridTemplateColumns: 'repeat(7, 1fr)', 
                                                    gridAutoRows: '30px',
                                                    overflowY: 'auto',
                                                    overflowX: 'hidden',
                                                    paddingBottom: '10px'
                                                }} className="hide-scrollbar">
                                                    {taskPositions.map((pos, idx) => {
                                                        const { task, colStart, span, row } = pos;
                                                        return (
                                                            <div 
                                                                key={`${task.id}-${weekIdx}`} 
                                                                onClick={(e) => { e.stopPropagation(); setSelectedDayTasks({ day: week[colStart], tasks: [task] }); }}
                                                                style={{
                                                                    gridColumn: `${colStart + 1} / span ${span}`,
                                                                    gridRow: `${row + 1}`,
                                                                    pointerEvents: 'auto',
                                                                    padding: '1px 4px',
                                                                    zIndex: 10 + row
                                                                }}
                                                            >
                                                                {renderEventCard(task, 'sm')}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </>
                    )}
                    {viewMode === 'week' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', background: 'white' }}>
                             <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', borderBottom: '1px solid #EDF2F7', background: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
                                <div style={{ borderRight: '1px solid #EDF2F7' }} />
                                {eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) }).map(day => (
                                    <div key={day.toString()} style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #EDF2F7' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#97A0AF', textTransform: 'uppercase', marginBottom: '4px' }}>{format(day, 'EEE')}</div>
                                        <div style={{ 
                                            fontSize: '18px', fontWeight: 700, 
                                            color: isToday(day) ? '#0052CC' : '#172B4D'
                                        }}>{format(day, 'd')}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', position: 'relative' }}>
                                <div style={{ borderRight: '1px solid #EDF2F7' }}>
                                    {Array.from({ length: 24 }).map((_, h) => (
                                        <div key={h} style={{ height: '80px', padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 500, color: '#97A0AF', borderBottom: '1px solid #F4F5F7' }}>
                                            {format(new Date().setHours(h, 0), 'h aa')}
                                        </div>
                                    ))}
                                </div>
                                {eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) }).map(day => (
                                    <div key={day.toString()} style={{ borderRight: '1px solid #EDF2F7', position: 'relative' }}>
                                        {isSameDay(day, currentTime) && (
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: `${(getHours(currentTime) * 80) + (getMinutes(currentTime) / 60 * 80)}px`,
                                                left: 0, right: 0, height: '1px', background: '#FF5630', zIndex: 100, pointerEvents: 'none'
                                            }} />
                                        )}
                                        {Array.from({ length: 24 }).map((_, h) => (
                                            <div key={h} style={{ height: '80px', borderBottom: '1px solid #EDF2F7' }} />
                                        ))}
                                        {filteredTasks.filter(t => isSameDay(new Date(t.dueDate || t.startDate || t.createdAt), day)).map((t, idx) => {
                                            const date = new Date(t.dueDate || t.startDate || t.createdAt);
                                            const h = date.getHours();
                                            const m = date.getMinutes();
                                            return (
                                                <div key={t.id} style={{ position: 'absolute', top: `${h * 80 + (m/60) * 80}px`, left: '4px', right: '4px', zIndex: 10 + idx }}>
                                                    {renderEventCard(t, 'md')}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {viewMode === 'day' && (
                        <div style={{ flex: 1, display: 'flex', overflow: 'auto', background: 'white' }}>
                            <div style={{ width: '80px', flexShrink: 0, borderRight: '1px solid #EDF2F7', background: 'white' }}>
                                {Array.from({ length: 24 }).map((_, h) => (
                                    <div key={h} style={{ height: '100px', padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 500, color: '#97A0AF', borderBottom: '1px solid #F4F5F7' }}>
                                        {format(new Date().setHours(h, 0), 'h:00 aa')}
                                    </div>
                                ))}
                            </div>
                            <div style={{ flex: 1, position: 'relative', background: 'white' }}>
                                 {isSameDay(currentDate, currentTime) && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: `${(getHours(currentTime) * 100) + (getMinutes(currentTime) / 60 * 100)}px`,
                                        left: 0, right: 0, height: '1px', background: '#FF5630', zIndex: 100, pointerEvents: 'none'
                                    }} />
                                )}
                                {Array.from({ length: 24 }).map((_, h) => (
                                    <div key={h} style={{ height: '100px', borderBottom: '1px solid #EDF2F7', width: '100%' }} />
                                ))}
                                {filteredTasks.filter(t => isSameDay(new Date(t.dueDate || t.startDate || t.createdAt), currentDate)).map((t, idx) => {
                                    const date = new Date(t.dueDate || t.startDate || t.createdAt);
                                    const h = date.getHours();
                                    const m = date.getMinutes();
                                    return (
                                        <div key={t.id} style={{ 
                                            position: 'absolute', 
                                            top: `${h * 100 + (m/60) * 100}px`,
                                            left: '20px', width: '80%', zIndex: 50 + idx
                                        }}>
                                            {renderEventCard(t, 'lg')}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {viewMode === 'agenda' && (
                        <div style={{ flex: 1, overflow: 'auto', padding: '40px 80px', background: 'white' }}>
                            <div style={{ maxWidth: '700px' }}>
                                {filteredTasks.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '100px', color: '#97A0AF' }}>
                                        <p style={{ fontSize: '14px' }}>No upcoming events.</p>
                                    </div>
                                ) : (
                                    (() => {
                                        const grouped = filteredTasks.reduce((acc, t) => {
                                            const d = format(new Date(t.startDate || t.createdAt), 'yyyy-MM-dd');
                                            if (!acc[d]) acc[d] = [];
                                            acc[d].push(t);
                                            return acc;
                                        }, {} as Record<string, Task[]>);

                                        return Object.entries(grouped)
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .map(([dateStr, dayTasks]) => {
                                                const d = new Date(dateStr);
                                                return (
                                                    <div key={dateStr} style={{ marginBottom: '40px' }}>
                                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0052CC', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
                                                            {format(d, 'EEEE, MMM d')}
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {dayTasks.map(t => (
                                                                <div key={t.id} style={{ width: '100%' }}>
                                                                    {renderEventCard(t, 'md')}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                    })()
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedDayTasks && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', width: '440px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D' }}>{format(selectedDayTasks.day, 'MMMM d, yyyy')}</h3>
                            <button onClick={() => setSelectedDayTasks(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C' }}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedDayTasks.tasks.map(t => renderEventCard(t, 'md'))}
                        </div>
                        <button onClick={() => { setSelectedDayTasks(null); setQuickAddDay(selectedDayTasks.day); }} style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '6px', background: '#0052CC', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                            Add Task
                        </button>
                    </div>
                </div>
            )}

            {quickAddDay && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', width: '400px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', marginBottom: '4px' }}>New Event</h3>
                        <p style={{ fontSize: '13px', color: '#6B778C', marginBottom: '24px' }}>{format(quickAddDay, 'EEEE, MMMM d')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input 
                                autoFocus
                                placeholder="What needs to be done?" 
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #DFE1E6', outline: 'none', fontSize: '14px' }}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setQuickAddDay(null)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#F4F5F7', color: '#42526E', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleAddTask} style={{ flex: 2, padding: '10px', borderRadius: '6px', border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Create Event</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CalendarPage() {
    return (
        <main style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#F4F5F7' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '240px', display: 'flex', overflow: 'hidden' }}>
                <CalendarView />
            </div>
        </main>
    );
}
