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
    isToday
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

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        fetch(`${API_URL}/api/tasks`)
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

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return '#36B37E';
            case 'IN_PROGRESS': return '#0052CC';
            case 'BLOCKED': return '#FF5630';
            default: return '#6B778C';
        }
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    return (
        <main style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#F4F5F7' }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
                <div style={{ padding: '24px 40px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#172B4D' }}>Calendar</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F4F5F7', padding: '4px', borderRadius: '6px' }}>
                            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#42526E' }}><ChevronLeft size={18} /></button>
                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#172B4D', minWidth: '140px', textAlign: 'center' }}>{format(currentMonth, 'MMMM yyyy')}</span>
                            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#42526E' }}><ChevronRight size={18} /></button>
                        </div>
                        <button onClick={handleToday} style={{ border: '1px solid #DFE1E6', background: 'white', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: 600, color: '#42526E', cursor: 'pointer' }}>Today</button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ padding: '8px 20px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} /> Add Event
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F4F5F7', borderBottom: '1px solid #DFE1E6' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#6B778C' }}>
                            {day.toUpperCase()}
                        </div>
                    ))}
                </div>

                <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(120px, 1fr)' }}>
                    {days.map((day, i) => {
                        const dayTasks = tasks.filter(task => {
                            const date = task.dueDate || task.startDate || task.createdAt;
                            return date && isSameDay(new Date(date), day);
                        });

                        return (
                            <div key={i} style={{ 
                                borderRight: '1px solid #F4F5F7', 
                                borderBottom: '1px solid #F4F5F7',
                                background: isSameMonth(day, currentMonth) ? 'white' : '#FAFBFC',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                position: 'relative',
                                minHeight: '120px'
                            }}>
                                <div style={{ 
                                    fontSize: '13px', 
                                    fontWeight: isToday(day) ? 700 : 500,
                                    color: isToday(day) ? '#0052CC' : (isSameMonth(day, currentMonth) ? '#172B4D' : '#6B778C'),
                                    textAlign: 'right',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}>
                                    <span style={{ 
                                        width: '24px', 
                                        height: '24px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        background: isToday(day) ? '#E6EFFC' : 'transparent'
                                    }}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                                    {dayTasks.map(task => (
                                        <div key={task.id} style={{ 
                                            padding: '4px 8px', 
                                            background: getStatusColor(task.status),
                                            color: 'white',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
