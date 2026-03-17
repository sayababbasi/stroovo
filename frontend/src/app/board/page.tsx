"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import BoardView from '@/components/BoardView';
import { Plus, Filter } from 'lucide-react';
import { Task } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function BoardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/tasks`);
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskUpdate = async (taskId: string, newStatus: string) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error('Failed to update task status:', error);
            fetchTasks(); // Revert on failure
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                {/* Header */}
                <div style={{ padding: '20px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#172B4D' }}>Kanban Board</h1>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #DFE1E6', borderRadius: '4px', background: '#FFFFFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                            <Filter size={14} />
                            Filter
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: 'none', borderRadius: '4px', background: '#0052CC', color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                            <Plus size={14} />
                            Create Task
                        </button>
                    </div>
                </div>

                {/* Board Area */}
                <div style={{ padding: '24px 32px' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C' }}>Loading board...</div>
                    ) : (
                        <BoardView
                            tasks={tasks}
                            onTaskUpdate={handleTaskUpdate}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
