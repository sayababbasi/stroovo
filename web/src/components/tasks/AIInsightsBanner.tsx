"use client";
import React from 'react';
import { Sparkles, Users, Clock, X, Shield, AlertTriangle } from 'lucide-react';
import type { Task } from './types';

interface AIInsightsBannerProps {
    tasks: Task[];
    onDismiss?: () => void;
}

export default function AIInsightsBanner({ tasks, onDismiss }: AIInsightsBannerProps) {
    // Safely extract AI data from either task.ai or task.aiInsights (DB field)
    const getAiData = (t: Task) => {
        const raw = t.ai || (t as any).aiInsights;
        if (!raw || typeof raw !== 'object') return {};
        return raw;
    };

    const getAssigneeName = (t: Task): string => {
        if (!t.assignee) return 'Unassigned';
        if (typeof t.assignee === 'object') return (t.assignee as any).name || 'Unassigned';
        return t.assignee;
    };

    const highRisk = tasks.filter(t => {
        const ai = getAiData(t);
        return ai.riskLevel?.toLowerCase() === 'high';
    });

    const overloaded = [...new Set(
        tasks.filter(t => getAiData(t).overloadWarning).map(getAssigneeName)
    )];

    // Overdue: check ISO date string from DB
    const overdue = tasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date(new Date().toDateString());
    });

    // Blocked: DB enum value is BLOCKED
    const blocked = tasks.filter(t => t.status === 'BLOCKED');

    const insights: { icon: React.ReactNode; text: string; color: string; bg: string }[] = [];

    if (highRisk.length > 0) insights.push({
        icon: <Shield size={13} />,
        text: `${highRisk.length} high-risk task${highRisk.length > 1 ? 's' : ''} detected`,
        color: '#FF5630', bg: '#FFEBE6'
    });
    if (overloaded.length > 0) insights.push({
        icon: <Users size={13} />,
        text: `${overloaded.join(', ')} ${overloaded.length > 1 ? 'are' : 'is'} overloaded`,
        color: '#FFAB00', bg: '#FFF4E6'
    });
    if (overdue.length > 0) insights.push({
        icon: <Clock size={13} />,
        text: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} need attention`,
        color: '#FF5630', bg: '#FFEBE6'
    });
    if (blocked.length > 0) insights.push({
        icon: <AlertTriangle size={13} />,
        text: `${blocked.length} task${blocked.length > 1 ? 's' : ''} blocked`,
        color: '#FF5630', bg: '#FFEBE6'
    });

    if (insights.length === 0) return null;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', marginBottom: 20,
            background: '#F9F9FB',
            border: '1px solid #E8EAED', borderRadius: 8,
        }}>
            <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: '#0052CC',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Sparkles size={12} color="white" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>AI Insights</span>
                <div style={{ width: 1, height: 16, background: '#DFE1E6' }} />
                {insights.map((ins, i) => (
                    <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: '12px', fontWeight: 500, color: ins.color,
                        background: ins.bg, padding: '4px 10px', borderRadius: 6, border: `1px solid ${ins.color}20`
                    }}>
                        {ins.icon} {ins.text}
                    </span>
                ))}
            </div>
            {onDismiss && (
                <button onClick={onDismiss} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8A94A6', padding: 4, display: 'flex', transition: '0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#172B4D'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8A94A6'}>
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
