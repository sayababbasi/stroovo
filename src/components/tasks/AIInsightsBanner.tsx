"use client";
import React from 'react';
import { Bot, Users, Clock, X, Shield, AlertTriangle } from 'lucide-react';
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
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', marginBottom: 16,
            background: 'linear-gradient(90deg, rgba(101,84,192,0.06) 0%, rgba(0,82,204,0.04) 50%, transparent 100%)',
            borderLeft: '3px solid #6554C0', borderRadius: '0 10px 10px 0',
        }}>
            <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #6554C0, #0052CC)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Bot size={14} color="white" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#172B4D' }}>AI Insights:</span>
                {insights.map((ins, i) => (
                    <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: '12px', fontWeight: 600, color: ins.color,
                        background: ins.bg, padding: '3px 10px', borderRadius: 14,
                    }}>
                        {ins.icon} {ins.text}
                    </span>
                ))}
            </div>
            {onDismiss && (
                <button onClick={onDismiss} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8A94A6', padding: 4 }}>
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
