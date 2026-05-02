"use client";

import React from 'react';

interface VelocityChartProps {
    data: { date: string; count: number }[];
}

export default function VelocityChart({ data }: VelocityChartProps) {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const height = 120;
    const width = 300;
    const padding = 20;

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #DFE1E6' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B778C', marginBottom: '20px' }}>Team Velocity (Last 7 Days)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: `${height}px`, width: '100%' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                            width: '100%', 
                            height: `${(d.count / maxCount) * height}px`, 
                            background: '#0052CC', 
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                        }} />
                        <span style={{ fontSize: '11px', color: '#6B778C' }}>{d.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
