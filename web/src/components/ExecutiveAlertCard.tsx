"use client";

import React from 'react';
import { AlertCircle, ChevronRight, Clock, ShieldCheck, Zap } from 'lucide-react';

interface ExecutiveAlertCardProps {
    type: 'delay' | 'overload' | 'risk';
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    confidence: number;
    description: string;
    subpoints?: string[];
    onFix?: () => void;
    onView?: () => void;
    onIgnore?: () => void;
}

export default function ExecutiveAlertCard({
    type,
    title,
    priority,
    confidence,
    description,
    subpoints,
    onFix,
    onView,
    onIgnore
}: ExecutiveAlertCardProps) {
    const priorityColor = priority === 'High' ? '#FF5630' : (priority === 'Medium' ? '#FFAB00' : '#36B37E');
    const Icon = type === 'delay' ? Clock : (type === 'overload' ? AlertCircle : ShieldCheck);

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #EBECF0',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'all 0.2s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px', 
                        background: `${priorityColor}15`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <Icon size={20} color={priorityColor} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#172B4D', margin: 0 }}>{title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#6B778C' }}>Priority:</span>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: priorityColor }}>{priority}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Zap size={12} color="#6554C0" />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6554C0' }}>{confidence}% confidence</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '15px', color: '#42526E', margin: 0, lineHeight: '1.6' }}>
                {description}
            </p>

            {subpoints && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', borderLeft: '2px solid #EBECF0' }}>
                    {subpoints.map((point, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B778C' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6B778C' }} />
                            {point}
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                    onClick={onFix}
                    style={{
                        background: '#0052CC',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Zap size={14} fill="white" />
                    Fix Automatically
                </button>
                <button 
                    onClick={onView}
                    style={{
                        background: '#F4F5F7',
                        color: '#42526E',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    View Details
                    <ChevronRight size={14} />
                </button>
                <button 
                    onClick={onIgnore}
                    style={{
                        background: 'transparent',
                        color: '#6B778C',
                        border: '1px solid #DFE1E6',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Ignore
                </button>
            </div>
        </div>
    );
}
