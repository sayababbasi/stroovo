
"use client";

import { useState } from 'react';
import { X, Edit2, AlertTriangle, Lightbulb, TrendingUp, Plus, Trash2, Check, Target, ChevronDown, ChevronRight, MoreHorizontal, Link as LinkIcon, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Props { goal: any; onClose: () => void; onRefresh: () => void; onEdit: (g: any) => void; }

export default function GoalDetailPanel({ goal, onClose, onRefresh, onEdit }: Props) {
  const { hasPermission } = useAuth();
  const [tab, setTab] = useState<'overview' | 'objectives' | 'updates' | 'insights'>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Objective state
  const [isAddingObj, setIsAddingObj] = useState(false);
  const [newObj, setNewObj] = useState({ title: '', description: '', status: 'ON_TRACK', targetDate: '' });
  const [editingObj, setEditingObj] = useState<{ id: string; title: string; description: string; status: string } | null>(null);

  // KR state
  const [addingKRForObj, setAddingKRForObj] = useState<string | null>(null);
  const [newKRData, setNewKRData] = useState({ title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' });
  const [editKR, setEditKR] = useState<{ id: string; title: string; currentValue: number; targetValue: number; unit: string } | null>(null);
  const [expandedObjs, setExpandedObjs] = useState<Set<string>>(new Set((goal.objectives || []).map((o: any) => o.id)));

  // Details
  const [detailsOpen, setDetailsOpen] = useState(true);

  const toggleObj = (id: string) => {
    setExpandedObjs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const c = goal.computed || {};
  const objectives: any[] = goal.objectives || [];
  
  const riskColor = (c.riskScore ?? 0) > 70 ? '#FF5630' : (c.riskScore ?? 0) > 40 ? '#FFAB00' : '#36B37E';
  const healthColor = (c.healthScore ?? 0) >= 70 ? '#36B37E' : (c.healthScore ?? 0) >= 40 ? '#FFAB00' : '#FF5630';

  const canEdit = hasPermission("goals.edit");
  const canDelete = hasPermission("goals.delete");

  // API functions
  const handleCreateObjective = async () => {
    if (!newObj.title.trim()) return;
    try {
      const res = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ goalId: goal.id, title: newObj.title, description: newObj.description, status: newObj.status, targetDate: newObj.targetDate || null, ownerId: goal.ownerId })
      });
      if (res.ok) {
        toast.success('Objective created!');
        setIsAddingObj(false);
        setNewObj({ title: '', description: '', status: 'ON_TRACK', targetDate: '' });
        onRefresh();
      }
    } catch { toast.error('Failed to create objective'); }
  };

  const handleSaveObjective = async () => {
    if (!editingObj) return;
    try {
      const res = await fetch(`/api/objectives/${editingObj.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editingObj.title, description: editingObj.description, status: editingObj.status })
      });
      if (res.ok) {
        toast.success('Objective updated!');
        setEditingObj(null);
        onRefresh();
      }
    } catch { toast.error('Failed to update objective'); }
  };

  const handleDeleteObjective = async (objId: string) => {
    if (!confirm('Are you sure you want to delete this objective and its key results?')) return;
    try {
      const res = await fetch(`/api/objectives/${objId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { toast.success('Objective deleted'); onRefresh(); }
    } catch { toast.error('Failed to delete objective'); }
  };

  const handleAddKRToObjective = async (objId: string) => {
    if (!newKRData.title.trim() || !newKRData.targetValue) return;
    try {
      const targetVal = parseFloat(newKRData.targetValue) || 0;
      const initialVal = parseFloat(newKRData.initialValue) || 0;
      const res = await fetch(`/api/objectives/${objId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          keyResults: [
            ...((objectives.find(o => o.id === objId)?.keyResults) || []).map((k: any) => ({
              id: k.id, title: k.title, targetValue: k.targetValue, initialValue: k.initialValue, currentValue: k.currentValue, unit: k.unit
            })),
            { title: newKRData.title, targetValue: targetVal, initialValue: initialVal, currentValue: initialVal, unit: newKRData.unit }
          ]
        })
      });
      if (res.ok) {
        toast.success('Key result added!');
        setAddingKRForObj(null);
        setNewKRData({ title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' });
        onRefresh();
      }
    } catch { toast.error('Failed to add key result'); }
  };

  const saveKR = async () => {
    if (!editKR) return;
    try {
      const res = await fetch(`/api/key-results/${editKR.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editKR.title, currentValue: editKR.currentValue, targetValue: editKR.targetValue, unit: editKR.unit })
      });
      if (res.ok) {
        toast.success('Key result updated!');
        setEditKR(null);
        onRefresh();
      }
    } catch { toast.error('Failed to update key result'); }
  };

  const deleteKR = async (krId: string) => {
    if (!confirm('Delete this key result?')) return;
    try {
      const res = await fetch(`/api/key-results/${krId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { toast.success('Key result deleted'); onRefresh(); }
    } catch { toast.error('Failed to delete key result'); }
  };

  const handleDeleteGoal = async () => {
    if (!confirm('Are you sure you want to delete this goal? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/goals/${goal.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { toast.success('Goal deleted'); onClose(); onRefresh(); }
    } catch { toast.error('Failed to delete goal'); }
  };

  return (
    <div className="dpanel">
      <div className="dpanel-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              {goal.type === 'COMPANY' ? 'Company Strategic Goal' : goal.type === 'DEPARTMENT' ? 'Department Goal' : goal.type === 'TEAM' ? 'Team Goal' : 'Personal Goal'}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: (c.riskScore ?? 0) > 70 ? '#FFEBE6' : (c.riskScore ?? 0) > 40 ? '#FFF7D6' : '#E3FCEF', color: riskColor, fontSize: 9 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: riskColor }} />
                {(c.riskScore ?? 0) > 70 ? 'High Risk' : (c.riskScore ?? 0) > 40 ? 'At Risk' : 'On Track'}
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#172B4D', lineHeight: 1.3, margin: 0 }}>{goal.title}</h2>
            <div className="dpanel-meta">
              <span><b>Owner:</b> {goal.owner?.name || 'Unassigned'}</span>
              <span><b>Team:</b> {goal.projects?.[0]?.name || 'No team'}</span>
              <span><b>Deadline:</b> {goal.targetDate ? format(new Date(goal.targetDate), 'MMM d, yyyy') : 'None'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {canEdit && <button className="dp-action-btn" onClick={() => onEdit(goal)}><Edit2 size={14} /> Edit</button>}
            <div style={{ position: 'relative' }}>
              <button className="dp-action-btn" style={{ padding: '6px' }} onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={14} /></button>
              {menuOpen && (
                <div className="action-menu" style={{ right: 0, top: 32 }}>
                  {canEdit && <button onClick={() => { onEdit(goal); setMenuOpen(false); }}>Edit Goal</button>}
                  {canDelete && <button className="danger" onClick={handleDeleteGoal}>Delete Goal</button>}
                </div>
              )}
            </div>
            <button className="dp-action-btn" style={{ padding: '6px', marginLeft: 8 }} onClick={onClose}><X size={14} /></button>
          </div>
        </div>
      </div>

      <div className="dp-summary-row">
        <div className="dp-metric-sm">
          <span>Overall Progress</span>
          <b style={{ color: '#0052CC', fontSize: 24 }}>{c.progress ?? goal.progress ?? 0}%</b>
        </div>
        <div className="dp-metric-sm">
          <span>Health</span>
          <b style={{ color: healthColor, fontSize: 24 }}>{c.healthScore ?? 0}</b>
        </div>
        <div className="dp-metric-sm">
          <span>Confidence</span>
          <b style={{ color: '#0052CC', fontSize: 24 }}>{c.confidenceScore ?? 0}</b>
        </div>
        <div className="dp-metric-sm">
          <span>Days Remaining</span>
          <b style={{ color: (c.daysRemaining ?? 0) < 0 ? '#FF5630' : '#172B4D', fontSize: 24 }}>{c.daysRemaining ?? '—'}</b>
        </div>
      </div>

      <div className="dp-nav">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'objectives' ? 'active' : ''} onClick={() => setTab('objectives')}>Objectives ({objectives.length})</button>
        <button className={tab === 'updates' ? 'active' : ''} onClick={() => setTab('updates')}>Updates</button>
        <button className={tab === 'insights' ? 'active' : ''} onClick={() => setTab('insights')}>Insights</button>
      </div>

      <div className="dpanel-content">
        {tab === 'overview' && (
          <>
            <div className="dp-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 20px 16px' }}>
                <div className="dp-card-title" style={{ marginBottom: 12 }}>Smart Progress</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>{c.progress ?? goal.progress ?? 0}%</span>
                  <span style={{ fontSize: 13, color: '#6B778C', paddingBottom: 4 }}>Completed</span>
                </div>
                <div className="g-prog" style={{ height: 8, marginBottom: 16 }}>
                  <div className="g-prog-fill" style={{ width: `${c.progress ?? goal.progress ?? 0}%`, background: '#0052CC' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#6B778C', marginBottom: 2 }}>Current Pace</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#36B37E' }}>{(c.velocityScore ?? 0).toFixed(2)}% / week</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#6B778C', marginBottom: 2 }}>Expected Completion</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: (c.expectedCompletion ?? 0) >= 100 ? '#36B37E' : '#FF5630' }}>{c.expectedCompletion ?? 0}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div className="dp-card" style={{ marginBottom: 0 }}>
                <div className="dp-card-title"><LinkIcon size={12} /> Linked Work</div>
                <div style={{ fontSize: 13, color: '#172B4D', marginBottom: 8 }}><b>Projects:</b> {goal.projects?.length || 0} linked</div>
                <div style={{ fontSize: 13, color: '#172B4D' }}><b>Tasks:</b> {goal.tasks?.length || 0} connected</div>
                {!goal.projects?.length && (
                  <button className="dp-action-btn" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}><Plus size={12} /> Link Project</button>
                )}
              </div>
              <div className="dp-card" style={{ marginBottom: 0 }}>
                <div className="dp-card-title"><Activity size={12} /> Quick Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {canEdit && <button className="dp-action-btn" onClick={() => setTab('objectives')}><Plus size={12} /> Add Objective</button>}
                  {canEdit && <button className="dp-action-btn" onClick={() => setTab('updates')}><TrendingUp size={12} /> Add Update</button>}
                </div>
              </div>
            </div>

            <div className="dp-card">
              <div className="dp-card-title" style={{ cursor: 'pointer', marginBottom: detailsOpen ? 16 : 0 }} onClick={() => setDetailsOpen(!detailsOpen)}>
                Goal Details
                {detailsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {detailsOpen && (
                <div className="dp-details-grid">
                  <span className="dp-details-label">Description</span>
                  <span className="dp-details-value">{goal.description || 'No description provided.'}</span>
                  <span className="dp-details-label">Goal Type</span>
                  <span className="dp-details-value">{goal.type}</span>
                  <span className="dp-details-label">Visibility</span>
                  <span className="dp-details-value">Organization</span>
                  <span className="dp-details-label">Start Date</span>
                  <span className="dp-details-value">{goal.startDate ? format(new Date(goal.startDate), 'MMM d, yyyy') : 'Not set'}</span>
                  <span className="dp-details-label">Deadline</span>
                  <span className="dp-details-value">{goal.targetDate ? format(new Date(goal.targetDate), 'MMM d, yyyy') : 'Not set'}</span>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'objectives' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="dp-card-title" style={{ margin: 0 }}>Objectives ({objectives.length})</div>
              {canEdit && <button className="gb-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setIsAddingObj(true)}><Plus size={14} /> Add Objective</button>}
            </div>

            {isAddingObj && (
              <div className="dp-card" style={{ background: '#F4F5F7' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', marginBottom: 12 }}>New Objective</div>
                <input className="ginput" style={{ marginBottom: 10 }} placeholder="Objective title..." value={newObj.title} onChange={e => setNewObj(p => ({ ...p, title: e.target.value }))} autoFocus />
                <textarea className="gtextarea" style={{ marginBottom: 10 }} placeholder="Description (optional)..." rows={2} value={newObj.description} onChange={e => setNewObj(p => ({ ...p, description: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="gb-ghost" onClick={() => setIsAddingObj(false)}>Cancel</button>
                  <button className="gb-primary" onClick={handleCreateObjective}>Save Objective</button>
                </div>
              </div>
            )}

            {objectives.length === 0 && !isAddingObj ? (
              <div className="dp-empty">
                <Target size={32} color="#8993A4" style={{ marginBottom: 12 }} />
                <h4>No objectives yet</h4>
                <p>Break this goal into measurable objectives to start tracking progress.</p>
                {canEdit && <button className="gb-primary" onClick={() => setIsAddingObj(true)}><Plus size={14} /> Add Objective</button>}
              </div>
            ) : (
              objectives.map((obj: any, idx: number) => {
                const isExpanded = expandedObjs.has(obj.id);
                const krs: any[] = obj.keyResults || [];
                const isEdObj = editingObj?.id === obj.id;

                return (
                  <div key={obj.id} className="dp-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {isEdObj && editingObj ? (
                      <div style={{ padding: 20 }}>
                        <input className="ginput" style={{ marginBottom: 10 }} value={editingObj.title} onChange={e => setEditingObj(prev => prev ? { ...prev, title: e.target.value } : null)} />
                        <textarea className="gtextarea" style={{ marginBottom: 10 }} rows={2} value={editingObj.description} onChange={e => setEditingObj(prev => prev ? { ...prev, description: e.target.value } : null)} />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="gb-ghost" onClick={() => setEditingObj(null)}>Cancel</button>
                          <button className="gb-primary" onClick={handleSaveObjective}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 20, cursor: 'pointer', background: isExpanded ? '#FAFBFC' : '#fff', borderBottom: isExpanded ? '1px solid #DFE1E6' : 'none' }} onClick={() => toggleObj(obj.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#8993A4', paddingTop: 2 }}>{String(idx + 1).padStart(2, '0')}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', marginBottom: 6 }}>{obj.title}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6B778C' }}>
                                <span>Owner: {goal.owner?.name || 'Unassigned'}</span>
                                {obj.targetDate && <span>Due: {format(new Date(obj.targetDate), 'MMM d')}</span>}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: '#0052CC', marginBottom: 4 }}>{obj.progress}%</div>
                              <div className="g-prog" style={{ width: 80, height: 6 }}><div className="g-prog-fill" style={{ width: `${obj.progress}%` }} /></div>
                            </div>
                            {isExpanded ? <ChevronDown size={18} color="#8993A4" /> : <ChevronRight size={18} color="#8993A4" />}
                          </div>
                        </div>
                      </div>
                    )}

                    {isExpanded && !isEdObj && (
                      <div style={{ padding: 20, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div className="dp-card-title" style={{ margin: 0 }}>Key Results</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {canEdit && <button className="dp-action-btn" onClick={() => setAddingKRForObj(obj.id)}><Plus size={12} /> Add KR</button>}
                            {canEdit && <button className="dp-action-btn" onClick={() => setEditingObj({ id: obj.id, title: obj.title, description: obj.description || '', status: obj.status })}><Edit2 size={12} /> Edit</button>}
                            {canDelete && <button className="dp-action-btn" style={{ color: '#FF5630' }} onClick={() => handleDeleteObjective(obj.id)}><Trash2 size={12} /> Delete</button>}
                          </div>
                        </div>

                        {addingKRForObj === obj.id && (
                          <div style={{ background: '#FAFBFC', padding: 16, border: '1px dashed #0052CC', borderRadius: 8, marginBottom: 16 }}>
                            <input className="ginput" style={{ marginBottom: 10 }} placeholder="KR title..." value={newKRData.title} onChange={e => setNewKRData(p => ({ ...p, title: e.target.value }))} autoFocus />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                              <input className="ginput" type="number" placeholder="Target" value={newKRData.targetValue} onChange={e => setNewKRData(p => ({ ...p, targetValue: e.target.value }))} />
                              <input className="ginput" type="number" placeholder="Start" value={newKRData.initialValue} onChange={e => setNewKRData(p => ({ ...p, initialValue: e.target.value }))} />
                              <select className="gselect" value={newKRData.unit} onChange={e => setNewKRData(p => ({ ...p, unit: e.target.value }))}>
                                <option value="NUMBER">Number</option><option value="PERCENTAGE">Percentage</option><option value="BOOLEAN">Boolean</option><option value="CURRENCY">Currency</option>
                              </select>
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button className="gb-ghost" onClick={() => setAddingKRForObj(null)}>Cancel</button>
                              <button className="gb-primary" onClick={() => handleAddKRToObjective(obj.id)}>Save KR</button>
                            </div>
                          </div>
                        )}

                        {krs.length === 0 ? (
                          <div style={{ fontSize: 13, color: '#8993A4', fontStyle: 'italic' }}>No Key Results defined.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {krs.map((kr: any) => {
                              const isEdKR = editKR?.id === kr.id;
                              const krProg = kr.targetValue > 0 ? Math.min(100, Math.round(((kr.currentValue - kr.initialValue) / (kr.targetValue - kr.initialValue)) * 100)) : 0;
                              const hcColor = krProg >= 70 ? '#36B37E' : (krProg >= 40 ? '#FFAB00' : '#FF5630');

                              if (isEdKR && editKR) return (
                                <div key={kr.id} style={{ background: '#FAFBFC', padding: 16, border: '1px solid #DFE1E6', borderRadius: 8 }}>
                                  <input className="ginput" style={{ marginBottom: 10 }} value={editKR.title} onChange={e => setEditKR(prev => prev ? { ...prev, title: e.target.value } : null)} />
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                                    <input type="number" className="ginput" value={editKR.currentValue} onChange={e => setEditKR(prev => prev ? { ...prev, currentValue: parseFloat(e.target.value) || 0 } : null)} />
                                    <input type="number" className="ginput" value={editKR.targetValue} onChange={e => setEditKR(prev => prev ? { ...prev, targetValue: parseFloat(e.target.value) || 0 } : null)} />
                                    <select className="gselect" value={editKR.unit} onChange={e => setEditKR(prev => prev ? { ...prev, unit: e.target.value } : null)}>
                                      <option value="NUMBER">Num</option><option value="PERCENTAGE">%</option><option value="BOOLEAN">Bool</option><option value="CURRENCY">$</option>
                                    </select>
                                  </div>
                                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button className="gb-ghost" onClick={() => setEditKR(null)}>Cancel</button>
                                    <button className="gb-primary" onClick={saveKR}>Save KR</button>
                                  </div>
                                </div>
                              );

                              return (
                                <div key={kr.id} style={{ padding: 16, border: '1px solid #DFE1E6', borderRadius: 8 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#172B4D', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setEditKR({ id: kr.id, title: kr.title, currentValue: kr.currentValue, targetValue: kr.targetValue, unit: kr.unit })}>
                                      {kr.title} <Edit2 size={12} color="#0052CC" />
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: hcColor }}>{krProg}%</span>
                                      {canDelete && <button className="dp-action-btn" style={{ padding: 4, color: '#FF5630', border: 'none' }} onClick={() => deleteKR(kr.id)}><Trash2 size={12} /></button>}
                                    </div>
                                  </div>
                                  <div className="g-prog" style={{ height: 6, marginBottom: 8 }}>
                                    <div className="g-prog-fill" style={{ width: `${krProg}%`, background: hcColor }} />
                                  </div>
                                  <div style={{ fontSize: 12, color: '#6B778C' }}>{kr.currentValue} / {kr.targetValue} {kr.unit}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'updates' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div className="dp-card-title" style={{ margin: 0 }}>Activity Timeline</div>
              <button className="gb-ghost" style={{ fontSize: 12, padding: '6px 12px' }}><Plus size={14} /> Add Update</button>
            </div>
            
            {goal.activities && goal.activities.length > 0 ? (
              <div style={{ paddingLeft: 10 }}>
                {goal.activities.map((act: any) => (
                  <div key={act.id} className="dp-timeline-item">
                    <div className="dp-timeline-avatar">{act.user?.name?.[0] || 'U'}</div>
                    <div className="dp-timeline-content">
                      <div className="dp-timeline-header">
                        <b>{act.user?.name || 'User'}</b>
                        <span>{format(new Date(act.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#6B778C' }}>{act.action}</div>
                      {act.comment && <div className="dp-timeline-body">{act.comment}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dp-empty">
                <Activity size={32} color="#8993A4" style={{ marginBottom: 12 }} />
                <h4>No activity yet</h4>
                <p>Your team's progress updates will appear here.</p>
                <button className="gb-ghost" style={{ fontSize: 12, padding: '6px 12px' }}><Plus size={14} /> Add Update</button>
              </div>
            )}
          </div>
        )}

        {tab === 'insights' && (
          <div>
            <div className="dp-card">
              <div className="dp-card-title"><AlertTriangle size={14} color="#172B4D" /> Executive Insight & Risks</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6B778C', marginBottom: 6 }}>Overall Health</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: healthColor, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: healthColor }} />
                    {c.healthScore >= 70 ? 'Healthy' : c.healthScore >= 40 ? 'Needs Attention' : 'At Risk'} ({c.healthScore || 0}/100)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6B778C', marginBottom: 6 }}>Execution Risk</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: riskColor, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: riskColor }} />
                    {c.riskScore > 70 ? 'High' : c.riskScore > 40 ? 'Medium' : 'Low'} ({c.riskScore || 0}% Probability)
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#42526E', background: '#F4F5F7', padding: 16, borderRadius: 8, border: '1px solid #DFE1E6', lineHeight: 1.5 }}>
                {c.riskScore > 40 ? 
                  `Progress is currently below the required pace. Increasing weekly execution by approximately ${Math.abs((c.velocityScore || 0) - 1.8).toFixed(1)}% would keep the goal on schedule.` :
                  'The goal is progressing smoothly. Current pacing indicates successful completion by the deadline.'
                }
              </div>
            </div>

            <div className="dp-card-title" style={{ marginTop: 24, marginBottom: 16 }}><Lightbulb size={14} color="#FFAB00" /> AI Recommendations</div>
            {(c.recommendations || []).length === 0 ? (
              <div className="dp-empty" style={{ padding: 24 }}>
                <Check size={24} color="#36B37E" style={{ marginBottom: 12 }} />
                <h4>No recommendations</h4>
                <p style={{ margin: 0 }}>Goal is performing well and on track.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(c.recommendations || []).map((rec: any, i: number) => {
                  const pc: Record<string, string> = { high: '#FF5630', medium: '#FFAB00', low: '#36B37E' };
                  const color = pc[rec.priority] || '#0052CC';
                  return (
                    <div key={i} style={{ padding: 16, borderRadius: 8, border: `1px solid ${color}44`, background: '#FAFBFC' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color, marginTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', lineHeight: 1.4 }}>{rec.action}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#5E6C84', marginLeft: 28, lineHeight: 1.5 }}>{rec.rationale}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
