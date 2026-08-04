"use client";

import { useState } from 'react';
import { X, Edit2, AlertTriangle, Lightbulb, TrendingUp, Plus, Trash2, Check, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Props { goal: any; onClose: () => void; onRefresh: () => void; onEdit: (g: any) => void; }

function RiskDonut({ value, color }: { value: number; color: string }) {
  const r = 34; const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={80} height={80}>
      <circle cx={40} cy={40} r={r} fill="none" stroke="#DFE1E6" strokeWidth={7} />
      <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 40 40)" />
      <text x={40} y={44} textAnchor="middle" fill={color} fontSize={14} fontWeight={800}>{value}%</text>
    </svg>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#172B4D' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
      </div>
      <div className="g-prog" style={{ height: 4 }}>
        <div className="g-prog-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function GoalDetailPanel({ goal, onClose, onRefresh, onEdit }: Props) {
  const [tab, setTab] = useState<'overview' | 'objectives' | 'insights'>('overview');
  
  // State for creating new objective
  const [isAddingObj, setIsAddingObj] = useState(false);
  const [newObj, setNewObj] = useState({ title: '', description: '', status: 'ON_TRACK', targetDate: '' });
  
  // State for editing objective
  const [editingObj, setEditingObj] = useState<{ id: string; title: string; description: string; status: string } | null>(null);

  // State for adding KR under an objective
  const [addingKRForObj, setAddingKRForObj] = useState<string | null>(null);
  const [newKRData, setNewKRData] = useState({ title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' });

  // State for editing KR
  const [editKR, setEditKR] = useState<{ id: string; title: string; currentValue: number; targetValue: number; unit: string } | null>(null);

  // State for collapsed objectives
  const [expandedObjs, setExpandedObjs] = useState<Set<string>>(new Set((goal.objectives || []).map((o: any) => o.id)));

  const toggleObj = (id: string) => {
    setExpandedObjs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const c = goal.computed || {};
  const objectives: any[] = goal.objectives || [];
  const directKRs: any[] = c.keyResults || goal.keyResults || [];
  
  const riskColor = (c.riskScore ?? 0) > 70 ? '#FF5630' : (c.riskScore ?? 0) > 40 ? '#FFAB00' : '#36B37E';
  const healthColor = (c.healthScore ?? 0) >= 70 ? '#36B37E' : (c.healthScore ?? 0) >= 40 ? '#FFAB00' : '#FF5630';

  const handleCreateObjective = async () => {
    if (!newObj.title.trim()) return;
    try {
      const res = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          goalId: goal.id,
          title: newObj.title,
          description: newObj.description,
          status: newObj.status,
          targetDate: newObj.targetDate || null,
          ownerId: goal.ownerId
        })
      });
      if (res.ok) {
        toast.success('Objective created!');
        setIsAddingObj(false);
        setNewObj({ title: '', description: '', status: 'ON_TRACK', targetDate: '' });
        onRefresh();
      }
    } catch {
      toast.error('Failed to create objective');
    }
  };

  const handleSaveObjective = async () => {
    if (!editingObj) return;
    try {
      const res = await fetch(`/api/objectives/${editingObj.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editingObj.title,
          description: editingObj.description,
          status: editingObj.status
        })
      });
      if (res.ok) {
        toast.success('Objective updated!');
        setEditingObj(null);
        onRefresh();
      }
    } catch {
      toast.error('Failed to update objective');
    }
  };

  const handleDeleteObjective = async (objId: string) => {
    if (!confirm('Are you sure you want to delete this objective and its key results?')) return;
    try {
      const res = await fetch(`/api/objectives/${objId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Objective deleted');
        onRefresh();
      }
    } catch {
      toast.error('Failed to delete objective');
    }
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
            {
              title: newKRData.title,
              targetValue: targetVal,
              initialValue: initialVal,
              currentValue: initialVal,
              unit: newKRData.unit
            }
          ]
        })
      });
      if (res.ok) {
        toast.success('Key result added!');
        setAddingKRForObj(null);
        setNewKRData({ title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' });
        onRefresh();
      }
    } catch {
      toast.error('Failed to add key result');
    }
  };

  const saveKR = async () => {
    if (!editKR) return;
    try {
      const res = await fetch(`/api/key-results/${editKR.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editKR.title,
          currentValue: editKR.currentValue,
          targetValue: editKR.targetValue,
          unit: editKR.unit,
        })
      });
      if (res.ok) {
        toast.success('Key result updated!');
        setEditKR(null);
        onRefresh();
      }
    } catch {
      toast.error('Failed to update key result');
    }
  };

  const deleteKR = async (krId: string) => {
    if (!confirm('Delete this key result?')) return;
    try {
      const res = await fetch(`/api/key-results/${krId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Key result deleted');
        onRefresh();
      }
    } catch {
      toast.error('Failed to delete key result');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'objectives', label: `Objectives (${objectives.length})` },
    { id: 'insights', label: 'Insights' },
  ] as const;

  return (
    <div className="dpanel">
      {/* Header */}
      <div className="dpanel-sec" style={{ background: '#FAFBFC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#42526E', marginBottom: 4 }}>
              {goal.cycle?.name || 'Company Strategic Goal'}
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#172B4D', lineHeight: 1.4 }}>{goal.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
            <button className="gb-ghost" style={{ padding: '4px 8px' }} onClick={() => onEdit(goal)}><Edit2 size={12} /></button>
            <button className="gb-ghost" style={{ padding: '4px 8px' }} onClick={onClose}><X size={12} /></button>
          </div>
        </div>

        {/* Status */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 8, background: (c.riskScore ?? 0) > 70 ? '#2D0D0D' : (c.riskScore ?? 0) > 40 ? '#2B2006' : '#0D2B1F', marginBottom: 12 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: riskColor }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: riskColor }}>{(c.riskScore ?? 0) > 70 ? 'High Risk' : (c.riskScore ?? 0) > 40 ? 'At Risk' : 'On Track'}</span>
        </div>

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em' }}>Owner</div>
            <div style={{ fontSize: 12, color: '#172B4D', marginTop: 2, fontWeight: 500 }}>{goal.owner?.name || 'Unassigned'}</div>
          </div>
          {goal.targetDate && (
            <div>
              <div style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em' }}>Timeline</div>
              <div style={{ fontSize: 12, color: c.daysRemaining < 0 ? '#FF5630' : '#42526E', marginTop: 2, fontWeight: 500 }}>
                {format(new Date(goal.targetDate), 'MMM d, yyyy')}
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Overall Progress</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#0052CC' }}>{c.progress ?? goal.progress ?? 0}%</span>
        </div>
        <div className="g-prog" style={{ height: 7, marginBottom: 6 }}>
          <div className="g-prog-fill" style={{ width: `${c.progress ?? goal.progress ?? 0}%`, background: 'linear-gradient(90deg,#0052CC,#0052CC)' }} />
        </div>
        {goal.description && <p style={{ fontSize: 11, color: '#42526E', marginTop: 10, lineHeight: 1.6 }}>{goal.description}</p>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6', background: 'white' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            flex: 1, padding: '10px 4px', background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid #0052CC' : '2px solid transparent',
            color: tab === t.id ? '#0052CC' : '#6B778C', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', transition: 'color .15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <>
          {/* Intelligence scores */}
          <div className="dpanel-sec">
            <div className="dp-label"><TrendingUp size={10} /> Intelligence Scores</div>
            <ScoreBar label="Health Score" value={c.healthScore ?? 0} color={healthColor} />
            <ScoreBar label="Confidence Score" value={c.confidenceScore ?? 0} color="#0052CC" />
            <div style={{ marginTop: 4, padding: '8px 10px', borderRadius: 8, background: '#F8F9FA', border: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#172B4D' }}>Delay Probability</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: riskColor }}>{c.delayProbability ?? 0}%</span>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="dpanel-sec">
            <div className="dp-label"><AlertTriangle size={10} color="#172B4D" /> Risk Analysis</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
              <RiskDonut value={c.riskScore ?? 0} color={riskColor} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: riskColor, marginBottom: 4 }}>
                  {(c.riskScore ?? 0) > 70 ? '🔴 High Risk' : (c.riskScore ?? 0) > 40 ? '🟡 Medium Risk' : '🟢 Low Risk'}
                </div>
                <div style={{ fontSize: 11, color: '#172B4D' }}>Delay Probability</div>
                <div style={{ fontSize: 11, color: '#42526E', marginTop: 2 }}>{objectives.length} Objectives configured</div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="dpanel-sec">
            <div className="dp-label">Performance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Velocity', val: `${(c.velocityScore ?? 0).toFixed(2)}%/d`, color: '#36B37E' },
                { label: 'Expected at Deadline', val: `${c.expectedCompletion ?? 0}%`, color: (c.expectedCompletion ?? 0) >= 100 ? '#36B37E' : '#FF5630' },
                { label: 'Days Remaining', val: c.daysRemaining ?? '—', color: (c.daysRemaining ?? 0) < 0 ? '#FF5630' : '#42526E' },
                { label: 'Objectives', val: objectives.length, color: '#0052CC' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: '#F8F9FA', padding: '10px', borderRadius: 8, border: '1px solid #DFE1E6' }}>
                  <div style={{ fontSize: 10, color: '#42526E', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── OBJECTIVES TAB (Goal -> Objectives -> Key Results) ── */}
      {tab === 'objectives' && (
        <div className="dpanel-sec">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="dp-label" style={{ marginBottom: 0 }}>
              <Target size={12} color="#0052CC" /> OKR Objectives ({objectives.length})
            </div>
            <button className="gb-primary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setIsAddingObj(true)}>
              <Plus size={12} /> Add Objective
            </button>
          </div>

          {/* Form to add objective */}
          {isAddingObj && (
            <div style={{ background: '#F4F5F7', padding: 12, borderRadius: 8, border: '1px solid #DFE1E6', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', marginBottom: 8 }}>New Objective</div>
              <input className="ginput" style={{ marginBottom: 8, fontSize: 12 }} placeholder="Objective title..." value={newObj.title} onChange={e => setNewObj(p => ({ ...p, title: e.target.value }))} autoFocus />
              <textarea className="gtextarea" style={{ marginBottom: 8, fontSize: 12 }} placeholder="Description (optional)..." rows={2} value={newObj.description} onChange={e => setNewObj(p => ({ ...p, description: e.target.value }))} />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button className="gb-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setIsAddingObj(false)}>Cancel</button>
                <button className="gb-primary" style={{ padding: '4px 12px', fontSize: 11 }} onClick={handleCreateObjective}>Save Objective</button>
              </div>
            </div>
          )}

          {/* Objectives List */}
          {objectives.map((obj: any) => {
            const isExpanded = expandedObjs.has(obj.id);
            const krs: any[] = obj.keyResults || [];
            const isEdObj = editingObj?.id === obj.id;

            return (
              <div key={obj.id} style={{ marginBottom: 14, background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: 8, overflow: 'hidden' }}>
                {/* Objective Header */}
                {isEdObj && editingObj ? (
                  <div style={{ padding: 12, background: '#FFF' }}>
                    <input className="ginput" style={{ marginBottom: 6, fontSize: 12 }} value={editingObj.title} onChange={e => setEditingObj(prev => prev ? { ...prev, title: e.target.value } : null)} />
                    <textarea className="gtextarea" style={{ marginBottom: 6, fontSize: 12 }} rows={2} value={editingObj.description} onChange={e => setEditingObj(prev => prev ? { ...prev, description: e.target.value } : null)} />
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="gb-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setEditingObj(null)}>Cancel</button>
                      <button className="gb-primary" style={{ padding: '3px 10px', fontSize: 11 }} onClick={handleSaveObjective}>Save</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '10px 12px', background: '#F4F5F7', borderBottom: isExpanded ? '1px solid #DFE1E6' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flex: 1 }} onClick={() => toggleObj(obj.id)}>
                        {isExpanded ? <ChevronDown size={14} color="#6B778C" /> : <ChevronRight size={14} color="#6B778C" />}
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>{obj.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#0052CC' }}>{obj.progress}%</span>
                        <button className="gb-ghost" style={{ padding: '2px 5px' }} onClick={() => setEditingObj({ id: obj.id, title: obj.title, description: obj.description || '', status: obj.status })}><Edit2 size={10} /></button>
                        <button className="gb-ghost" style={{ padding: '2px 5px', color: '#FF5630' }} onClick={() => handleDeleteObjective(obj.id)}><Trash2 size={10} /></button>
                      </div>
                    </div>
                    {obj.description && <p style={{ fontSize: 11, color: '#6B778C', margin: '4px 0 0 20px' }}>{obj.description}</p>}
                    <div className="g-prog" style={{ height: 4, marginTop: 8, marginLeft: 20 }}>
                      <div className="g-prog-fill" style={{ width: `${obj.progress}%`, background: '#0052CC' }} />
                    </div>
                  </div>
                )}

                {/* Key Results list under this Objective */}
                {isExpanded && (
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Key Results ({krs.length})
                      </span>
                      <button className="gb-ghost" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => setAddingKRForObj(obj.id)}>
                        <Plus size={10} /> Add KR
                      </button>
                    </div>

                    {/* Add KR form */}
                    {addingKRForObj === obj.id && (
                      <div style={{ background: '#FFF', padding: 8, border: '1px dashed #0052CC', borderRadius: 6, marginBottom: 8 }}>
                        <input className="ginput" style={{ padding: '4px 8px', fontSize: 11, marginBottom: 6 }} placeholder="KR title..." value={newKRData.title} onChange={e => setNewKRData(p => ({ ...p, title: e.target.value }))} autoFocus />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 6 }}>
                          <input className="ginput" type="number" style={{ padding: '4px 6px', fontSize: 11 }} placeholder="Target" value={newKRData.targetValue} onChange={e => setNewKRData(p => ({ ...p, targetValue: e.target.value }))} />
                          <input className="ginput" type="number" style={{ padding: '4px 6px', fontSize: 11 }} placeholder="Start" value={newKRData.initialValue} onChange={e => setNewKRData(p => ({ ...p, initialValue: e.target.value }))} />
                          <select className="gselect" style={{ padding: '4px 4px', fontSize: 11 }} value={newKRData.unit} onChange={e => setNewKRData(p => ({ ...p, unit: e.target.value }))}>
                            <option value="NUMBER">Num</option><option value="PERCENTAGE">%</option><option value="BOOLEAN">Bool</option><option value="CURRENCY">$</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="gb-ghost" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => setAddingKRForObj(null)}>Cancel</button>
                          <button className="gb-primary" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => handleAddKRToObjective(obj.id)}>Save KR</button>
                        </div>
                      </div>
                    )}

                    {krs.length === 0 ? (
                      <div style={{ fontSize: 11, color: '#8993A4', fontStyle: 'italic', padding: '4px 0' }}>No Key Results defined for this objective.</div>
                    ) : (
                      krs.map((kr: any) => {
                        const isEdKR = editKR?.id === kr.id;
                        const krProg = kr.targetValue > 0 ? Math.min(100, Math.round(((kr.currentValue - kr.initialValue) / (kr.targetValue - kr.initialValue)) * 100)) : 0;
                        const hcColor = krProg >= 70 ? '#36B37E' : (krProg >= 40 ? '#FFAB00' : '#FF5630');

                        return (
                          <div key={kr.id} style={{ padding: '8px 10px', background: '#FFF', border: '1px solid #DFE1E6', borderRadius: 6, marginBottom: 6 }}>
                            {isEdKR && editKR ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <input className="ginput" style={{ padding: '4px 6px', fontSize: 11 }} value={editKR.title} onChange={e => setEditKR(prev => prev ? { ...prev, title: e.target.value } : null)} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                                  <input type="number" className="ginput" style={{ padding: '4px 6px', fontSize: 11 }} value={editKR.currentValue} onChange={e => setEditKR(prev => prev ? { ...prev, currentValue: parseFloat(e.target.value) || 0 } : null)} />
                                  <input type="number" className="ginput" style={{ padding: '4px 6px', fontSize: 11 }} value={editKR.targetValue} onChange={e => setEditKR(prev => prev ? { ...prev, targetValue: parseFloat(e.target.value) || 0 } : null)} />
                                  <select className="gselect" style={{ padding: '4px 4px', fontSize: 11 }} value={editKR.unit} onChange={e => setEditKR(prev => prev ? { ...prev, unit: e.target.value } : null)}>
                                    <option value="NUMBER">Num</option><option value="PERCENTAGE">%</option><option value="BOOLEAN">Bool</option><option value="CURRENCY">$</option>
                                  </select>
                                </div>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  <button className="gb-ghost" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => setEditKR(null)}>Cancel</button>
                                  <button className="gb-primary" style={{ padding: '2px 8px', fontSize: 10 }} onClick={saveKR}>Save</button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D', cursor: 'pointer' }} onClick={() => setEditKR({ id: kr.id, title: kr.title, currentValue: kr.currentValue, targetValue: kr.targetValue, unit: kr.unit })}>
                                    {kr.title} <Edit2 size={9} style={{ display: 'inline', marginLeft: 3, color: '#0052CC' }} />
                                  </span>
                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: hcColor }}>{krProg}%</span>
                                    <button className="gb-ghost" style={{ padding: '1px 4px', color: '#FF5630', borderColor: 'transparent' }} onClick={() => deleteKR(kr.id)}><Trash2 size={9} /></button>
                                  </div>
                                </div>
                                <div className="g-prog" style={{ height: 4, marginBottom: 4 }}>
                                  <div className="g-prog-fill" style={{ width: `${krProg}%`, background: hcColor }} />
                                </div>
                                <span style={{ fontSize: 10, color: '#6B778C' }}>{kr.currentValue} / {kr.targetValue} {kr.unit}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {objectives.length === 0 && !isAddingObj && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6B778C', background: '#FAFBFC', border: '1px dashed #DFE1E6', borderRadius: 8, fontSize: 12 }}>
              No Objectives created for this Goal yet. Click <b>"Add Objective"</b> above to define structured OKR Objectives and Key Results.
            </div>
          )}
        </div>
      )}

      {/* ── INSIGHTS TAB ── */}
      {tab === 'insights' && (
        <div className="dpanel-sec">
          <div className="dp-label"><Lightbulb size={10} color="#FFAB00" /> AI Recommendations</div>
          {(c.recommendations || []).length === 0 && (
            <p style={{ fontSize: 12, color: '#42526E' }}>No recommendations — goal is performing well.</p>
          )}
          {(c.recommendations || []).map((rec: any, i: number) => {
            const pc: Record<string, string> = { high: '#FF5630', medium: '#FFAB00', low: '#36B37E' };
            const color = pc[rec.priority] || '#42526E';
            return (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 8, border: `1px solid ${color}22`, background: '#FAFBFC' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D', lineHeight: 1.4 }}>{rec.action}</span>
                </div>
                <span style={{ fontSize: 11, color: '#172B4D' }}>{rec.rationale}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
