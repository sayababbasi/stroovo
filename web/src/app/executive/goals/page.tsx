"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Edit2, Check, X, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GoalFormModal from '@/components/goals/GoalFormModal';

interface KeyResult {
    id: string;
    title: string;
    currentValue: number;
    targetValue: number;
    unit: string;
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

export default function ExecutiveGoalsPage() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKR, setEditingKR] = useState<{ id: string; title: string; currentValue: number; targetValue: number; unit: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', color: '#172B4D', margin: '0 0 6px', fontWeight: 700 }}>
                        Executive Strategic Goals & Key Objective
                    </h1>
                    <p style={{ color: '#6B778C', margin: 0, fontSize: '15px' }}>
                        Real-time overview of organization-wide objectives and dynamic key milestone performance.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={fetchGoals}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', background: '#F4F5F7', border: '1px solid #DFE1E6',
                            borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#42526E'
                        }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Realtime
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', background: '#0052CC', border: 'none',
                            borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'white'
                        }}
                    >
                        <Plus size={16} /> New Strategic Goal
                    </button>
                </div>
            </div>

            {loading && goals.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#6B778C', fontSize: '14px' }}>
                    Loading real-time dynamic goals and Key Objective...
                </div>
            ) : goals.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#6B778C', fontSize: '14px', background: 'white', borderRadius: '12px', border: '1px solid #DFE1E6' }}>
                    No strategic goals found. Click "New Strategic Goal" above to create one.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {goals.map(goal => {
                        const krs = goal.computed?.keyResults || goal.keyResults || [];
                        const goalProgress = goal.computed?.progress ?? goal.progress ?? 0;

                        return (
                            <div key={goal.id} style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(9, 30, 66, 0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '.06em', background: '#E3F2FD', padding: '3px 8px', borderRadius: '4px' }}>
                                            {goal.type} OBJECTIVE
                                        </span>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172B4D', margin: '8px 0 4px' }}>
                                            {goal.title}
                                        </h2>
                                        {goal.description && (
                                            <p style={{ fontSize: '13px', color: '#6B778C', margin: 0 }}>
                                                {goal.description}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#0052CC' }}>
                                            {goalProgress}%
                                        </span>
                                        <div style={{ width: '140px', height: '8px', background: '#DFE1E6', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                                            <div style={{ width: `${goalProgress}%`, height: '100%', background: '#0052CC', transition: 'width 0.3s' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Objectives & Key Results list */}
                                <div style={{ borderTop: '1px solid #DFE1E6', paddingTop: '16px', marginTop: '16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>
                                        Objectives & Key Results ({krs.length})
                                    </div>

                                    {krs.length === 0 ? (
                                        <span style={{ fontSize: '13px', color: '#8993A4', fontStyle: 'italic' }}>
                                            No Objectives or Key Results linked.
                                        </span>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                                            {krs.map((kr: KeyResult) => {
                                                const isEditing = editingKR?.id === kr.id;
                                                const krProg = kr.progress !== undefined ? kr.progress : (kr.targetValue ? Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100)) : 0);

                                                return (
                                                    <div key={kr.id} style={{ background: '#FAFBFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                                        {isEditing ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                <div>
                                                                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#6B778C' }}>MILESTONE / KEY RESULT TITLE</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editingKR.title}
                                                                        onChange={e => setEditingKR({ ...editingKR, title: e.target.value })}
                                                                        style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #0052CC', borderRadius: '4px', marginTop: '2px' }}
                                                                    />
                                                                </div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                                                                    <div>
                                                                        <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B778C' }}>CURRENT</label>
                                                                        <input
                                                                            type="number"
                                                                            value={editingKR.currentValue}
                                                                            onChange={e => setEditingKR({ ...editingKR, currentValue: parseFloat(e.target.value) || 0 })}
                                                                            style={{ width: '100%', padding: '4px 6px', fontSize: '11px', border: '1px solid #DFE1E6', borderRadius: '4px' }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B778C' }}>TARGET</label>
                                                                        <input
                                                                            type="number"
                                                                            value={editingKR.targetValue}
                                                                            onChange={e => setEditingKR({ ...editingKR, targetValue: parseFloat(e.target.value) || 0 })}
                                                                            style={{ width: '100%', padding: '4px 6px', fontSize: '11px', border: '1px solid #DFE1E6', borderRadius: '4px' }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B778C' }}>UNIT</label>
                                                                        <select
                                                                            value={editingKR.unit}
                                                                            onChange={e => setEditingKR({ ...editingKR, unit: e.target.value })}
                                                                            style={{ width: '100%', padding: '4px 6px', fontSize: '11px', border: '1px solid #DFE1E6', borderRadius: '4px' }}
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
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                                    <span
                                                                        style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', cursor: 'pointer', flex: 1 }}
                                                                        onClick={() => setEditingKR({ id: kr.id, title: kr.title, currentValue: kr.currentValue, targetValue: kr.targetValue, unit: kr.unit })}
                                                                        title="Click to edit key milestone"
                                                                    >
                                                                        {kr.title} <Edit2 size={11} style={{ display: 'inline', marginLeft: '4px', color: '#0052CC' }} />
                                                                    </span>
                                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: krProg >= 70 ? '#36B37E' : (krProg >= 40 ? '#FFAB00' : '#FF5630') }}>
                                                                        {krProg}%
                                                                    </span>
                                                                </div>
                                                                <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                                                                    <div style={{ width: `${krProg}%`, height: '100%', background: krProg >= 70 ? '#36B37E' : (krProg >= 40 ? '#FFAB00' : '#FF5630') }} />
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B778C' }}>
                                                                    <span>Progress: <b>{kr.currentValue} / {kr.targetValue} {kr.unit}</b></span>
                                                                    <span
                                                                        style={{ color: '#0052CC', fontWeight: 600, cursor: 'pointer' }}
                                                                        onClick={() => setEditingKR({ id: kr.id, title: kr.title, currentValue: kr.currentValue, targetValue: kr.targetValue, unit: kr.unit })}
                                                                    >
                                                                        Edit Key Milestone
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

            {showCreateModal && (
                <GoalFormModal
                    editingGoal={null}
                    currentUserId={user?.id || ''}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchGoals();
                        toast.success('Strategic Goal Created!');
                    }}
                />
            )}
        </div>
    );
}
