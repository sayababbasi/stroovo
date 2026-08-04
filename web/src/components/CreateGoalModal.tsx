"use client";

import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { Cycle, Goal } from '@/types/goals';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycles: Cycle[];
  onSuccess: () => void;
  goalToEdit?: Goal | null;
}

interface KeyResultDraft {
  id?: string;
  title: string;
  targetValue: number;
  unit: string;
  currentValue?: number;
}

export default function CreateGoalModal({ isOpen, onClose, cycles, onSuccess, goalToEdit }: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('COMPANY');
  const [status, setStatus] = useState('ON_TRACK');
  const [targetDate, setTargetDate] = useState('');
  const [cycleId, setCycleId] = useState(cycles[0]?.id ?? '');
  const [keyResults, setKeyResults] = useState<KeyResultDraft[]>([{ title: '', targetValue: 100, unit: 'NUMBER' }]);
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const defaultCycleId = cycles[0]?.id ?? '';
    setCycleId(defaultCycleId);

    fetch('/api/users')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const users = Array.isArray(data) ? data : [];
        const nextOwnerId = goalToEdit?.ownerId || users[0]?.id || '';
        setOwnerId(nextOwnerId);
      })
      .catch(() => setOwnerId(''));

    if (goalToEdit) {
      setTitle(goalToEdit.title || '');
      setDescription(goalToEdit.description || '');
      setType(goalToEdit.type || 'COMPANY');
      setStatus(goalToEdit.status || 'ON_TRACK');
      setTargetDate(goalToEdit.targetDate ? new Date(goalToEdit.targetDate).toISOString().split('T')[0] : '');
      setCycleId(goalToEdit.cycleId || defaultCycleId);
      setKeyResults(
        (goalToEdit.keyResults || []).length > 0
          ? goalToEdit.keyResults!.map((kr) => ({
            id: kr.id,
            title: kr.title,
            targetValue: Number(kr.targetValue) || 100,
            unit: kr.unit || 'NUMBER',
            currentValue: Number(kr.currentValue) || 0,
          }))
          : [{ title: '', targetValue: 100, unit: 'NUMBER' }]
      );
    } else {
      setTitle('');
      setDescription('');
      setType('COMPANY');
      setStatus('ON_TRACK');
      setTargetDate('');
      setCycleId(defaultCycleId);
      setKeyResults([{ title: '', targetValue: 100, unit: 'NUMBER' }]);
    }
  }, [cycles, goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddKR = () => {
    setKeyResults((prev) => [...prev, { title: '', targetValue: 100, unit: 'NUMBER' }]);
  };

  const handleRemoveKR = (index: number) => {
    setKeyResults((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleKRChange = (index: number, field: keyof KeyResultDraft, value: string | number | undefined) => {
    setKeyResults((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim()) {
      setError('Goal title is required.');
      setLoading(false);
      return;
    }

    if (!ownerId) {
      setError('Could not load user details. Please refresh and try again.');
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      type,
      cycleId: cycleId || null,
      status,
      targetDate: targetDate ? new Date(targetDate) : null,
      ownerId,
      keyResults: keyResults.filter((kr) => kr.title.trim()).map((kr) => ({
        title: kr.title.trim(),
        targetValue: Number(kr.targetValue) || 0,
        currentValue: Number(kr.currentValue) || 0,
        unit: kr.unit,
      })),
    };

    try {
      const url = goalToEdit ? `/api/goals/${goalToEdit.id}` : '/api/goals';
      const method = goalToEdit ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.details || errorData?.error || 'Failed to save goal.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 30, 66, 0.54)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '8px', width: '640px', maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 12px 24px rgba(0, 0, 0, 0.16)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#172B4D' }}>{goalToEdit ? 'Edit Goal' : 'Create Goal'}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B778C' }}>Capture your objective and its measurable Key Objective.</p>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: '#6B778C', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error ? (
            <div style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #FFEBE6', background: '#FFF4F2', color: '#BF2600', fontSize: '13px' }}>
              {error}
            </div>
          ) : null}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>Goal Title *</label>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Increase recurring revenue"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="What do we want to achieve?"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>Type</label>
              <select value={type} onChange={(event) => setType(event.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', background: '#FAFBFC' }}>
                <option value="COMPANY">Company</option>
                <option value="TEAM">Team</option>
                <option value="INDIVIDUAL">Individual</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>Cycle</label>
              <select value={cycleId} onChange={(event) => setCycleId(event.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', background: '#FAFBFC' }}>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', background: '#FAFBFC' }}>
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="OFF_TRACK">Off Track</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#42526E', marginBottom: '4px' }}>Due Date</label>
              <input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px', background: '#FAFBFC' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#42526E' }}>Key Objective</label>
              <button type="button" onClick={handleAddKR} style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', color: '#0052CC', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={14} /> Add Result
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {keyResults.map((kr, index) => (
                <div key={`${kr.title}-${index}`} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Key result title"
                    value={kr.title}
                    onChange={(event) => handleKRChange(index, 'title', event.target.value)}
                    style={{ flex: 2, padding: '8px 10px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    type="number"
                    placeholder="Target"
                    value={kr.targetValue}
                    onChange={(event) => handleKRChange(index, 'targetValue', Number(event.target.value) || 0)}
                    style={{ width: '90px', padding: '8px 10px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <select value={kr.unit} onChange={(event) => handleKRChange(index, 'unit', event.target.value)} style={{ width: '100px', padding: '8px 10px', border: '1px solid #DFE1E6', borderRadius: '6px', fontSize: '14px' }}>
                    <option value="NUMBER">Number</option>
                    <option value="PERCENTAGE">%</option>
                    <option value="CURRENCY">$</option>
                  </select>
                  <button type="button" onClick={() => handleRemoveKR(index)} style={{ border: '1px solid #FFEBE6', background: 'transparent', color: '#BF2600', borderRadius: '6px', cursor: 'pointer', padding: '0 10px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', border: '1px solid #DFE1E6', background: 'white', color: '#42526E', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 16px', border: 'none', background: '#0052CC', color: 'white', borderRadius: '6px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : goalToEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
