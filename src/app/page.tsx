"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Target,
  BarChart2,
  ListTodo,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Users
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    goals: 0,
    projects: 0,
    tasks: 0,
    completed: 0,
    blocked: 0,
    inProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [goalsRes, projectsRes, tasksRes] = await Promise.all([
          fetch(`${API_URL}/api/goals`).catch(() => null),
          fetch(`${API_URL}/api/projects`).catch(() => null),
          fetch(`${API_URL}/api/tasks`).catch(() => null),
        ]);

        const goals = goalsRes ? await goalsRes.json().catch(() => []) : [];
        const projects = projectsRes ? await projectsRes.json().catch(() => []) : [];
        const tasks = tasksRes ? await tasksRes.json().catch(() => []) : [];

        const goalsArray = Array.isArray(goals) ? goals : [];
        const projectsArray = Array.isArray(projects) ? projects : [];
        const tasksArray = Array.isArray(tasks) ? tasks : [];

        setStats({
          goals: goalsArray.length,
          projects: projectsArray.length,
          tasks: tasksArray.length,
          completed: tasksArray.filter((t: any) => t.status === 'DONE').length,
          blocked: tasksArray.filter((t: any) => t.status === 'BLOCKED').length,
          inProgress: tasksArray.filter((t: any) => t.status === 'IN_PROGRESS').length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Strategic Goals', value: stats.goals, icon: Target, color: '#6554C0', bgColor: '#F2F0FF' },
    { title: 'Active Projects', value: stats.projects, icon: BarChart2, color: '#0052CC', bgColor: '#E6EFFF' },
    { title: 'Total Tasks', value: stats.tasks, icon: ListTodo, color: '#6B778C', bgColor: '#F4F5F7' },
    { title: 'In Progress', value: stats.inProgress, icon: Zap, color: '#00B8D9', bgColor: '#E6FBFF' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle2, color: '#36B37E', bgColor: '#E3FCEF' },
    { title: 'Blocked', value: stats.blocked, icon: AlertTriangle, color: '#FF5630', bgColor: '#FFEBE6' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F5F7' }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: '240px' }}>
        <div style={{ padding: '32px 32px 24px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#172B4D' }}>Welcome back, Admin</h1>
          <p style={{ fontSize: '16px', color: '#6B778C', marginTop: '8px' }}>Here's a snapshot of your organization's progress.</p>
        </div>

        <div style={{ padding: '24px 32px' }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {statCards.map((stat, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #DFE1E6',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#6B778C', marginBottom: '8px' }}>{stat.title}</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#172B4D' }}>
                    {loading ? '...' : stat.value}
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon size={22} color={stat.color} />
                </div>
              </div>
            ))}
          </div>

          {/* Activity Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', marginBottom: '24px' }}>
                Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#36B37E' }}></div>
                    <span style={{ color: '#172B4D' }}><strong>Design Language - Core tokens</strong> was marked as Done</span>
                  </div>
                  <span style={{ color: '#6B778C' }}>2 hours ago</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0052CC' }}></div>
                    <span style={{ color: '#172B4D' }}><strong>Component Library Implementation</strong> is In Progress</span>
                  </div>
                  <span style={{ color: '#6B778C' }}>4 hours ago</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', marginBottom: '24px' }}>
                Team Velocity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
                <div style={{ fontSize: '64px', fontWeight: 700, color: '#0052CC' }}>78%</div>
                <div style={{ fontSize: '14px', color: '#6B778C', marginTop: '8px' }}>Sprint Goal Completion</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
