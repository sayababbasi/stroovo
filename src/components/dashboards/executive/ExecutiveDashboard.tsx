"use client";

import React from 'react';
import { Target, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

export default function ExecutiveDashboard({ user }: { user: any }) {
  // Competitor standard for Executives (CEO/Founders):
  // Focus on high-level company health, risk alerts, and cross-team OKR progress.
  
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#172B4D' }}>
          Executive Summary
        </h1>
        <p style={{ fontSize: '16px', color: '#6B778C', marginTop: '8px' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Executive'}. Here is the organization's current health.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { title: 'Company OKRs', value: '82%', icon: Target, color: '#0052CC', bgColor: '#E6EFFF' },
          { title: 'Growth Velocity', value: '+14%', icon: TrendingUp, color: '#36B37E', bgColor: '#E3FCEF' },
          { title: 'Projects at Risk', value: '3', icon: AlertTriangle, color: '#FF5630', bgColor: '#FFEBE6' },
          { title: 'Active Teams', value: '12', icon: Activity, color: '#6554C0', bgColor: '#F2F0FF' },
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
        [Strategic OKR & Risk Analytics Chart Placeholder]
      </div>
    </div>
  );
}
