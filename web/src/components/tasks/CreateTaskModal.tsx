"use client";
import React, { useState, useEffect } from 'react';
import { X, Loader2, Target, Users, Calendar, Flag } from 'lucide-react';
import type { Priority, TaskStatus } from './types';
import { PRIORITIES, STATUSES, STATUS_LABELS, PRIORITY_LABELS } from './types';

interface CreateTaskModalProps {
    onClose: () => void;
    onSuccess: (task: any) => void;
}

export default function CreateTaskModal({ onClose, onSuccess }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [priority, setPriority] = useState<Priority>('MEDIUM');
    const [status, setStatus] = useState<TaskStatus>('TODO');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [initialComment, setInitialComment] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [pRes, uRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/users')
                ]);
                if (pRes.ok) {
                    const pData = await pRes.json();
                    setProjects(Array.isArray(pData) ? pData : (pData.projects || []));
                }
                if (uRes.ok) {
                    const uData = await uRes.json();
                    setUsers(Array.isArray(uData) ? uData : (uData.users || []));
                }
            } catch (err) {
                console.error('Failed to fetch modal data:', err);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required'); return; }
        if (!projectId) { setError('Please select a project'); return; }
        setError('');
        setLoading(true);
        try {
            // 1. Create Task
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    projectId,
                    assigneeId: assigneeId || null,
                    priority,
                    status,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                    description: description.trim() || null,
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to create task');
            }

            const newTask = await res.json();

            // 2. Post Initial Comment if provided
            if (initialComment.trim()) {
                await fetch(`/api/tasks/${newTask.id}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: initialComment.trim() })
                });
            }

            // 3. Upload File metadata if provided
            if (file) {
                await fetch(`/api/tasks/${newTask.id}/files`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileUrl: URL.createObjectURL(file), // temporary local URL pattern
                        fileSize: file.size,
                        fileType: file.type
                    })
                });
            }

            // 4. Refetch the task to get updated counts (comments, files)
            const finalRes = await fetch(`/api/tasks/${newTask.id}`);
            if (finalRes.ok) {
                const finalTask = await finalRes.json();
                onSuccess(finalTask);
            } else {
                onSuccess(newTask);
            }
        } catch (err: any) {
            console.error('Task creation error:', err);
            setError(err.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(9, 30, 66, 0.54)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                .cm-label { display: block; font-size: 11px; font-weight: 700; color: #42526E; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
                .cm-input { width: 100%; padding: 10px 12px; border: 2px solid #DFE1E6; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box; }
                .cm-input:focus { border-color: #0052CC; box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1); }
                .cm-select { width: 100%; padding: 10px 12px; border: 2px solid #DFE1E6; border-radius: 8px; font-size: 14px; outline: none; background: white; cursor: pointer; box-sizing: border-box; }
                .cm-select:focus { border-color: #0052CC; }
            `}</style>

            <div style={{
                background: 'white', width: '640px', maxWidth: '95vw', borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)', overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.15, 1, 0.3, 1)'
            }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #EBECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172B4D', margin: 0 }}>Create New Task</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: 4 }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '28px 32px 32px', maxHeight: '80vh', overflowY: 'auto' }}>
                    {error && (
                        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FFEBE6', border: '1px solid #FF5630', borderRadius: 8, fontSize: '13px', color: '#FF5630', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                        <label className="cm-label">Task Title *</label>
                        <input autoFocus className="cm-input" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
                        <div>
                            <label className="cm-label"><Target size={11} style={{ marginRight: 4, display: 'inline' }} />Project *</label>
                            <select className="cm-select" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                                <option value="">Select Project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="cm-label"><Users size={11} style={{ marginRight: 4, display: 'inline' }} />Assignee</label>
                            <select className="cm-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: 16 }}>
                        <div>
                            <label className="cm-label"><Flag size={11} style={{ marginRight: 4, display: 'inline' }} />Priority</label>
                            <select className="cm-select" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="cm-label">Status</label>
                            <select className="cm-select" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                                {STATUSES.filter(s => s !== 'BACKLOG').map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="cm-label"><Calendar size={11} style={{ marginRight: 4, display: 'inline' }} />Due Date</label>
                            <input type="date" className="cm-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label className="cm-label">Description</label>
                        <textarea className="cm-input" rows={2} placeholder="Add more details..." style={{ resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label className="cm-label">Initial Comment</label>
                        <textarea className="cm-input" rows={2} placeholder="Add a first comment..." style={{ resize: 'vertical' }} value={initialComment} onChange={e => setInitialComment(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <label className="cm-label">Attachment</label>
                        <div style={{ position: 'relative' }}>
                            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{
                                width: '100%', padding: '8px 12px', border: '2px dashed #DFE1E6', borderRadius: 8, fontSize: '13px', cursor: 'pointer'
                            }} />
                        </div>
                        {file && <div style={{ fontSize: '11px', color: '#0052CC', marginTop: 4, fontWeight: 600 }}>Selected: {file.name}</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #DFE1E6', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#42526E', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || !title.trim() || !projectId} style={{
                            padding: '10px 32px', background: !title.trim() || !projectId ? '#DFE1E6' : '#0052CC', border: 'none',
                            borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: 'white',
                            cursor: loading || !title.trim() || !projectId ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: !title.trim() || !projectId ? 'none' : '0 4px 12px rgba(0, 82, 204, 0.25)'
                        }}>
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
