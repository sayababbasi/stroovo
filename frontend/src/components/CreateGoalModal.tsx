"use client";

import { useState, useEffect } from 'react';
import { Cycle, Goal } from '@/types/goals';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycles: Cycle[];
    onSuccess: () => void;
    goalToEdit?: Goal | null;
}

export default function CreateGoalModal({ isOpen, onClose, cycles, onSuccess, goalToEdit }: CreateGoalModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('COMPANY');
    const [status, setStatus] = useState('ON_TRACK');
    const [targetDate, setTargetDate] = useState('');
    const [cycleId, setCycleId] = useState(cycles.length > 0 ? cycles[0].id : '');
    const [keyResults, setKeyResults] = useState<{ id?: string; title: string; targetValue: number; unit: string; currentValue?: number }[]>([
        { title: '', targetValue: 100, unit: 'NUMBER' }
    ]);
    const [loading, setLoading] = useState(false);
    const [ownerId, setOwnerId] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Fetch users (always need this for owner selection/verification)
            fetch(`${API_URL}/api/users`)
                .then(res => res.json())
                .then(data => {
                    const users = Array.isArray(data) ? data : [];
                    // If editing, use existing owner ID. If creating, default to first user.
                    if (goalToEdit && goalToEdit.ownerId) {
                        setOwnerId(goalToEdit.ownerId);
                    } else if (users.length > 0 && !ownerId) {
                        setOwnerId(users[0].id);
                    }
                })
                .catch(err => console.error('Failed to fetch users:', err));

            // Populate form if editing
            if (goalToEdit) {
                setTitle(goalToEdit.title);
                setDescription(goalToEdit.description || '');
                setType(goalToEdit.type);
                setStatus(goalToEdit.status || 'ON_TRACK');
                setTargetDate(goalToEdit.targetDate ? new Date(goalToEdit.targetDate).toISOString().split('T')[0] : '');
                setCycleId(goalToEdit.cycleId || '');
                if (goalToEdit.keyResults && goalToEdit.keyResults.length > 0) {
                    setKeyResults(goalToEdit.keyResults.map(kr => ({
                        id: kr.id,
                        title: kr.title,
                        targetValue: kr.targetValue,
                        unit: kr.unit,
                        currentValue: kr.currentValue || 0
                    })));
                } else {
                    setKeyResults([{ title: '', targetValue: 100, unit: 'NUMBER' }]);
                }
            } else {
                // Reset for creation
                setTitle('');
                setDescription('');
                setType('COMPANY');
                setStatus('ON_TRACK');
                setTargetDate('');
                setCycleId(cycles.length > 0 ? cycles[0].id : '');
                setKeyResults([{ title: '', targetValue: 100, unit: 'NUMBER' }]);
            }
        }
    }, [isOpen, goalToEdit]);

    if (!isOpen) return null;

    const handleAddKR = () => {
        setKeyResults([...keyResults, { title: '', targetValue: 100, unit: 'NUMBER' }]);
    };

    const handleRemoveKR = (index: number) => {
        setKeyResults(keyResults.filter((_, i) => i !== index));
    };

    const handleKRChange = (index: number, field: string, value: any) => {
        const newKRs: any = [...keyResults];
        newKRs[index][field] = value;
        setKeyResults(newKRs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!ownerId) {
            toast.error("Error: Could not load User details. Please refresh the page.");
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
            ownerId: ownerId,
            keyResults: keyResults.filter(kr => kr.title)
        };

        try {
            const url = goalToEdit ? `${API_URL}/api/goals/${goalToEdit.id}` : `${API_URL}/api/goals`;
            const method = goalToEdit ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(goalToEdit ? 'Goal updated successfully!' : 'Goal created successfully!');
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                console.error('Failed to save goal:', errorData);
                toast.error(`Failed: ${errorData.details || errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 30, 66, 0.54)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '4px', width: '600px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 16px -4px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)' }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#172B4D' }}>{goalToEdit ? 'Edit Goal' : 'Create Goal'}</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B778C' }}><X size={24} /></button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '4px' }}>Goal Title <span style={{ color: 'red' }}>*</span></label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Increase Recurring Revenue"
                            style={{ width: '100%', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px', color: '#172B4D' }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '4px' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What do we want to achieve?"
                            style={{ width: '100%', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px', color: '#172B4D', fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* Row: Type & Cycle */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '4px' }}>Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px', color: '#172B4D', background: '#FAFBFC' }}
                            >
                                <option value="COMPANY">Company</option>
                                <option value="TEAM">Team</option>
                                <option value="INDIVIDUAL">Individual</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '4px' }}>Cycle</label>
                            <select
                                value={cycleId}
                                onChange={e => setCycleId(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px', color: '#172B4D', background: '#FAFBFC' }}
                            >
                                {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row: Status & Date */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '4px' }}>Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px', color: '#172B4D', background: '#FAFBFC' }}
                            >
                                <option value="ON_TRACK">On Track</option>
                                <option value="AT_RISK">At Risk</option>
                                <option value="OFF_TRACK">Off Track</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#42526E', marginBottom: '4px' }}>Due Date</label>
                            <input
                                type="date"
                                value={targetDate}
                                onChange={e => setTargetDate(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px', color: '#172B4D', background: '#FAFBFC' }}
                            />
                        </div>
                    </div>

                    {/* Key Results */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#42526E' }}>Key Results</label>
                            <button type="button" onClick={handleAddKR} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#0052CC', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                <Plus size={14} /> Add Result
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {keyResults.map((kr, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Key Result Title"
                                        value={kr.title}
                                        onChange={(e) => handleKRChange(idx, 'title', e.target.value)}
                                        style={{ flex: 2, padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Current"
                                        value={kr.currentValue}
                                        onChange={(e) => handleKRChange(idx, 'currentValue', parseFloat(e.target.value) || 0)}
                                        style={{ width: '80px', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Target"
                                        value={kr.targetValue}
                                        onChange={(e) => handleKRChange(idx, 'targetValue', parseFloat(e.target.value) || 0)}
                                        style={{ width: '80px', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px' }}
                                    />
                                    <select
                                        value={kr.unit}
                                        onChange={(e) => handleKRChange(idx, 'unit', e.target.value)}
                                        style={{ width: '100px', padding: '8px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px' }}
                                    >
                                        <option value="NUMBER">Number</option>
                                        <option value="PERCENTAGE">%</option>
                                        <option value="CURRENCY">$</option>
                                    </select>
                                    <button type="button" onClick={() => handleRemoveKR(idx)} style={{ color: '#BF2600', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #DFE1E6' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'none', border: 'none', color: '#42526E', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Saving...' : (goalToEdit ? 'Save Changes' : 'Create Goal')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
