"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Task } from '@/types';


interface CalendarViewProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const getTasksForDate = (day: number) => {
        return tasks.filter(task => {
            const dateToUse = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt!);
            return dateToUse.getDate() === day &&
                dateToUse.getMonth() === currentDate.getMonth() &&
                dateToUse.getFullYear() === currentDate.getFullYear();
        });
    };

    const renderCalendarDays = () => {
        const calendarDays = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} style={{ background: '#F4F5F7', borderRight: '1px solid #DFE1E6', borderBottom: '1px solid #DFE1E6' }}></div>);
        }

        // Days of the month
        for (let i = 1; i <= days; i++) {
            const dayTasks = getTasksForDate(i);
            const isToday = new Date().getDate() === i && new Date().getMonth() === currentDate.getMonth();

            calendarDays.push(
                <div key={i} style={{
                    minHeight: '140px',
                    background: 'white',
                    borderRight: '1px solid #DFE1E6',
                    borderBottom: '1px solid #DFE1E6',
                    padding: '8px',
                    position: 'relative'
                }}>
                    <div style={{
                        marginBottom: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isToday ? '#0052CC' : '#6B778C',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: isToday ? '50%' : '0',
                        background: isToday ? '#DEEBFF' : 'transparent'
                    }}>
                        {i}
                    </div>

                    <div
                        className="calendar-task-container"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            overflowY: 'auto',
                            maxHeight: '100px',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none'
                        }}
                    >
                        <style>{`
                            .calendar-task-container::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                        {dayTasks.map(task => (
                            <div key={task.id} 
                                onClick={() => onTaskClick?.(task)}
                                style={{
                                fontSize: '11px',
                                padding: '4px 8px',
                                minHeight: '22px',
                                background: task.status === 'DONE' ? '#E3FCEF' : (task.status === 'REVIEW' ? '#EAE6FF' : '#DEEBFF'),
                                color: task.status === 'DONE' ? '#066444' : (task.status === 'REVIEW' ? '#403294' : '#0747A6'),
                                borderLeft: `3px solid ${task.status === 'DONE' ? '#36B37E' : (task.status === 'REVIEW' ? '#6554C0' : '#0052CC')}`,
                                borderRadius: '3px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer',
                                fontWeight: 500,
                                lineHeight: '14px'
                            }}>
                                {task.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };

    return (
        <div style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D' }}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => navigateMonth(-1)} style={{ padding: '4px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>
                            <ChevronLeft size={16} color="#6B778C" />
                        </button>
                        <button onClick={() => navigateMonth(1)} style={{ padding: '4px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>
                            <ChevronRight size={16} color="#6B778C" />
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F4F5F7', borderBottom: '1px solid #DFE1E6' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>
                        {day}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {renderCalendarDays()}
            </div>
        </div>
    );
}
