"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import CreateGoalModal from '@/components/CreateGoalModal';
import { Target, Plus, ChevronDown, ChevronRight, TrendingUp, AlertTriangle, CheckCircle, User, Calendar } from 'lucide-react';
import { Goal, Cycle } from '@/types/goals'; // Make sure this path is correct

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [selectedCycle, setSelectedCycle] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchCycles();
        fetchGoals();
    }, [selectedCycle]);

    const fetchCycles = async () => {
        try {
            const res = await fetch(`${API_URL}/api/cycles`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setCycles(data);
                if (data.length > 0 && !selectedCycle) {
                    setSelectedCycle(data[0].id); // Default to latest cycle
                }
            }
        } catch (error) {
            console.error('Failed to fetch cycles:', error);
        }
    };

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const url = new URL(`${API_URL}/api/goals`);
            if (selectedCycle) url.searchParams.append('cycleId', selectedCycle);

            const res = await fetch(url.toString());
            const data = await res.json();
            setGoals(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (goalId: string) => {
        const newExpanded = new Set(expandedGoals);
        if (newExpanded.has(goalId)) {
            newExpanded.delete(goalId);
        } else {
            newExpanded.add(goalId);
        }
        setExpandedGoals(newExpanded);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ON_TRACK': return { bg: '#DEEBFF', text: '#0747A6', icon: <CheckCircle size={14} /> };
            case 'AT_RISK': return { bg: '#FFF0B3', text: '#172B4D', icon: <AlertTriangle size={14} /> };
            case 'OFF_TRACK': return { bg: '#FFEBE6', text: '#BF2600', icon: <AlertTriangle size={14} /> };
            default: return { bg: '#EBECF0', text: '#505F79', icon: <Target size={14} /> };
        }
    };

    // Inside GoalsPage
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGoal(null);
    };

    const GoalCard = ({ goal, level = 0 }: { goal: Goal; level?: number }) => {
        const isExpanded = expandedGoals.has(goal.id);
        const statusStyle = getStatusColor(goal.status);
        const hasChildren = (goal.keyResults && goal.keyResults.length > 0) || (goal.subGoals && goal.subGoals.length > 0);

        return (
            <div style={{
                marginBottom: '16px',
                border: '1px solid #DFE1E6',
                borderRadius: '8px',
                background: 'white',
                marginLeft: `${level * 24}px`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                {/* Goal Header */}
                <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <div
                            onClick={() => toggleExpand(goal.id)}
                            style={{
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                visibility: hasChildren ? 'visible' : 'hidden',
                                color: '#6B778C'
                            }}
                        >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{
                                    textTransform: 'uppercase',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#6554C0',
                                    background: '#EAE6FF',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    {goal.type}
                                </span>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#172B4D' }}>{goal.title}</h3>
                                {/* Edit Button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(goal); }}
                                    style={{ border: 'none', background: 'none', color: '#6B778C', cursor: 'pointer', padding: '0 8px', fontSize: '12px', textDecoration: 'underline' }}>
                                    Edit
                                </button>
                            </div>
                            <p style={{ fontSize: '14px', color: '#6B778C', margin: 0, marginBottom: '16px' }}>{goal.description || 'No description provided.'}</p>

                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                        {goal.owner?.name ? goal.owner.name.charAt(0) : <User size={12} />}
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#505F79' }}>{goal.owner?.name || 'Unassigned'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#505F79' }}>
                                    <Calendar size={14} />
                                    <span>{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No due date'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '150px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            fontSize: '12px',
                            fontWeight: 600
                        }}>
                            {statusStyle.icon}
                            {goal.status.replace('_', ' ')}
                        </div>

                        <div style={{ width: '100%', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#505F79', fontWeight: 600 }}>
                                <span>Progress</span>
                                <span>{goal.progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: '#EBECF0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${goal.progress}%`, height: '100%', background: goal.progress >= 100 ? '#36B37E' : '#0052CC' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Results & Sub-goals Expansion */}
                {isExpanded && (
                    <div style={{ padding: '0 20px 20px 56px', borderTop: '1px solid #F4F5F7' }}>
                        {/* Key Results */}
                        {goal.keyResults && goal.keyResults.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6B778C', marginBottom: '12px', fontWeight: 600 }}>Key Results</h4>
                                {goal.keyResults.map(kr => (
                                    <div key={kr.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#FAFBFC', border: '1px solid #EBECF0', borderRadius: '4px', marginBottom: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: '14px', color: '#172B4D', fontWeight: 500 }}>{kr.title}</span>
                                            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#6B778C', marginTop: '4px' }}>
                                                <span>Target: {kr.targetValue} {kr.unit}</span>
                                                <span>•</span>
                                                <span>Current: {kr.currentValue} {kr.unit}</span>
                                            </div>
                                        </div>
                                        <div style={{ width: '100px', textAlign: 'right' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>
                                                {kr.targetValue > 0 ? Math.round((kr.currentValue / kr.targetValue) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Sub-goals */}
                        {goal.subGoals && goal.subGoals.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6B778C', marginBottom: '12px', fontWeight: 600 }}>Aligned Objectives</h4>
                                {goal.subGoals.map(subGoal => (
                                    <GoalCard key={subGoal.id} goal={subGoal} level={0} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{ flex: 1, marginLeft: '240px', background: '#F4F5F7' }}>
                {/* Header */}
                <div style={{ padding: '24px 32px', background: '#FFFFFF', borderBottom: '1px solid #DFE1E6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#172B4D' }}>Goals & OKRs</h1>
                            <p style={{ fontSize: '14px', color: '#6B778C', marginTop: '4px' }}>Strategic alignment and performance tracking</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <select
                                value={selectedCycle}
                                onChange={(e) => setSelectedCycle(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #DFE1E6', background: '#FAFBFC', color: '#172B4D', fontWeight: 500, fontSize: '14px' }}
                            >
                                {cycles.map(cycle => (
                                    <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                                ))}
                                {!cycles.length && <option value="">No Cycles</option>}
                            </select>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                                <Plus size={16} />
                                New Goal
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {[
                            { label: 'Total Goals', value: goals.length, icon: Target, color: '#0052CC' },
                            { label: 'On Track', value: goals.filter(g => g.status === 'ON_TRACK').length, icon: TrendingUp, color: '#36B37E' },
                            { label: 'At Risk', value: goals.filter(g => g.status === 'AT_RISK').length, icon: AlertTriangle, color: '#FFAB00' },
                            { label: 'Completed', value: goals.filter(g => g.progress >= 100).length, icon: CheckCircle, color: '#6554C0' }
                        ].map((stat, i) => (
                            <div key={i} style={{ padding: '20px', background: '#F4F5F7', borderRadius: '8px', border: '1px solid #DFE1E6' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B778C', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                                    <stat.icon size={14} color={stat.color} />
                                    {stat.label.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6B778C' }}>Loading goals...</div>
                    ) : goals.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px', border: '1px dashed #DFE1E6' }}>
                            <Target size={48} color="#EBECF0" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: '#172B4D', marginBottom: '8px' }}>No Goals Found</h3>
                            <p style={{ color: '#6B778C', marginBottom: '24px' }}>Create your first Company Objective to get started.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{ padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                                Create Goal
                            </button>
                        </div>
                    ) : (
                        <div>
                            {goals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <CreateGoalModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                cycles={cycles}
                onSuccess={fetchGoals}
                goalToEdit={editingGoal}
            />
        </div>
    );
}
