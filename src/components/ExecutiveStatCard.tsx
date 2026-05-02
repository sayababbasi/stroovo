"use client";

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline from './Sparkline';

interface ExecutiveStatCardProps {
    title: string;
    value: string | number;
    trend: string;
    trendType: 'positive' | 'negative' | 'neutral';
    trendText: string;
    sparklineData: number[];
}

export default function ExecutiveStatCard({
    title,
    value,
    trend,
    trendType,
    trendText,
    sparklineData
}: ExecutiveStatCardProps) {
    const isPositive = trendType === 'positive';
    const trendColor = isPositive ? '#36B37E' : (trendType === 'negative' ? '#FF5630' : '#6B778C');
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minWidth: '240px',
            flex: 1
        }}>
            <div style={{ fontSize: '15px', color: '#444444', fontWeight: 500 }}>
                {title}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#172B4D', marginBottom: '8px' }}>
                        {value}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', color: trendColor, fontWeight: 600 }}>
                            <TrendIcon size={14} style={{ marginRight: '2px' }} />
                            {trend}
                        </div>
                        <span style={{ color: '#6B778C' }}>{trendText}</span>
                    </div>
                </div>
                
                <div style={{ paddingBottom: '4px' }}>
                    <Sparkline data={sparklineData} color={trendColor} width={80} height={32} />
                </div>
            </div>
        </div>
    );
}
