import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CreateProjectModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [priority, setPriority] = useState('MEDIUM');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [managerId, setManagerId] = useState('');
    
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/users').then(r => r.json()).then(data => {
            setUsers(Array.isArray(data) ? data : (data.users || []));
        }).catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) return setError('Project name is required');
        if (!managerId) return setError('Project manager is required');

        setLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    status,
                    priority,
                    startDate: startDate ? new Date(startDate).toISOString() : undefined,
                    endDate: endDate ? new Date(endDate).toISOString() : undefined,
                    managerId
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create project');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 30, 66, 0.54)' }}>
            <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 16px rgba(9, 30, 66, 0.12)' }}>
                
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 20, color: '#172B4D', fontWeight: 700 }}>Create New Project</h2>
                    <X size={20} color="#6B778C" style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {error && <div style={{ padding: 12, background: '#FFEBE6', color: '#FF5630', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{error}</div>}
                        
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#42526E', marginBottom: 8 }}>Project Name *</label>
                            <input 
                                autoFocus
                                value={name} onChange={e => setName(e.target.value)}
                                style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '2px solid #DFE1E6', fontSize: 14, outline: 'none' }}
                                placeholder="E.g. Website Redesign"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#42526E', marginBottom: 8 }}>Description</label>
                            <textarea 
                                value={description} onChange={e => setDescription(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 6, border: '2px solid #DFE1E6', fontSize: 14, outline: 'none', resize: 'vertical' }}
                                placeholder="Describe the project goals and scope..."
                                rows={3}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#42526E', marginBottom: 8 }}>Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '2px solid #DFE1E6', fontSize: 14, outline: 'none', background: 'white' }}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="PLANNING">Planning</option>
                                    <option value="ON_HOLD">On Hold</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#42526E', marginBottom: 8 }}>Priority</label>
                                <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '2px solid #DFE1E6', fontSize: 14, outline: 'none', background: 'white' }}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#42526E', marginBottom: 8 }}>Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '2px solid #DFE1E6', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#42526E', marginBottom: 8 }}>End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '2px solid #DFE1E6', fontSize: 14, outline: 'none' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#42526E', marginBottom: 8 }}>Project Manager *</label>
                            <select value={managerId} onChange={e => setManagerId(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '2px solid #DFE1E6', fontSize: 14, outline: 'none', background: 'white' }}>
                                <option value="">Select Manager</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>

                    </div>

                    {/* Footer */}
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #DFE1E6', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#FAFBFC', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                        <button type="button" onClick={onClose} style={{ padding: '0 16px', height: 36, borderRadius: 6, border: '1px solid #DFE1E6', background: 'white', color: '#42526E', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0 16px', height: 36, borderRadius: 6, border: 'none', background: '#0052CC', color: 'white', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
