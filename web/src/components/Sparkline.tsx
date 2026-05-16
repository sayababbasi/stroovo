"use client";

import React from 'react';

interface SparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}

export default function Sparkline({ data, color = '#36B37E', width = 100, height = 40 }: SparklineProps) {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            {/* Gradient area underneath */}
            <path
                d={`M 0 ${height} ${points.split(' ').map((p, i) => (i === 0 ? `L ${p}` : p)).join(' ')} L ${width} ${height} Z`}
                fill={`url(#gradient-${color.replace('#', '')})`}
                opacity="0.1"
            />
            <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
}
