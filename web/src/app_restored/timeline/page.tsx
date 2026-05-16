"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    CheckSquare,
    Clock,
    Flag,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    progress: number;
    dueDate: string | null;
    project: { name: string };
    assignee: { name: string | null } | null;
}

export default function TimelinePage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/tasks`)
            .then(res => res.json())
            .then(data => {
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch tasks:', error);
                setLoading(false);
            });
    }, []);

    // Generate 14 days starting from today
    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return '#36B37E';
            case 'IN_PROGRESS': return '#0052CC';
            case 'BLOCKED': return '#FF5630';
            default: return '#6B778C';
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Timeline</h1>
                    <p style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>Gantt-style project timeline</p>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', overflow: 'hidden' }}>
                        {/* Day Headers */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6' }}>
                            <div style={{ width: '200px', padding: '12px 16px', background: '#F4F5F7', borderRight: '1px solid #DFE1E6', fontWeight: 600, fontSize: '13px' }}>
                                Task
                            </div>
                            <div style={{ flex: 1, display: 'flex' }}>
                                {days.map((day, i) => (
                                    <div key={i} style={{
                                        flex: 1,
                                        padding: '8px 4px',
                                        textAlign: 'center',
                                        background: '#F4F5F7',
                                        borderRight: i < days.length - 1 ? '1px solid #EBECF0' : 'none',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ fontWeight: 600 }}>{day.getDate()}</div>
                                        <div style={{ color: '#6B778C' }}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Task Rows */}
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C' }}>Loading timeline...</div>
                        ) : (
                            tasks.slice(0, 8).map((task, rowIndex) => (
                                <div key={task.id} style={{ display: 'flex', borderBottom: '1px solid #EBECF0' }}>
                                    <div style={{ width: '200px', padding: '12px 16px', borderRight: '1px solid #DFE1E6', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckSquare size={14} color={getStatusColor(task.status)} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', position: 'relative', paddingBottom: '8px', paddingTop: '8px' }}>
                                        {/* Task Bar */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            left: `${(rowIndex * 7) % 60 + 5}%`,
                                            width: `${20 + (rowIndex * 5) % 30}%`,
                                            height: '24px',
                                            background: getStatusColor(task.status),
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingLeft: '8px',
                                            fontSize: '11px',
                                            color: 'white',
                                            fontWeight: 500
                                        }}>
                                            {task.progress}%
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
