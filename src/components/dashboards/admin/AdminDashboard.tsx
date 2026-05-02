"use client";

import React, { useState, useEffect } from 'react';
import { Target, BarChart2, ListTodo, Users, Settings, Activity, ShieldCheck } from 'lucide-react';
import UserManagementPanel from './UserManagementPanel';
import TeamManagementPanel from './TeamManagementPanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function AdminDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    tasks: 0,
    teams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const [usersRes, projectsRes, tasksRes] = await Promise.all([
          fetch(`${API_URL}/api/users`).catch(() => null),
          fetch(`${API_URL}/api/projects`).catch(() => null),
          fetch(`${API_URL}/api/tasks`).catch(() => null),
        ]);

        const users = usersRes ? await usersRes.json().catch(() => []) : [];
        const projects = projectsRes ? await projectsRes.json().catch(() => []) : [];
        const tasks = tasksRes ? await tasksRes.json().catch(() => []) : [];

        setStats({
          users: Array.isArray(users) ? users.length : 0,
          projects: Array.isArray(projects) ? projects.length : 0,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
          teams: 0, // Teams API to be built
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'teams', label: 'Teams', icon: Target },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '32px 32px 24px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#172B4D' }}>
          Admin Console
        </h1>
        <p style={{ fontSize: '16px', color: '#6B778C', marginTop: '8px' }}>
          Manage users, roles, teams, and monitor system health.
        </p>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 4px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #0052CC' : '2px solid transparent',
                color: activeTab === tab.id ? '#0052CC' : '#6B778C',
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {[
                { title: 'Total Users', value: stats.users, icon: Users, color: '#6554C0', bgColor: '#F2F0FF' },
                { title: 'Active Projects', value: stats.projects, icon: BarChart2, color: '#0052CC', bgColor: '#E6EFFF' },
                { title: 'Total Tasks', value: stats.tasks, icon: ListTodo, color: '#36B37E', bgColor: '#E3FCEF' },
                { title: 'Teams', value: stats.teams, icon: Target, color: '#FF991F', bgColor: '#FFF0B3' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #DFE1E6',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6B778C', marginBottom: '8px' }}>{stat.title}</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#172B4D' }}>
                      {loading ? '...' : stat.value}
                    </div>
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '8px',
                    background: stat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <stat.icon size={22} color={stat.color} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D' }}>System Activity log</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F4F5F7', borderRadius: '6px' }}>
                    <Activity size={18} color="#0052CC" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', color: '#172B4D', margin: 0 }}><strong>Sarah Jenkins</strong> changed role of <strong>Mike Ross</strong> to CEO</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6B778C' }}>Just now</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F4F5F7', borderRadius: '6px' }}>
                    <ShieldCheck size={18} color="#36B37E" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', color: '#172B4D', margin: 0 }}>System backup completed successfully</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6B778C' }}>2 hours ago</span>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', marginBottom: '24px' }}>Subscription & Limits</h3>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#6B778C' }}>Active Users</span>
                    <span style={{ fontWeight: 600, color: '#172B4D' }}>{stats.users} / 100</span>
                  </div>
                  <div style={{ height: '8px', background: '#DFE1E6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.users / 100) * 100}%`, height: '100%', background: '#0052CC' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#6B778C' }}>Storage Used</span>
                    <span style={{ fontWeight: 600, color: '#172B4D' }}>45GB / 100GB</span>
                  </div>
                  <div style={{ height: '8px', background: '#DFE1E6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: '#36B37E' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagementPanel />}
        {activeTab === 'teams' && <TeamManagementPanel />}
        
        {activeTab === 'roles' && (
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', marginBottom: '16px' }}>Roles & Permissions</h3>
             <p style={{ color: '#6B778C', fontSize: '14px' }}>Manage system-level permissions for each role. (Coming soon)</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', marginBottom: '16px' }}>Tenant Settings</h3>
             <p style={{ color: '#6B778C', fontSize: '14px' }}>Configure branding, custom domain, and global preferences. (Coming soon)</p>
          </div>
        )}

      </div>
    </div>
  );
}
