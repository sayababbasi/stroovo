"use client";

import React, { useState, useEffect } from 'react';
import { ListTodo, Zap, CheckCircle2, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function EmployeeDashboard({ user }: { user: any }) {
  // Competitor standard for Employees/Individual Contributors:
  // "Focus View" - Only show them exactly what they need to work on TODAY. Distraction free.
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`${API_URL}/api/tasks`).catch(() => null);
        const data = res ? await res.json().catch(() => []) : [];
        setTasks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const todoTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#172B4D' }}>
          Good morning, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p style={{ fontSize: '16px', color: '#6B778C', marginTop: '8px' }}>
          Here is your focus for today.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { title: 'My Tasks', value: todoTasks.length, icon: ListTodo, color: '#0052CC', bgColor: '#E6EFFF' },
          { title: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, icon: Zap, color: '#FF991F', bgColor: '#FFF0B3' },
          { title: 'Due Today', value: '2', icon: Clock, color: '#FF5630', bgColor: '#FFEBE6' },
          { title: 'Done This Week', value: tasks.filter(t => t.status === 'DONE').length, icon: CheckCircle2, color: '#36B37E', bgColor: '#E3FCEF' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: stat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{loading ? '...' : stat.value}</div>
            <div style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>{stat.title}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', marginBottom: '20px' }}>Up Next For You</h3>
        
        {loading ? (
           <div style={{ color: '#6B778C', textAlign: 'center', padding: '20px' }}>Loading tasks...</div>
        ) : todoTasks.length === 0 ? (
           <div style={{ color: '#6B778C', textAlign: 'center', padding: '40px' }}>You have no tasks lined up! 🎉</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todoTasks.slice(0, 5).map((task, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #DFE1E6', borderRadius: '6px', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#0052CC'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#DFE1E6'}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid #DFE1E6', cursor: 'pointer' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#172B4D' }}>{task.title}</div>
                  <div style={{ fontSize: '13px', color: '#6B778C', marginTop: '4px' }}>{task.project?.name || 'General'}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', background: task.priority === 'HIGH' || task.priority === 'URGENT' ? '#FFEBE6' : '#F4F5F7', color: task.priority === 'HIGH' || task.priority === 'URGENT' ? '#DE350B' : '#6B778C' }}>
                  {task.priority || 'MEDIUM'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
