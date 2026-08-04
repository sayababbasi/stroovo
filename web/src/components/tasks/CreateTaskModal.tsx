"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Target, Users, Calendar, Flag, Link as LinkIcon, AlertTriangle, Clock, 
    Paperclip, CheckSquare, Settings2, MessageSquare, Plus, Trash2, Shield, Upload
} from 'lucide-react';
import type { Priority, TaskStatus } from './types';
import { PRIORITIES, STATUSES, STATUS_LABELS, PRIORITY_LABELS } from './types';

interface CreateTaskModalProps {
    onClose: () => void;
    onSuccess: (task: any) => void;
}

export default function CreateTaskModal({ onClose, onSuccess }: CreateTaskModalProps) {
    // 1. Basic Info
    const [title, setTitle] = useState('');
    const [taskType, setTaskType] = useState('TASK');
    const [isImportant, setIsImportant] = useState(false);
    const [parentId, setParentId] = useState('');
    const [description, setDescription] = useState('');

    // 2. Assignment & Dates
    const [projectId, setProjectId] = useState('');
    const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [storyPoints, setStoryPoints] = useState('');

    // 3. Status & Priority
    const [status, setStatus] = useState<TaskStatus>('TODO');
    const [priority, setPriority] = useState<Priority>('HIGH');
    const [milestone, setMilestone] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    
    // 4. Goal Alignment
    const [goalId, setGoalId] = useState('');
    const [objectiveId, setObjectiveId] = useState('');
    const [keyResultId, setKeyResultId] = useState('');

    // 5. Dependencies
    const [blockedBy, setBlockedBy] = useState('');
    const [blocks, setBlocks] = useState('');
    const [watchers, setWatchers] = useState<string[]>([]);

    // 6. Recurrence & Notification
    const [recurringRule, setRecurringRule] = useState('Does not repeat');
    const [reminderRule, setReminderRule] = useState('On due date');
    const [notifyRule, setNotifyRule] = useState('Assignee only');

    // 7. Checklist
    const [checklist, setChecklist] = useState<{ id: string, text: string, done: boolean }[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');

    // 8. Attachments
    const [file, setFile] = useState<File | null>(null);

    // 9. Custom Fields
    const [clientField, setClientField] = useState('');
    const [budgetField, setBudgetField] = useState('');

    // 10. Time Tracking
    const [timeTrackingEnabled, setTimeTrackingEnabled] = useState(false);
    const [isBillable, setIsBillable] = useState(false);
    const [hourlyRate, setHourlyRate] = useState('');

    // 11. Initial Comment
    const [initialComment, setInitialComment] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data lists
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [pRes, uRes, tRes, gRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/users'),
                    fetch('/api/tasks'),
                    fetch('/api/goals')
                ]);
                if (pRes.ok) {
                    const pData = await pRes.json();
                    setProjects(Array.isArray(pData) ? pData : (pData.projects || []));
                }
                if (uRes.ok) {
                    const uData = await uRes.json();
                    setUsers(Array.isArray(uData) ? uData : (uData.users || []));
                }
                if (tRes.ok) {
                    const tData = await tRes.json();
                    setTasks(Array.isArray(tData) ? tData : (tData.tasks || []));
                }
                if (gRes.ok) {
                    const gData = await gRes.json();
                    setGoals(Array.isArray(gData) ? gData : (gData.goals || []));
                }
            } catch (err) {
                console.error('Failed to fetch modal data:', err);
            }
        }
        fetchData();
    }, []);

    const handleAddChecklist = () => {
        if (!newChecklistItem.trim()) return;
        setChecklist([...checklist, { id: Math.random().toString(), text: newChecklistItem.trim(), done: false }]);
        setNewChecklistItem('');
    };

    const removeChecklist = (id: string) => {
        setChecklist(checklist.filter(c => c.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required'); return; }
        if (!projectId) { setError('Please select a project'); return; }
        setError('');
        setLoading(true);
        try {
            // 1. Create Task
            const payload = {
                title: title.trim(),
                projectId,
                assigneeIds,
                priority,
                status,
                type: taskType,
                parentId: parentId || null,
                startDate: startDate ? new Date(startDate).toISOString() : null,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                description: description.trim() || null,
                
                // Enterprise Fields
                storyPoints: storyPoints ? parseFloat(storyPoints) : null,
                milestone: milestone || null,
                goalId: goalId || null,
                objectiveId: objectiveId || null,
                keyResultId: keyResultId || null,
                timeTrackingEnabled,
                isBillable,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
                recurringRule,
                reminderRule,
                notifyRule,
                customFields: { client: clientField, budget: budgetField }
            };

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to create task');
            }

            const newTask = await res.json();

            // 2. Subtasks / Checklist
            for (const item of checklist) {
                await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: item.text,
                        projectId,
                        parentId: newTask.id,
                        status: 'TODO'
                    })
                });
            }

            // 3. Post Initial Comment if provided
            if (initialComment.trim()) {
                await fetch(`/api/tasks/${newTask.id}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: initialComment.trim() })
                });
            }

            // 4. Attachments (Mock)
            if (file) {
                await fetch(`/api/tasks/${newTask.id}/files`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileUrl: URL.createObjectURL(file), 
                        fileSize: file.size,
                        fileType: file.type
                    })
                });
            }

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
                .ent-section { margin-bottom: 24px; padding: 24px; background: #F4F5F7; border-radius: 12px; border: 1px solid #DFE1E6; }
                .ent-section-title { font-size: 14px; font-weight: 700; color: #172B4D; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
                .ent-section-title span { background: #0052CC; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
                .ent-label { display: block; font-size: 12px; font-weight: 600; color: #42526E; margin-bottom: 6px; }
                .ent-input { width: 100%; padding: 10px 12px; border: 1px solid #DFE1E6; border-radius: 6px; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box; background: white; }
                .ent-input:focus { border-color: #0052CC; box-shadow: 0 0 0 2px rgba(0, 82, 204, 0.1); }
                .ent-select { width: 100%; padding: 10px 12px; border: 1px solid #DFE1E6; border-radius: 6px; font-size: 14px; outline: none; background: white; cursor: pointer; box-sizing: border-box; }
                .ent-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .ent-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .drag-drop-zone { border: 2px dashed #DFE1E6; border-radius: 8px; padding: 32px; text-align: center; background: white; cursor: pointer; transition: all 0.2s; }
                .drag-drop-zone:hover { border-color: #0052CC; background: #E6EFFF; }
                /* Custom Scrollbar */
                .modal-body::-webkit-scrollbar { width: 8px; }
                .modal-body::-webkit-scrollbar-track { background: transparent; }
                .modal-body::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 4px; }
                .modal-body::-webkit-scrollbar-thumb:hover { background: #C1C7D0; }
            `}</style>

            <div style={{
                background: 'white', width: '900px', maxWidth: '95vw', height: '90vh', borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column',
                animation: 'slideUp 0.3s cubic-bezier(0.15, 1, 0.3, 1)', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ padding: '20px 32px', borderBottom: '1px solid #EBECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', zIndex: 10 }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#172B4D', margin: 0 }}>Create New Task</h2>
                        <p style={{ margin: '4px 0 0', color: '#6B778C', fontSize: '14px' }}>Create a task and assign it to move work forward.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={onClose} style={{ background: '#F4F5F7', border: 'none', cursor: 'pointer', color: '#42526E', padding: '8px 16px', borderRadius: '6px', fontWeight: 600 }}>Save as Draft</button>
                        <button onClick={handleSubmit} disabled={loading} style={{ background: '#0052CC', border: 'none', cursor: 'pointer', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: '8px' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#FFFFFF' }}>
                    {error && (
                        <div style={{ marginBottom: 24, padding: '12px 16px', background: '#FFEBE6', border: '1px solid #FF5630', borderRadius: 8, fontSize: '14px', color: '#FF5630', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    {/* Section 1: Basic Information */}
                    <div className="ent-section">
                        <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>1</span> Basic Information</div>
                        <div className="ent-grid-2">
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="ent-label">Task Title *</label>
                                <input autoFocus className="ent-input" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div>
                                <label className="ent-label">Task Type</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <select className="ent-select" value={taskType} onChange={e => setTaskType(e.target.value)}>
                                        <option value="TASK">Task</option>
                                        <option value="BUG">Bug</option>
                                        <option value="FEATURE">Feature</option>
                                        <option value="IMPROVEMENT">Improvement</option>
                                        <option value="MEETING">Meeting</option>
                                    </select>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#42526E', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        <input type="checkbox" checked={isImportant} onChange={e => setIsImportant(e.target.checked)} />
                                        Mark as Important ⭐
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="ent-label">Parent Task</label>
                                <select className="ent-select" value={parentId} onChange={e => setParentId(e.target.value)}>
                                    <option value="">Search a parent task (optional)</option>
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="ent-label">Description</label>
                            <textarea className="ent-input" rows={4} placeholder="Add a detailed description..." style={{ resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                    </div>

                    <div className="ent-grid-2" style={{ marginBottom: 0 }}>
                        {/* Section 2: Assignment & Dates */}
                        <div className="ent-section">
                            <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>2</span> Assignment & Dates</div>
                            <div className="ent-grid-2">
                                <div>
                                    <label className="ent-label">Project *</label>
                                    <select className="ent-select" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="ent-label">Assignees</label>
                                    <div style={{ position: 'relative' }}>
                                        <div 
                                            className="ent-select" 
                                            style={{ minHeight: '42px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', padding: '6px 12px' }}
                                        >
                                            {assigneeIds.length === 0 ? <span style={{ color: '#7A869A' }}>Select Assignees</span> : null}
                                            {assigneeIds.map(id => {
                                                const u = users.find(user => user.id === id);
                                                return (
                                                    <span key={id} style={{ background: '#E6EFFF', color: '#0052CC', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        {u?.name || id}
                                                        <X size={12} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setAssigneeIds(assigneeIds.filter(a => a !== id)) }} />
                                                    </span>
                                                )
                                            })}
                                        </div>
                                        <select 
                                            className="ent-select" 
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                            value=""
                                            onChange={e => {
                                                if (e.target.value && !assigneeIds.includes(e.target.value)) {
                                                    setAssigneeIds([...assigneeIds, e.target.value]);
                                                }
                                            }}
                                        >
                                            <option value="">Select Assignee to add...</option>
                                            {users.filter(u => !assigneeIds.includes(u.id)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="ent-label">Start Date</label>
                                    <input type="date" className="ent-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="ent-label">Due Date *</label>
                                    <input type="date" className="ent-input" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="ent-label">Estimated Time</label>
                                    <select className="ent-select" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)}>
                                        <option value="">Select time</option>
                                        <option value="1">1 Hour</option>
                                        <option value="4">4 Hours</option>
                                        <option value="8">1 Day</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="ent-label">Story Points</label>
                                    <input type="number" className="ent-input" placeholder="Enter points" value={storyPoints} onChange={e => setStoryPoints(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Status & Priority */}
                        <div className="ent-section">
                            <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>3</span> Status & Priority</div>
                            <div className="ent-grid-2">
                                <div>
                                    <label className="ent-label">Status *</label>
                                    <select className="ent-select" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="ent-label">Priority *</label>
                                    <select className="ent-select" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                                        {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label className="ent-label">Milestone</label>
                                <select className="ent-select" value={milestone} onChange={e => setMilestone(e.target.value)}>
                                    <option value="">Select Milestone</option>
                                    <option value="m1">Alpha Release</option>
                                    <option value="m2">Beta Release</option>
                                    <option value="m3">V1 Launch</option>
                                </select>
                            </div>
                            <div>
                                <label className="ent-label">Tags / Labels</label>
                                <input type="text" className="ent-input" placeholder="Select or create labels" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Goal Alignment */}
                    <div className="ent-section">
                        <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>4</span> Goal Alignment (Link to OKR)</div>
                        <div className="ent-grid-3" style={{ alignItems: 'center', gap: '8px' }}>
                            <div>
                                <label className="ent-label">Goal</label>
                                <select className="ent-select" value={goalId} onChange={e => setGoalId(e.target.value)}>
                                    <option value="">Select Goal</option>
                                    {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                                </select>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '20px', color: '#6B778C' }}>→</div>
                            <div>
                                <label className="ent-label">Objective</label>
                                <select className="ent-select" value={objectiveId} onChange={e => { setObjectiveId(e.target.value); setKeyResultId(''); }} disabled={!goalId}>
                                    <option value="">Select Objective</option>
                                    {goalId && goals.find(g => g.id === goalId)?.objectives?.map((o: any) => (
                                        <option key={o.id} value={o.id}>{o.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '20px', color: '#6B778C' }}>→</div>
                            <div>
                                <label className="ent-label">Key Result</label>
                                <select className="ent-select" value={keyResultId} onChange={e => setKeyResultId(e.target.value)} disabled={!objectiveId}>
                                    <option value="">Select Key Result</option>
                                    {objectiveId && goals.find(g => g.id === goalId)?.objectives?.find((o: any) => o.id === objectiveId)?.keyResults?.map((kr: any) => (
                                        <option key={kr.id} value={kr.id}>{kr.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#0052CC', background: '#E6EFFF', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 12 }}>
                            <LinkIcon size={14} /> Linking this task to a Goal, Objective and Key Result helps track progress and impact on your big goals.
                        </div>
                    </div>

                    <div className="ent-grid-2" style={{ marginBottom: 0 }}>
                        {/* Section 5: Dependencies & Relations */}
                        <div className="ent-section">
                            <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>5</span> Dependencies & Relations</div>
                            <div style={{ marginBottom: 16 }}>
                                <label className="ent-label">Blocked by (Dependencies)</label>
                                <input className="ent-input" placeholder="Search tasks this task depends on" value={blockedBy} onChange={e => setBlockedBy(e.target.value)} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label className="ent-label">Blocks (This task blocks)</label>
                                <input className="ent-input" placeholder="Search tasks this task blocks" value={blocks} onChange={e => setBlocks(e.target.value)} />
                            </div>
                            <div>
                                <label className="ent-label">Watchers / Followers</label>
                                <input className="ent-input" placeholder="Add watchers" />
                            </div>
                        </div>

                        {/* Section 6: Recurrence & Notification */}
                        <div className="ent-section">
                            <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>6</span> Recurrence & Notification</div>
                            <div style={{ marginBottom: 16 }}>
                                <label className="ent-label">Recurring Task</label>
                                <select className="ent-select" value={recurringRule} onChange={e => setRecurringRule(e.target.value)}>
                                    <option>Does not repeat</option>
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                            <div className="ent-grid-2">
                                <div>
                                    <label className="ent-label">Reminder</label>
                                    <select className="ent-select" value={reminderRule} onChange={e => setReminderRule(e.target.value)}>
                                        <option>On due date</option>
                                        <option>1 day before</option>
                                        <option>1 week before</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="ent-label">Notify</label>
                                    <select className="ent-select" value={notifyRule} onChange={e => setNotifyRule(e.target.value)}>
                                        <option>Assignee only</option>
                                        <option>Watchers</option>
                                        <option>Team</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ent-grid-2" style={{ marginBottom: 0 }}>
                        {/* Section 7: Checklist / Subtasks */}
                        <div className="ent-section">
                            <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>7</span> Checklist / Subtasks</div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input 
                                    className="ent-input" 
                                    placeholder="Add a checklist item and press Enter..." 
                                    value={newChecklistItem} 
                                    onChange={e => setNewChecklistItem(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklist(); } }}
                                />
                                <button type="button" onClick={handleAddChecklist} style={{ padding: '0 16px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '6px', cursor: 'pointer', color: '#0052CC', fontWeight: 600 }}>Add</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {checklist.map(item => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <input type="checkbox" checked={item.done} onChange={() => {
                                                setChecklist(checklist.map(c => c.id === item.id ? { ...c, done: !c.done } : c));
                                            }} />
                                            <span style={{ fontSize: '14px', color: '#172B4D', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                                        </div>
                                        <button type="button" onClick={() => removeChecklist(item.id)} style={{ background: 'none', border: 'none', color: '#FF5630', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Add a checklist item and press Enter..."]')?.focus()} style={{ background: 'none', border: 'none', color: '#0052CC', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', padding: 0 }}>
                                <Plus size={16} /> Add Checklist Item
                            </button>
                        </div>

                        {/* Section 8: Attachments */}
                        <div className="ent-section">
                            <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>8</span> Attachments</div>
                            <label className="drag-drop-zone" style={{ display: 'block' }}>
                                <input type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                                <Upload size={32} color="#0052CC" style={{ margin: '0 auto 12px' }} />
                                <div style={{ fontSize: '14px', color: '#172B4D', fontWeight: 600, marginBottom: '4px' }}>Drag & drop files here or <span style={{ color: '#0052CC' }}>Choose Files</span></div>
                                <div style={{ fontSize: '12px', color: '#6B778C' }}>Allowed: Images, PDF, Docs, Excel, Zip (Max 50MB)</div>
                            </label>
                            {file && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '6px', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Paperclip size={16} color="#6B778C" />
                                        <div>
                                            <div style={{ fontSize: '14px', color: '#172B4D', fontWeight: 600 }}>{file.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6B778C' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#6B778C', cursor: 'pointer' }}><X size={16} /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ent-grid-2" style={{ marginBottom: 0 }}>
                        {/* Section 9: Custom Fields */}
                        <div className="ent-section">
                            <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>9</span> Custom Fields</div>
                            <div className="ent-grid-2">
                                <div>
                                    <label className="ent-label">Client (Dropdown)</label>
                                    <select className="ent-select" value={clientField} onChange={e => setClientField(e.target.value)}>
                                        <option value="">Select Client</option>
                                        <option value="Internal">Internal</option>
                                        <option value="Acme Corp">Acme Corp</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="ent-label">Budget (Number)</label>
                                    <input type="number" className="ent-input" placeholder="Enter budget" value={budgetField} onChange={e => setBudgetField(e.target.value)} />
                                </div>
                            </div>
                            <button type="button" style={{ background: 'none', border: 'none', color: '#0052CC', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                                <Plus size={16} /> Add Custom Field
                            </button>
                        </div>

                        {/* Section 10: Time Tracking */}
                        <div className="ent-section">
                            <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>10</span> Time Tracking</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div onClick={() => setTimeTrackingEnabled(!timeTrackingEnabled)} style={{ width: '40px', height: '24px', background: timeTrackingEnabled ? '#0052CC' : '#DFE1E6', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                                    <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: timeTrackingEnabled ? '18px' : '2px', transition: '0.3s' }}></div>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172B4D' }}>Enable time tracking for this task</span>
                            </div>
                            {timeTrackingEnabled && (
                                <div className="ent-grid-2">
                                    <div>
                                        <label className="ent-label">Billable</label>
                                        <select className="ent-select" value={isBillable ? 'yes' : 'no'} onChange={e => setIsBillable(e.target.value === 'yes')}>
                                            <option value="no">Non-billable</option>
                                            <option value="yes">Billable</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="ent-label">Hourly Rate (USD)</label>
                                        <input type="number" className="ent-input" placeholder="Enter rate" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} disabled={!isBillable} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 11: Initial Comment */}
                    <div className="ent-section" style={{ marginBottom: 0 }}>
                        <div className="ent-section-title"><span style={{background: '#0052CC', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>11</span> Initial Comment</div>
                        <textarea className="ent-input" rows={3} placeholder="Add an initial comment..." style={{ resize: 'vertical' }} value={initialComment} onChange={e => setInitialComment(e.target.value)} />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '20px 32px', borderTop: '1px solid #EBECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F5F7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B778C', fontSize: '13px' }}>
                        {/* Avatar mock */}
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DFE1E6' }}></div>
                        Draft saved a few seconds ago
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '6px', background: 'white', border: '1px solid #DFE1E6', color: '#42526E', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                        <button type="button" style={{ padding: '10px 16px', borderRadius: '6px', background: 'white', border: '1px solid #DFE1E6', color: '#42526E', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Save as Draft</button>
                        <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', borderRadius: '6px', background: '#0052CC', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)' }}>
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
