"use client";

import React from 'react';
import { Users, AlertCircle, CheckSquare, Clock } from 'lucide-react';

export default function ManagerDashboard({ user }: { user: any }) {
  // Competitor standard for Managers:
  // Focus on team workload, sprint velocity, unblocking tickets, and deadline distribution.
  
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#172B4D' }}>
          Team Workload
        </h1>
        <p style={{ fontSize: '16px', color: '#6B778C', marginTop: '8px' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Manager'}. Monitor your team's sprint and unblock tasks.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { title: 'Team Velocity', value: '92%', icon: Users, color: '#0052CC', bgColor: '#E6EFFF' },
          { title: 'Overdue Tasks', value: '5', icon: Clock, color: '#FF991F', bgColor: '#FFF0B3' },
          { title: 'Blocked Tickets', value: '2', icon: AlertCircle, color: '#FF5630', bgColor: '#FFEBE6' },
          { title: 'Completed This Week', value: '48', icon: CheckSquare, color: '#36B37E', bgColor: '#E3FCEF' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px', display: 'flex', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '13px', color: '#6B778C', marginBottom: '8px' }}>{stat.title}</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#172B4D' }}>{stat.value}</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: stat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={22} color={stat.color} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #DFE1E6', padding: '24px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
        [Team Capacity & Burndown Chart Placeholder]
      </div>
    </div>
  );
}
