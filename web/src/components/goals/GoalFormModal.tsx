"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Globe, Target, ChevronDown, ChevronUp, Edit2, Settings, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  editingGoal: any | null;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
}

interface KeyResultState {
  id?: string;
  title: string;
  description: string;
  targetValue: string;
  initialValue: string;
  currentValue: string;
  unit: string;
}

interface ObjectiveState {
  id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  targetDate: string;
  ownerId: string;
  keyResults: KeyResultState[];
}

export default function GoalFormModal({ editingGoal, onClose, onSuccess, currentUserId }: Props) {
  // Goal details state
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    type: 'COMPANY',
    status: 'ON_TRACK',
    priority: 'HIGH',
    currency: 'USD ($)',
    targetAmount: '',
    targetDate: '',
    cycleId: '',
    ownerId: currentUserId || '',
  });

  // Objectives state
  const [objectives, setObjectives] = useState<ObjectiveState[]>([]);

  // Additional settings state
  const [showAdditionalSettings, setShowAdditionalSettings] = useState(false);

  // System users and cycles
  const [users, setUsers] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch users & cycles
  useEffect(() => {
    fetch('/api/users', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(d => setUsers(Array.isArray(d) ? d : Array.isArray(d.users) ? d.users : []))
      .catch(() => {});

    fetch('/api/cycles', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(d => setCycles(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Initialize form with editingGoal or default values
  useEffect(() => {
    if (editingGoal) {
      setGoalForm({
        title: editingGoal.title || '',
        description: editingGoal.description || '',
        type: editingGoal.type || 'COMPANY',
        status: editingGoal.status || 'ON_TRACK',
        priority: editingGoal.priority || 'HIGH',
        currency: editingGoal.currency || 'USD ($)',
        targetAmount: editingGoal.targetAmount !== undefined && editingGoal.targetAmount !== null ? String(editingGoal.targetAmount) : '',
        targetDate: editingGoal.targetDate ? editingGoal.targetDate.split('T')[0] : '',
        cycleId: editingGoal.cycleId || '',
        ownerId: editingGoal.ownerId || currentUserId || '',
      });

      const mappedObjs: ObjectiveState[] = (editingGoal.objectives || []).map((obj: any) => ({
        id: obj.id,
        title: obj.title || '',
        description: obj.description || '',
        status: obj.status || 'ON_TRACK',
        priority: obj.priority || 'HIGH',
        startDate: obj.startDate ? obj.startDate.split('T')[0] : '',
        targetDate: obj.targetDate ? obj.targetDate.split('T')[0] : '',
        ownerId: obj.ownerId || editingGoal.ownerId || currentUserId || '',
        keyResults: (obj.keyResults || []).map((kr: any) => ({
          id: kr.id,
          title: kr.title || '',
          description: kr.description || '',
          targetValue: String(kr.targetValue ?? ''),
          initialValue: String(kr.initialValue ?? 0),
          currentValue: String(kr.currentValue ?? 0),
          unit: kr.unit || 'USD ($)',
        })),
      }));

      // Fallback: if goal has direct keyResults but no objectives
      if (mappedObjs.length === 0 && editingGoal.keyResults && editingGoal.keyResults.length > 0) {
        mappedObjs.push({
          title: 'Core Strategic Objective',
          description: 'Primary objective driving goal execution',
          status: 'ON_TRACK',
          priority: 'HIGH',
          startDate: '',
          targetDate: editingGoal.targetDate ? editingGoal.targetDate.split('T')[0] : '',
          ownerId: editingGoal.ownerId || currentUserId || '',
          keyResults: editingGoal.keyResults.map((kr: any) => ({
            id: kr.id,
            title: kr.title || '',
            description: kr.description || '',
            targetValue: String(kr.targetValue ?? ''),
            initialValue: String(kr.initialValue ?? 0),
            currentValue: String(kr.currentValue ?? 0),
            unit: kr.unit || 'USD ($)',
          })),
        });
      }

      setObjectives(mappedObjs.length > 0 ? mappedObjs : [{
        title: '',
        description: '',
        status: 'ON_TRACK',
        priority: 'HIGH',
        startDate: '',
        targetDate: '',
        ownerId: currentUserId || '',
        keyResults: [{ title: '', description: '', targetValue: '', initialValue: '0', currentValue: '0', unit: 'USD ($)' }]
      }]);
    } else {
      setGoalForm({
        title: '',
        description: '',
        type: 'COMPANY',
        status: 'ON_TRACK',
        priority: 'HIGH',
        currency: 'USD ($)',
        targetAmount: '',
        targetDate: '',
        cycleId: '',
        ownerId: currentUserId || '',
      });
      setObjectives([{
        title: '',
        description: '',
        status: 'ON_TRACK',
        priority: 'HIGH',
        startDate: '',
        targetDate: '',
        ownerId: currentUserId || '',
        keyResults: [{ title: '', description: '', targetValue: '', initialValue: '0', currentValue: '0', unit: 'USD ($)' }]
      }]);
    }
  }, [editingGoal, currentUserId]);

  // Overall progress calculation
  const computedProgress = useMemo(() => {
    let totalKRs = 0;
    let sumKRProgress = 0;

    objectives.forEach(obj => {
      obj.keyResults.forEach(kr => {
        const target = parseFloat(kr.targetValue) || 0;
        const initial = parseFloat(kr.initialValue) || 0;
        const current = parseFloat(kr.currentValue) || 0;
        const range = target - initial;
        if (range > 0) {
          const prog = Math.min(100, Math.max(0, ((current - initial) / range) * 100));
          sumKRProgress += prog;
          totalKRs++;
        }
      });
    });

    return totalKRs > 0 ? Math.round(sumKRProgress / totalKRs) : 0;
  }, [objectives]);

  // Objective progress calculation
  const getObjectiveProgress = (obj: ObjectiveState) => {
    let totalKRs = 0;
    let sumProg = 0;
    obj.keyResults.forEach(kr => {
      const target = parseFloat(kr.targetValue) || 0;
      const initial = parseFloat(kr.initialValue) || 0;
      const current = parseFloat(kr.currentValue) || 0;
      const range = target - initial;
      if (range > 0) {
        sumProg += Math.min(100, Math.max(0, ((current - initial) / range) * 100));
        totalKRs++;
      }
    });
    return totalKRs > 0 ? Math.round(sumProg / totalKRs) : 0;
  };

  // KR progress calculation
  const getKRProgress = (kr: KeyResultState) => {
    const target = parseFloat(kr.targetValue) || 0;
    const initial = parseFloat(kr.initialValue) || 0;
    const current = parseFloat(kr.currentValue) || 0;
    const range = target - initial;
    if (range <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round(((current - initial) / range) * 100)));
  };

  // Handlers for Objectives
  const handleAddObjective = () => {
    setObjectives(prev => [
      ...prev,
      {
        title: '',
        description: '',
        status: 'ON_TRACK',
        priority: 'HIGH',
        startDate: '',
        targetDate: goalForm.targetDate || '',
        ownerId: goalForm.ownerId || currentUserId,
        keyResults: [{ title: '', description: '', targetValue: '', initialValue: '0', currentValue: '0', unit: 'USD ($)' }]
      }
    ]);
  };

  const handleRemoveObjective = (objIndex: number) => {
    if (objectives.length === 1) {
      toast.error('At least one objective is required');
      return;
    }
    setObjectives(prev => prev.filter((_, i) => i !== objIndex));
  };

  const handleObjectiveChange = (objIndex: number, field: keyof ObjectiveState, value: any) => {
    setObjectives(prev => prev.map((obj, i) => i === objIndex ? { ...obj, [field]: value } : obj));
  };

  // Handlers for Key Results
  const handleAddKR = (objIndex: number) => {
    setObjectives(prev => prev.map((obj, i) => i === objIndex ? {
      ...obj,
      keyResults: [...obj.keyResults, { title: '', description: '', targetValue: '', initialValue: '0', currentValue: '0', unit: 'USD ($)' }]
    } : obj));
  };

  const handleRemoveKR = (objIndex: number, krIndex: number) => {
    setObjectives(prev => prev.map((obj, i) => i === objIndex ? {
      ...obj,
      keyResults: obj.keyResults.filter((_, kI) => kI !== krIndex)
    } : obj));
  };

  const handleKRChange = (objIndex: number, krIndex: number, field: keyof KeyResultState, value: any) => {
    setObjectives(prev => prev.map((obj, oI) => oI === objIndex ? {
      ...obj,
      keyResults: obj.keyResults.map((kr, kI) => kI === krIndex ? { ...kr, [field]: value } : kr)
    } : obj));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title.trim()) {
      setError('Strategic Goal Title is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const url = editingGoal ? `/api/goals/${editingGoal.id}` : '/api/goals';
      const method = editingGoal ? 'PATCH' : 'POST';

      const payload = {
        title: goalForm.title,
        description: goalForm.description,
        type: goalForm.type,
        status: goalForm.status,
        priority: goalForm.priority,
        currency: goalForm.currency,
        targetAmount: goalForm.targetAmount ? parseFloat(goalForm.targetAmount) : null,
        targetDate: goalForm.targetDate || null,
        cycleId: goalForm.cycleId || null,
        ownerId: goalForm.ownerId || currentUserId,
        progress: computedProgress,
        objectives: objectives.filter(o => o.title && o.title.trim()).map(o => ({
          id: o.id,
          title: o.title,
          description: o.description,
          status: o.status,
          priority: o.priority,
          startDate: o.startDate || null,
          targetDate: o.targetDate || null,
          ownerId: o.ownerId || goalForm.ownerId || currentUserId,
          keyResults: o.keyResults.filter(k => k.title && k.title.trim()).map(k => ({
            id: k.id,
            title: k.title,
            description: k.description,
            targetValue: parseFloat(k.targetValue) || 0,
            initialValue: parseFloat(k.initialValue) || 0,
            currentValue: parseFloat(k.currentValue || '0') || 0,
            unit: k.unit || 'USD ($)',
          }))
        }))
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || errData.details || 'Failed to save goal');
        return;
      }

      toast.success(editingGoal ? 'Strategic Goal updated successfully!' : 'Strategic Goal created successfully!');
      window.dispatchEvent(new Event('goalsUpdated'));
      onSuccess();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper function for user initials
  const getUserInitials = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (!found || !found.name) return 'SA';
    const parts = found.name.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].substring(0, 2).toUpperCase();
  };

  const getUserName = (userId: string) => {
    const found = users.find(u => u.id === userId);
    return found ? found.name : 'Sayab Abbasi';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(9, 30, 66, 0.54)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }} onClick={onClose}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '920px',
        maxWidth: '100%',
        maxHeight: '92vh',
        boxShadow: '0 20px 60px rgba(9, 30, 66, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalIn 0.22s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid #EBECF0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: '#FFFFFF'
        }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172B4D', margin: 0, lineHeight: 1.3 }}>
              {editingGoal ? 'Edit Strategic Goal' : 'Create Strategic Goal'}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B778C', margin: '4px 0 0', fontWeight: 500 }}>
              Define Strategic Goal → Objectives → Key Results
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #DFE1E6',
                background: '#FFFFFF',
                color: '#6B778C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              background: '#FFEBE6',
              border: '1px solid #FF5630',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#BF2600',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form id="goal-form" onSubmit={handleSubmit}>
            
            {/* ── SECTION 1: GOAL DETAILS CARD ────────────────── */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #DFE1E6',
              borderRadius: '12px',
              padding: '22px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.04)'
            }}>
              {/* Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#E3F2FD',
                  color: '#0052CC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Globe size={14} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  GOAL DETAILS
                </span>
              </div>

              {/* Row 1: Title, Goal Type, Status, Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Strategic Goal Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Financial Milestone: Earn $17,979 Before 2027"
                    value={goalForm.title}
                    onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13.5px',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#FAFBFC',
                      color: '#172B4D',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Goal Type
                  </label>
                  <select
                    value={goalForm.type}
                    onChange={e => setGoalForm(p => ({ ...p, type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#FAFBFC',
                      color: '#172B4D',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="COMPANY">Company</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="TEAM">Team</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={goalForm.status}
                    onChange={e => setGoalForm(p => ({ ...p, status: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#FAFBFC',
                      color: '#172B4D',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="ON_TRACK">🟢 On Track</option>
                    <option value="AT_RISK">🟡 At Risk</option>
                    <option value="OFF_TRACK">🔴 Off Track</option>
                    <option value="COMPLETED">🔵 Completed</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={goalForm.priority}
                    onChange={e => setGoalForm(p => ({ ...p, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#FAFBFC',
                      color: '#172B4D',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="HIGH">↑ High</option>
                    <option value="MEDIUM">→ Medium</option>
                    <option value="LOW">↓ Low</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Description, Owner, Deadline */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Achieve a total profit of $17,979 for REVOTIC AI before the end of 2026..."
                    value={goalForm.description}
                    onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#FAFBFC',
                      color: '#172B4D',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: '#8993A4' }}>
                    {goalForm.description.length}/500
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Owner
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={goalForm.ownerId}
                      onChange={e => setGoalForm(p => ({ ...p, ownerId: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        fontSize: '13px',
                        border: '1px solid #DFE1E6',
                        borderRadius: '8px',
                        background: '#FAFBFC',
                        color: '#172B4D',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                      ))}
                      {users.length === 0 && <option value={currentUserId}>Sayab Abbasi</option>}
                    </select>
                    <div style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#0052CC',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                    }}>
                      {getUserInitials(goalForm.ownerId)}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Timeline / Deadline
                  </label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={e => setGoalForm(p => ({ ...p, targetDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#FAFBFC',
                      color: '#172B4D',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Currency, Target Amount, Current Progress */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Currency
                  </label>
                  <select
                    value={goalForm.currency}
                    onChange={e => setGoalForm(p => ({ ...p, currency: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#FAFBFC',
                      color: '#172B4D',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="PKR (₨)">PKR (₨)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Target Amount
                  </label>
                  <input
                    type="text"
                    placeholder="$ 17,979"
                    value={goalForm.targetAmount}
                    onChange={e => setGoalForm(p => ({ ...p, targetAmount: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#FAFBFC',
                      color: '#172B4D',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                    Current Progress
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${computedProgress}%`}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      background: '#F4F5F7',
                      color: '#0052CC',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#42526E' }}>Overall Goal Progress</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0052CC' }}>{computedProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#DFE1E6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${computedProgress}%`, height: '100%', background: '#0052CC', transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>

            {/* ── SECTION 2: OBJECTIVES CARD ─────────────────────── */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #DFE1E6',
              borderRadius: '12px',
              padding: '22px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.04)'
            }}>
              {/* Section Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#E3F2FD',
                    color: '#0052CC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Target size={14} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    OBJECTIVES ({objectives.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddObjective}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0052CC',
                    background: '#E3F2FD',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <Plus size={13} /> Add Objective
                </button>
              </div>

              {/* Objectives List */}
              {objectives.map((obj, objIdx) => {
                const objProg = getObjectiveProgress(obj);

                return (
                  <div key={objIdx} style={{
                    background: '#FFFFFF',
                    border: '1px solid #0052CC',
                    borderRadius: '10px',
                    padding: '18px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0, 82, 204, 0.06)'
                  }}>
                    {/* Objective Header Bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto auto', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{
                        padding: '4px 8px',
                        background: '#E3F2FD',
                        color: '#0052CC',
                        fontSize: '12px',
                        fontWeight: 800,
                        borderRadius: '4px'
                      }}>
                        {String(objIdx + 1).padStart(2, '0')}
                      </div>

                      <input
                        type="text"
                        placeholder="Objective Title..."
                        value={obj.title}
                        onChange={e => handleObjectiveChange(objIdx, 'title', e.target.value)}
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#172B4D',
                          border: 'none',
                          borderBottom: '1px solid #DFE1E6',
                          background: 'transparent',
                          outline: 'none',
                          padding: '4px 0'
                        }}
                      />

                      {/* Owner Select */}
                      <div style={{ position: 'relative' }}>
                        <select
                          value={obj.ownerId}
                          onChange={e => handleObjectiveChange(objIdx, 'ownerId', e.target.value)}
                          style={{
                            padding: '6px 10px 6px 30px',
                            fontSize: '12px',
                            border: '1px solid #DFE1E6',
                            borderRadius: '6px',
                            background: '#FAFBFC',
                            color: '#172B4D',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name || u.email}</option>
                          ))}
                          {users.length === 0 && <option value={currentUserId}>Sayab Abbasi</option>}
                        </select>
                        <div style={{
                          position: 'absolute',
                          left: '6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#0052CC',
                          color: '#FFFFFF',
                          fontSize: '8px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none'
                        }}>
                          {getUserInitials(obj.ownerId)}
                        </div>
                      </div>

                      {/* Status */}
                      <select
                        value={obj.status}
                        onChange={e => handleObjectiveChange(objIdx, 'status', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          border: '1px solid #DFE1E6',
                          borderRadius: '6px',
                          background: '#FAFBFC',
                          color: '#172B4D',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="ON_TRACK">🟢 On Track</option>
                        <option value="AT_RISK">🟡 At Risk</option>
                        <option value="OFF_TRACK">🔴 Off Track</option>
                        <option value="COMPLETED">🔵 Completed</option>
                      </select>

                      {/* Priority */}
                      <select
                        value={obj.priority}
                        onChange={e => handleObjectiveChange(objIdx, 'priority', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          border: '1px solid #DFE1E6',
                          borderRadius: '6px',
                          background: '#FAFBFC',
                          color: '#172B4D',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="HIGH">↑ High</option>
                        <option value="MEDIUM">→ Medium</option>
                        <option value="LOW">↓ Low</option>
                      </select>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(objIdx)}
                        style={{
                          border: 'none',
                          background: '#FFEBE6',
                          color: '#FF5630',
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Delete Objective"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Objective Description & Date Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>
                          Objective Description
                        </label>
                        <textarea
                          rows={2}
                          maxLength={400}
                          placeholder="Acquire new clients and projects to generate consistent revenue..."
                          value={obj.description}
                          onChange={e => handleObjectiveChange(objIdx, 'description', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            fontSize: '12px',
                            border: '1px solid #DFE1E6',
                            borderRadius: '6px',
                            background: '#FAFBFC',
                            color: '#172B4D',
                            outline: 'none',
                            resize: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div style={{ position: 'absolute', bottom: '6px', right: '10px', fontSize: '9px', color: '#8993A4' }}>
                          {obj.description.length}/400
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={obj.startDate}
                          onChange={e => handleObjectiveChange(objIdx, 'startDate', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '7px 8px',
                            fontSize: '12px',
                            border: '1px solid #DFE1E6',
                            borderRadius: '6px',
                            background: '#FAFBFC',
                            color: '#172B4D',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>
                          Target Date
                        </label>
                        <input
                          type="date"
                          value={obj.targetDate}
                          onChange={e => handleObjectiveChange(objIdx, 'targetDate', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '7px 8px',
                            fontSize: '12px',
                            border: '1px solid #DFE1E6',
                            borderRadius: '6px',
                            background: '#FAFBFC',
                            color: '#172B4D',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>
                          Progress
                        </label>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#0052CC', marginBottom: '4px' }}>
                          {objProg}%
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#DFE1E6', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${objProg}%`, height: '100%', background: '#0052CC', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Sub-Section: KEY RESULTS */}
                    <div style={{
                      background: '#FAFBFC',
                      border: '1px solid #DFE1E6',
                      borderRadius: '8px',
                      padding: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Target size={13} color="#0052CC" />
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            KEY RESULTS ({obj.keyResults.length})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddKR(objIdx)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#0052CC',
                            background: '#E3F2FD',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={12} /> Add Key Result
                        </button>
                      </div>

                      {/* Key Result Cards */}
                      {obj.keyResults.map((kr, krIdx) => {
                        const krProg = getKRProgress(kr);

                        return (
                          <div key={krIdx} style={{
                            background: '#FFFFFF',
                            border: '1px solid #DFE1E6',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '10px',
                            display: 'grid',
                            gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr 1fr auto',
                            gap: '12px',
                            alignItems: 'center'
                          }}>
                            {/* Badge */}
                            <div style={{
                              padding: '3px 7px',
                              background: '#E3F2FD',
                              color: '#0052CC',
                              fontSize: '10px',
                              fontWeight: 800,
                              borderRadius: '4px'
                            }}>
                              KR {krIdx + 1}
                            </div>

                            {/* Title & Description */}
                            <div>
                              <input
                                type="text"
                                placeholder="Key Result Title..."
                                value={kr.title}
                                onChange={e => handleKRChange(objIdx, krIdx, 'title', e.target.value)}
                                style={{
                                  width: '100%',
                                  fontSize: '12.5px',
                                  fontWeight: 700,
                                  color: '#172B4D',
                                  border: 'none',
                                  borderBottom: '1px solid #DFE1E6',
                                  outline: 'none',
                                  padding: '2px 0',
                                  marginBottom: '2px'
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Description (optional)..."
                                value={kr.description}
                                onChange={e => handleKRChange(objIdx, krIdx, 'description', e.target.value)}
                                style={{
                                  width: '100%',
                                  fontSize: '11px',
                                  color: '#6B778C',
                                  border: 'none',
                                  outline: 'none',
                                  padding: '1px 0'
                                }}
                              />
                            </div>

                            {/* Target */}
                            <div>
                              <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#6B778C', marginBottom: '2px' }}>
                                Target
                              </label>
                              <input
                                type="text"
                                placeholder="$ 1,500"
                                value={kr.targetValue}
                                onChange={e => handleKRChange(objIdx, krIdx, 'targetValue', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  fontSize: '12px',
                                  border: '1px solid #DFE1E6',
                                  borderRadius: '6px',
                                  background: '#FAFBFC',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            {/* Current */}
                            <div>
                              <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#6B778C', marginBottom: '2px' }}>
                                Current
                              </label>
                              <input
                                type="text"
                                placeholder="$ 0"
                                value={kr.currentValue}
                                onChange={e => handleKRChange(objIdx, krIdx, 'currentValue', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  fontSize: '12px',
                                  border: '1px solid #DFE1E6',
                                  borderRadius: '6px',
                                  background: '#FAFBFC',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            {/* Unit */}
                            <div>
                              <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#6B778C', marginBottom: '2px' }}>
                                Unit
                              </label>
                              <select
                                value={kr.unit}
                                onChange={e => handleKRChange(objIdx, krIdx, 'unit', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '6px 6px',
                                  fontSize: '11.5px',
                                  border: '1px solid #DFE1E6',
                                  borderRadius: '6px',
                                  background: '#FAFBFC',
                                  outline: 'none',
                                  cursor: 'pointer',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <option value="USD ($)">USD ($)</option>
                                <option value="NUMBER">Num</option>
                                <option value="PERCENTAGE">%</option>
                                <option value="BOOLEAN">Bool</option>
                              </select>
                            </div>

                            {/* Progress */}
                            <div>
                              <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#6B778C', marginBottom: '2px' }}>
                                Progress
                              </label>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: krProg >= 70 ? '#36B37E' : (krProg >= 40 ? '#FFAB00' : '#FF5630') }}>
                                {krProg}%
                              </div>
                              <div style={{ width: '100%', height: '5px', background: '#DFE1E6', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
                                <div style={{ width: `${krProg}%`, height: '100%', background: krProg >= 70 ? '#36B37E' : (krProg >= 40 ? '#FFAB00' : '#FF5630'), transition: 'width 0.3s' }} />
                              </div>
                            </div>

                            {/* Delete KR */}
                            <button
                              type="button"
                              onClick={() => handleRemoveKR(objIdx, krIdx)}
                              style={{
                                border: 'none',
                                background: '#FFEBE6',
                                color: '#FF5630',
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title="Delete Key Result"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}

                      {/* Add KR Dashed Button */}
                      <button
                        type="button"
                        onClick={() => handleAddKR(objIdx)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px dashed #DFE1E6',
                          borderRadius: '6px',
                          background: '#FFFFFF',
                          color: '#0052CC',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          marginTop: '8px'
                        }}
                      >
                        <Plus size={13} /> Add Key Result
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Objective Dashed Button */}
              <button
                type="button"
                onClick={handleAddObjective}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px dashed #0052CC',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  color: '#0052CC',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                <Plus size={14} /> Add Objective
              </button>
            </div>

            {/* ── SECTION 3: ADDITIONAL SETTINGS ACCORDION ───────── */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #DFE1E6',
              borderRadius: '12px',
              marginBottom: '24px',
              overflow: 'hidden'
            }}>
              <div
                onClick={() => setShowAdditionalSettings(prev => !prev)}
                style={{
                  padding: '16px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: '#FAFBFC'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={16} color="#6B778C" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>
                    ADDITIONAL SETTINGS <span style={{ fontWeight: 400, color: '#6B778C' }}>(Optional)</span>
                  </span>
                </div>
                {showAdditionalSettings ? <ChevronUp size={16} color="#6B778C" /> : <ChevronDown size={16} color="#6B778C" />}
              </div>

              {showAdditionalSettings && (
                <div style={{ padding: '20px 22px', borderTop: '1px solid #DFE1E6', background: '#FFFFFF' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                        Strategic Cycle
                      </label>
                      <select
                        value={goalForm.cycleId}
                        onChange={e => setGoalForm(p => ({ ...p, cycleId: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '13px',
                          border: '1px solid #DFE1E6',
                          borderRadius: '8px',
                          background: '#FAFBFC',
                          color: '#172B4D',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">No Cycle Attached</option>
                        {cycles.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#42526E', marginBottom: '6px' }}>
                        Parent Goal Link
                      </label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Top-level Strategic Goal"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '13px',
                          border: '1px solid #DFE1E6',
                          borderRadius: '8px',
                          background: '#F4F5F7',
                          color: '#6B778C',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #EBECF0',
          background: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#42526E',
              background: '#FFFFFF',
              border: '1px solid #DFE1E6',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="goal-form"
            disabled={saving}
            style={{
              padding: '10px 32px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              background: '#0052CC',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.15s',
              boxShadow: '0 2px 6px rgba(0, 82, 204, 0.25)'
            }}
          >
            {saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>

      </div>
    </div>
  );
}
