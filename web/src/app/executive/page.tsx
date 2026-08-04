"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Users, FolderKanban, AlertTriangle, Target, Edit2, Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface KeyResult {
    id: string;
    title: string;
    currentValue: number;
    targetValue: number;
    initialValue?: number;
    unit: string;
    healthStatus?: string;
    progress?: number;
}

interface Goal {
    id: string;
    title: string;
    description?: string;
    status: string;
    progress: number;
    type: string;
    computed?: {
        progress?: number;
        keyResults?: KeyResult[];
    };
    keyResults?: KeyResult[];
}

export default function ExecutiveOverview() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKR, setEditingKR] = useState<{ id: string; title: string; currentValue: number; targetValue: number; unit: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/goals/intelligence', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setGoals(Array.isArray(data.goals) ? data.goals : []);
            }
        } catch (e) {
            console.error('Failed to load executive goals', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const saveKeyResult = async () => {
        if (!editingKR) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/key-results/${editingKR.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: editingKR.title,
                    currentValue: editingKR.currentValue,
                    targetValue: editingKR.targetValue,
                    unit: editingKR.unit
                })
            });

            if (res.ok) {
                toast.success('Key result updated in real-time!');
                setEditingKR(null);
                await fetchGoals();
            } else {
                toast.error('Failed to update key result');
            }
        } catch (error) {
            toast.error('Network error updating key result');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', color: '#172B4D', margin: '0 0 8px', fontWeight: 700 }}>
                    Welcome back, {user?.name || 'Executive'}
                </h1>
                <p style={{ color: '#6B778C', margin: 0, fontSize: '16px' }}>
                    Here's the high-level overview of your organization and strategic Key Objective.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {[
                    { title: 'Total Revenue (MRR)', value: '$1.2M', trend: '+12%', icon: TrendingUp, color: '#36B37E' },
                    { title: 'Active Employees', value: '450', trend: '+5%', icon: Users, color: '#0052CC' },
                    { title: 'Active Projects', value: '84', trend: 'Stable', icon: FolderKanban, color: '#FFAB00' },
                    { title: 'Strategic Goals', value: goals.length.toString(), trend: 'Live Sync', icon: Target, color: '#6554C0' }
                ].map((stat, i) => (
                    <div key={i} style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #DFE1E6',
                        boxShadow: '0 1px 3px rgba(9, 30, 66, 0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ background: `${stat.color}15`, padding: '10px', borderRadius: '8px' }}>
                                <stat.icon color={stat.color} size={22} />
                            </div>
                            <span style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: stat.trend.startsWith('+') ? '#36B37E' : '#0052CC',
                                background: stat.trend.startsWith('+') ? '#E3FCEF' : '#E3F2FD',
                                padding: '4px 8px',
                                borderRadius: '4px'
                            }}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 style={{ color: '#6B778C', fontSize: '13px', margin: '0 0 6px', fontWeight: 500 }}>{stat.title}</h3>
                        <p style={{ color: '#172B4D', fontSize: '26px', margin: 0, fontWeight: 700 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* ── REALTIME DYNAMIC Key Objective & GOALS SECTION ── */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #DFE1E6', boxShadow: '0 1px 3px rgba(9, 30, 66, 0.05)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', color: '#172B4D', margin: '0 0 4px', fontWeight: 700 }}>
                            Strategic Goals & Real-Time Dynamic Key Objective
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>
                            Real-time sync of strategic objectives, milestones, and key metrics across teams.
                        </p>
                    </div>
                    <button
                        onClick={fetchGoals}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', background: '#F4F5F7', border: '1px solid #DFE1E6',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#42526E'
                        }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Realtime
                    </button>
                </div>

                {loading && goals.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C', fontSize: '14px' }}>
                        Fetching real-time strategic Key Objective...
                    </div>
                ) : goals.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B778C', fontSize: '14px' }}>
                        No active goals found. Create strategic goals to view dynamic Key Objective here.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {goals.map(goal => {
                            const krs = goal.computed?.keyResults || goal.keyResults || [];
                            const goalProgress = goal.computed?.progress ?? goal.progress ?? 0;

                            return (
                                <div key={goal.id} style={{ border: '1px solid #DFE1E6', borderRadius: '10px', padding: '16px', background: '#FAFBFC' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                                                {goal.type} STRATEGIC GOAL
                                            </span>
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D', margin: '2px 0 4px' }}>
                                                {goal.title}
                                            </h3>
                                            {goal.description && (
                                                <p style={{ fontSize: '12px', color: '#6B778C', margin: 0 }}>
                                                    {goal.description}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0052CC' }}>
                                                {goalProgress}%
                                            </span>
                                            <div style={{ width: '120px', height: '6px', background: '#DFE1E6', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${goalProgress}%`, height: '100%', background: '#0052CC', transition: 'width 0.3s' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Results list */}
                                    <div style={{ borderTop: '1px solid #DFE1E6', paddingTop: '12px', marginTop: '12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>
                                            Objectives & Key Results ({krs.length})
                                        </div>

                                        {krs.length === 0 ? (
                                            <span style={{ fontSize: '12px', color: '#8993A4', fontStyle: 'italic' }}>
                                                No Key Objective added for this goal yet.
                                            </span>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                                                {krs.map((kr: KeyResult) => {
                                                    const isEditing = editingKR?.id === kr.id;
                                                    const krProg = kr.progress !== undefined ? kr.progress : (kr.targetValue ? Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100)) : 0);

                                                    return (
                                                        <div key={kr.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                                            {isEditing ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                    <input
                                                                        type="text"
                                                                        value={editingKR.title}
                                                                        onChange={e => setEditingKR({ ...editingKR, title: e.target.value })}
                                                                        style={{ padding: '6px 8px', fontSize: '12px', border: '1px solid #0052CC', borderRadius: '4px' }}
                                                                        placeholder="Key result title"
                                                                    />
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                                                                        <div>
                                                                            <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B778C' }}>CURRENT</label>
                                                                            <input
                                                                                type="number"
                                                                                value={editingKR.currentValue}
                                                                                onChange={e => setEditingKR({ ...editingKR, currentValue: parseFloat(e.target.value) || 0 })}
                                                                                style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #DFE1E6', borderRadius: '4px' }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B778C' }}>TARGET</label>
                                                                            <input
                                                                                type="number"
                                                                                value={editingKR.targetValue}
                                                                                onChange={e => setEditingKR({ ...editingKR, targetValue: parseFloat(e.target.value) || 0 })}
                                                                                style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #DFE1E6', borderRadius: '4px' }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B778C' }}>UNIT</label>
                                                                            <select
                                                                                value={editingKR.unit}
                                                                                onChange={e => setEditingKR({ ...editingKR, unit: e.target.value })}
                                                                                style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #DFE1E6', borderRadius: '4px' }}
                                                                            >
                                                                                <option value="NUMBER">Num</option>
                                                                                <option value="PERCENTAGE">%</option>
                                                                                <option value="CURRENCY">$</option>
                                                                                <option value="BOOLEAN">Bool</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                                                        <button
                                                                            onClick={() => setEditingKR(null)}
                                                                            style={{ padding: '4px 8px', fontSize: '11px', background: '#F4F5F7', border: '1px solid #DFE1E6', borderRadius: '4px', cursor: 'pointer' }}
                                                                        >
                                                                            <X size={12} /> Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={saveKeyResult}
                                                                            disabled={saving}
                                                                            style={{ padding: '4px 10px', fontSize: '11px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                                        >
                                                                            <Check size={12} /> {saving ? 'Saving...' : 'Save Realtime'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                                        <span
                                                                            style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', cursor: 'pointer', flex: 1 }}
                                                                            onClick={() => setEditingKR({ id: kr.id, title: kr.title, currentValue: kr.currentValue, targetValue: kr.targetValue, unit: kr.unit })}
                                                                            title="Click to edit key result"
                                                                        >
                                                                            {kr.title} <Edit2 size={11} style={{ display: 'inline', marginLeft: '4px', color: '#0052CC' }} />
                                                                        </span>
                                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: krProg >= 70 ? '#36B37E' : (krProg >= 40 ? '#FFAB00' : '#FF5630') }}>
                                                                            {krProg}%
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                                                                        <div style={{ width: `${krProg}%`, height: '100%', background: krProg >= 70 ? '#36B37E' : (krProg >= 40 ? '#FFAB00' : '#FF5630') }} />
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B778C' }}>
                                                                        <span>Progress: <b>{kr.currentValue} / {kr.targetValue} {kr.unit}</b></span>
                                                                        <span
                                                                            style={{ color: '#0052CC', fontWeight: 600, cursor: 'pointer' }}
                                                                            onClick={() => setEditingKR({ id: kr.id, title: kr.title, currentValue: kr.currentValue, targetValue: kr.targetValue, unit: kr.unit })}
                                                                        >
                                                                            Edit Milestone
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
