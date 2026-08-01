"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Filter,
    ChevronDown,
    MoreVertical,
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle2,
    Target,
    CheckSquare2,
    PieChart,
    Settings,
    Star,
    Sparkles,
    Menu,
    Check
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

    const [selectedCalendars, setSelectedCalendars] = useState<string[]>(['All Tasks', 'My Tasks', 'Quantum UI Overhaul', 'Design', 'Development', 'Marketing']);
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['Completed']);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [groupBy, setGroupBy] = useState('Status');
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

    const metrics = useMemo(() => {
        const total = tasks.length;
        const overdue = tasks.filter(t => {
            const due = new Date(t.dueDate || t.startDate || t.createdAt);
            return due < new Date() && t.status !== 'DONE';
        }).length;
        const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
        const completed = tasks.filter(t => t.status === 'DONE').length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, overdue, inProgress, completed, rate };
    }, [tasks]);

    const uniqueAssignees = useMemo(() => {
        const map = new Map();
        tasks.forEach(t => {
            if (t.assignee && t.assignee.name && !map.has(t.assignee.name)) {
                map.set(t.assignee.name, t.assignee);
            }
        });
        return Array.from(map.values());
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [tasks, searchQuery]);

    const upcomingTasks = useMemo(() => {
        return filteredTasks
            .filter(t => {
                const date = new Date(t.dueDate || t.startDate || t.createdAt);
                return date >= startOfDay(new Date());
            })
            .sort((a, b) => {
                const da = new Date(a.dueDate || a.startDate || a.createdAt);
                const db = new Date(b.dueDate || b.startDate || b.createdAt);
                return da.getTime() - db.getTime();
            });
    }, [filteredTasks]);

    const fetchProjects = async () => {
        const API_URL = '';
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
        const API_URL = '';
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
        
        const API_URL = '';
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#FAFBFC', overflow: 'hidden' }}>
            <style>{`
                .view-tab { padding: 6px 14px; font-size: 13px; font-weight: 500; color: #6B778C; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
                .view-tab.active { background: white; color: #0052CC; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 600; }
                .calendar-event-card:hover { transform: translateY(-1px); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* TOP HEADER */}
            {!hideHeader && (
            <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #DFE1E6', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0F5FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarIcon size={20} />
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#172B4D', margin: 0, letterSpacing: '-0.02em' }}>Calendar</h1>
                </div>

                <div style={{ position: 'relative', width: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8993A4' }} />
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search tasks..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #DFE1E6', fontSize: '13px', width: '100%', outline: 'none', background: '#FAFBFC', color: '#172B4D' }}
                    />
                    <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#0052CC', background: '#F0F5FF', padding: '2px 6px', borderRadius: '4px' }}>PRO TIP</span>
                        <span style={{ fontSize: '11px', color: '#8993A4', fontWeight: 500 }}>Press / to search</span>
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
                    <button 
                        onClick={() => setQuickAddDay(new Date())}
                        style={{ padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', boxShadow: '0 2px 4px rgba(0, 82, 204, 0.15)' }}
                    >
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>
            )}

            {/* TOOLBAR */}
            <div style={{ padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFC', borderBottom: '1px solid #DFE1E6', zIndex: 9 }}>
                <div style={{ display: 'flex', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                    {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(mode => (
                        <div key={mode} className={`view-tab ${viewMode === mode ? 'active' : ''}`} onClick={() => setViewMode(mode)}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '4px' }}>
                        <button onClick={handlePrev} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C', display: 'flex', alignItems: 'center' }}><ChevronLeft size={16} /></button>
                        <button onClick={handleToday} style={{ padding: '4px 12px', border: 'none', background: 'none', fontSize: '13px', fontWeight: 600, color: '#172B4D', cursor: 'pointer' }}>Today</button>
                        <button onClick={handleNext} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C', display: 'flex', alignItems: 'center' }}><ChevronRight size={16} /></button>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : format(currentDate, 'MMM d, yyyy')}
                        <ChevronDown size={16} color="#6B778C" />
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', color: '#6B778C', fontWeight: 600, fontSize: '13px' }}>
                        <Filter size={14} /><span>Filter</span>
                    </button>
                    <div style={{ position: 'relative' }}>
                        <div onClick={() => setShowGroupDropdown(!showGroupDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid #DFE1E6', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>Group: {groupBy}</span>
                            <ChevronDown size={14} color="#6B778C" />
                        </div>
                        {showGroupDropdown && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#FFFFFF', border: '1px solid #DFE1E6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100 }}>
                                {['Status', 'Project', 'Assignee'].map(opt => (
                                    <div key={opt} onClick={() => { setGroupBy(opt); setShowGroupDropdown(false); }} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', background: groupBy === opt ? '#F4F5F7' : 'white' }}>
                                        Group by {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DFE1E6', background: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', color: '#6B778C' }}>
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* MAIN 3-COLUMN CONTENT */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* LEFT SIDEBAR PANEL */}
                {!hideSidebar && (
                <div style={{ width: '240px', flexShrink: 0, background: '#FAFBFC', borderRight: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', padding: '24px 20px', overflowY: 'auto' }} className="hide-scrollbar">
                    {/* Mini Calendar */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>{format(currentDate, 'MMMM yyyy')}</h3>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={handlePrev} style={{ padding: '2px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C' }}><ChevronLeft size={16} /></button>
                                <button onClick={handleNext} style={{ padding: '2px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C' }}><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
                                <div key={`${d}-${i}`} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#97A0AF', padding: '2px 0' }}>{d}</div>
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
                                            padding: '6px 0', 
                                            fontSize: '11px', 
                                            cursor: 'pointer',
                                            borderRadius: '50%',
                                            fontWeight: today || isSelected ? 600 : 500,
                                            color: isSelected ? 'white' : (today ? '#0052CC' : (isSameMonth(day, currentDate) ? '#172B4D' : '#8993A4')),
                                            background: isSelected ? '#0052CC' : 'transparent',
                                        }}
                                    >
                                        {format(day, 'd')}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Calendars List */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>Calendars</h4>
                            <div style={{ display: 'flex', gap: '4px', color: '#6B778C' }}>
                                <Plus size={14} style={{ cursor: 'pointer' }} />
                                <Settings size={14} style={{ cursor: 'pointer' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { name: 'All Tasks', color: '#0052CC' },
                                { name: 'My Tasks', color: '#403294' },
                                { name: 'Quantum UI Overhaul', color: '#36B37E' },
                                { name: 'Design', color: '#FF8B00' },
                                { name: 'Development', color: '#00B8D9' },
                                { name: 'Marketing', color: '#6554C0' },
                                { name: 'Personal', color: '#8993A4' }
                            ].map(cal => (
                                <div key={cal.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => {
                                    if (selectedCalendars.includes(cal.name)) setSelectedCalendars(selectedCalendars.filter(c => c !== cal.name));
                                    else setSelectedCalendars([...selectedCalendars, cal.name]);
                                }}>
                                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: selectedCalendars.includes(cal.name) ? cal.color : 'white', border: `1px solid ${cal.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {selectedCalendars.includes(cal.name) && <Check size={10} color="white" strokeWidth={3} />}
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 500 }}>{cal.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filters List */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>Filters</h4>
                            <div style={{ display: 'flex', gap: '4px', color: '#6B778C' }}>
                                <Settings size={14} style={{ cursor: 'pointer' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { name: 'Overdue', icon: AlertCircle, color: '#FF5630', bg: '#FFEBE6' },
                                { name: 'Due Today', icon: Target, color: '#FF8B00', bg: '#FFFAE6' },
                                { name: 'Due This Week', icon: CalendarIcon, color: '#FFC400', bg: '#FFF0B3' },
                                { name: 'High Priority', icon: AlertCircle, color: '#FF5630', bg: '#FFEBE6' },
                                { name: 'Completed', icon: CheckSquare2, color: '#36B37E', bg: '#E3FCEF' }
                            ].map(filter => (
                                <div key={filter.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: selectedFilters.includes(filter.name) ? 1 : 0.6 }} onClick={() => {
                                    if (selectedFilters.includes(filter.name)) setSelectedFilters(selectedFilters.filter(f => f !== filter.name));
                                    else setSelectedFilters([...selectedFilters, filter.name]);
                                }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: filter.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <filter.icon size={12} color={filter.color} />
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#172B4D', fontWeight: 500 }}>{filter.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {/* CENTER MAIN GRID */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#FAFBFC', padding: '24px' }} className="hide-scrollbar">
                    
                    {/* Summary Cards */}
                    {viewMode === 'month' && (
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { title: 'Total Tasks', value: metrics.total, change: '+12%', color: '#0052CC', isPositive: true },
                            { title: 'Overdue', value: metrics.overdue, change: '↑ 1', color: '#FF5630', isPositive: false },
                            { title: 'In Progress', value: metrics.inProgress, change: null, color: '#00B8D9', isPositive: true },
                            { title: 'Completed', value: metrics.completed, change: '+24%', color: '#36B37E', isPositive: true },
                            { title: 'Completion Rate', value: metrics.rate + '%', change: '+8%', color: '#6554C0', isPositive: true },
                        ].map(stat => (
                            <div key={stat.title} style={{ flex: 1, background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 1px 3px rgba(9, 30, 66, 0.03)' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', marginBottom: '8px' }}>{stat.title}</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D', lineHeight: 1 }}>{stat.value}</span>
                                    {stat.change && (
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: stat.isPositive ? '#36B37E' : '#FF5630', marginBottom: '2px' }}>
                                            {stat.change}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    )}

                    {/* Grid Container */}
                    <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '600px' }}>
                        {viewMode === 'month' && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #DFE1E6' }}>
                                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                                        <div key={i} style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#172B4D', letterSpacing: '0.05em' }}>{day}</div>
                                    ))}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {(() => {
                                        const weeks: Date[][] = [];
                                        for (let i = 0; i < days.length; i += 7) {
                                            weeks.push(days.slice(i, i + 7));
                                        }

                                        return weeks.map((week, weekIdx) => (
                                            <div key={weekIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, minHeight: '120px', borderBottom: weekIdx < weeks.length - 1 ? '1px solid #DFE1E6' : 'none' }}>
                                                {week.map((day, i) => {
                                                    const isSelected = isSameDay(day, currentDate);
                                                    const today = isToday(day);
                                                    const dayTasks = filteredTasks.filter(t => isSameDay(new Date(t.dueDate || t.startDate || t.createdAt), day));
                                                    
                                                    return (
                                                        <div key={i} onClick={() => setCurrentDate(day)} style={{ 
                                                            borderRight: i < 6 ? '1px solid #DFE1E6' : 'none',
                                                            padding: '8px',
                                                            background: isSelected ? '#F8FAFC' : 'white',
                                                            opacity: isSameMonth(day, currentDate) ? 1 : 0.4,
                                                            display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                                                <span style={{ 
                                                                    width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '13px', fontWeight: today ? 700 : 600,
                                                                    color: today ? 'white' : '#172B4D',
                                                                    background: today ? '#0052CC' : 'transparent'
                                                                }}>{format(day, 'd')}</span>
                                                            </div>
                                                            {dayTasks.slice(0, 3).map(task => {
                                                                const bgColor = getStatusColor(task.status);
                                                                const textColor = getStatusTextColor(task.status);
                                                                return (
                                                                    <div key={task.id} style={{ 
                                                                        background: bgColor, 
                                                                        borderRadius: '6px', 
                                                                        padding: '4px 6px',
                                                                        display: 'flex', flexDirection: 'column', gap: '2px',
                                                                        transition: 'transform 0.1s ease'
                                                                    }} className="calendar-event-card" onClick={(e) => { e.stopPropagation(); setSelectedDayTasks({ day, tasks: [task] }); }}>
                                                                        <div style={{ fontSize: '10px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: textColor, marginRight: '4px', verticalAlign: 'middle' }}></span>
                                                                            {task.title}
                                                                        </div>
                                                                        <div style={{ fontSize: '9px', color: textColor, opacity: 0.8, fontWeight: 500, paddingLeft: '8px' }}>
                                                                            {format(new Date(task.dueDate || task.createdAt), 'hh:mm a')}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                            {dayTasks.length > 3 && (
                                                                <div style={{ fontSize: '10px', fontWeight: 600, color: '#0052CC', padding: '2px 4px', cursor: 'pointer' }}>
                                                                    + {dayTasks.length - 3} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))
                                    })()}
                                </div>
                            </>
                        )}
                        {/* KEEP EXISTING WEEK/DAY/AGENDA VIEWS */}
                        {viewMode === 'week' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', background: 'white' }}>
                                 <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', borderBottom: '1px solid #DFE1E6', background: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
                                    <div style={{ borderRight: '1px solid #DFE1E6' }} />
                                    {eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) }).map(day => (
                                        <div key={day.toString()} style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #DFE1E6' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#97A0AF', textTransform: 'uppercase', marginBottom: '4px' }}>{format(day, 'EEE')}</div>
                                            <div style={{ 
                                                fontSize: '18px', fontWeight: 700, 
                                                color: isToday(day) ? '#0052CC' : '#172B4D'
                                            }}>{format(day, 'd')}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', position: 'relative' }}>
                                    <div style={{ borderRight: '1px solid #DFE1E6' }}>
                                        {Array.from({ length: 24 }).map((_, h) => (
                                            <div key={h} style={{ height: '80px', padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 500, color: '#97A0AF', borderBottom: '1px solid #FAFBFC' }}>
                                                {format(new Date().setHours(h, 0), 'h aa')}
                                            </div>
                                        ))}
                                    </div>
                                    {eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) }).map(day => (
                                        <div key={day.toString()} style={{ borderRight: '1px solid #DFE1E6', position: 'relative' }}>
                                            {isSameDay(day, currentTime) && (
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: `${(getHours(currentTime) * 80) + (getMinutes(currentTime) / 60 * 80)}px`,
                                                    left: 0, right: 0, height: '1px', background: '#FF5630', zIndex: 100, pointerEvents: 'none'
                                                }} />
                                            )}
                                            {Array.from({ length: 24 }).map((_, h) => (
                                                <div key={h} style={{ height: '80px', borderBottom: '1px solid #DFE1E6' }} />
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
                                <div style={{ width: '80px', flexShrink: 0, borderRight: '1px solid #DFE1E6', background: 'white' }}>
                                    {Array.from({ length: 24 }).map((_, h) => (
                                        <div key={h} style={{ height: '100px', padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 500, color: '#97A0AF', borderBottom: '1px solid #FAFBFC' }}>
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
                                        <div key={h} style={{ height: '100px', borderBottom: '1px solid #DFE1E6', width: '100%' }} />
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

                {/* RIGHT SIDEBAR PANEL */}
                {!hideSidebar && (
                <div style={{ width: '320px', flexShrink: 0, background: 'white', borderLeft: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="hide-scrollbar">
                    
                    {/* Selected Day Agenda */}
                    <div style={{ padding: '24px 20px', borderBottom: '1px solid #DFE1E6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D', margin: 0, lineHeight: 1.3 }}>{format(currentDate, 'EEE, MMM d, yyyy')}</h3>
                            <div style={{ background: '#F4F5F7', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#6B778C' }}>
                                {filteredTasks.filter(t => isSameDay(new Date(t.dueDate || t.startDate || t.createdAt), currentDate)).length} tasks
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredTasks.filter(t => isSameDay(new Date(t.dueDate || t.startDate || t.createdAt), currentDate)).map(t => (
                                <div key={t.id} style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', minWidth: '60px', paddingTop: '2px' }}>
                                        {format(new Date(t.dueDate || t.createdAt), 'hh:mm a')}
                                    </div>
                                    <div style={{ flex: 1, borderLeft: `2px solid ${getStatusTextColor(t.status)}`, paddingLeft: '12px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '4px' }}>{t.title}</div>
                                        <div style={{ fontSize: '11px', color: '#6B778C', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>{t.status === 'DONE' ? 'Completed' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}</span>
                                            {t.assignee && (
                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700 }}>
                                                    {t.assignee.name?.substring(0, 2).toUpperCase() || 'A'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredTasks.filter(t => isSameDay(new Date(t.dueDate || t.startDate || t.createdAt), currentDate)).length === 0 && (
                                <div style={{ fontSize: '13px', color: '#8993A4', fontWeight: 500 }}>No tasks scheduled.</div>
                            )}
                            <button 
                                onClick={() => setQuickAddDay(currentDate)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', border: 'none', background: 'none', color: '#0052CC', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}
                            >
                                <Plus size={16} /> Add Task
                            </button>
                        </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div style={{ padding: '24px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', margin: 0 }}>Upcoming</h3>
                            <button style={{ background: 'none', border: 'none', color: '#0052CC', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>View all</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {upcomingTasks.slice(0, 5).map(t => {
                                const d = new Date(t.dueDate || t.startDate || t.createdAt);
                                return (
                                <div key={t.id} style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ minWidth: '40px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{format(d, 'MMM d')}</div>
                                    </div>
                                    <div style={{ flex: 1, borderLeft: `2px solid ${getStatusTextColor(t.status)}`, paddingLeft: '12px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '4px' }}>{t.title}</div>
                                        <div style={{ fontSize: '11px', color: '#6B778C', fontWeight: 500 }}>
                                            {format(d, 'hh:mm a')}
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                )}
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
        <main style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F4F5F7' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '260px', display: 'flex', overflow: 'hidden' }}>
                <CalendarView />
            </div>
        </main>
    );
}
