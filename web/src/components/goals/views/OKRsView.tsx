"use client";
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Save, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props { goals: any[]; onRefresh: () => void; currentUserId?: string; }

function KRProg({ current, target, initial }: { current: number; target: number; initial: number }) {
  const r = target - initial;
  const p = r === 0 ? 0 : Math.min(100, Math.max(0, Math.round(((current - initial) / r) * 100)));
  const c = p >= 70 ? '#36B37E' : p >= 40 ? '#FFAB00' : '#FF5630';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="g-prog" style={{ flex: 1, height: 6 }}>
        <div className="g-prog-fill" style={{ width: `${p}%`, background: c }} />
      </div>
      <span style={{ fontSize: 11, color: c, fontWeight: 700, minWidth: 32 }}>{p}%</span>
    </div>
  );
}

export default function OKRsView({ goals, onRefresh, currentUserId }: Props) {
  const [openGoals, setOpenGoals] = useState<Set<string>>(new Set(goals.map((g: any) => g.id)));
  const [editingKR, setEditingKR] = useState<{ id: string; val: number } | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Adding Objective state
  const [addingObjToGoal, setAddingObjToGoal] = useState<string | null>(null);
  const [newObjTitle, setNewObjTitle] = useState('');

  // Adding KR state
  const [addingKRToObj, setAddingKRToObj] = useState<string | null>(null);
  const [newKR, setNewKR] = useState({ title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' });

  const toggleGoal = (id: string) => setOpenGoals(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const saveKRValue = async (krId: string, val: number) => {
    setSaving(true);
    try {
      await fetch(`/api/key-results/${krId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentValue: val })
      });
      toast.success('Progress updated!');
      setEditingKR(null);
      onRefresh();
    } catch {
      toast.error('Failed to update progress');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateObjective = async (goalId: string) => {
    if (!newObjTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          goalId,
          title: newObjTitle,
          status: 'ON_TRACK',
          ownerId: currentUserId
        })
      });
      if (res.ok) {
        toast.success('Objective created!');
        setNewObjTitle('');
        setAddingObjToGoal(null);
        onRefresh();
      }
    } catch {
      toast.error('Failed to create objective');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKR = async (objId: string, goalId: string) => {
    if (!newKR.title.trim() || !newKR.targetValue) return;
    setSaving(true);
    try {
      const targetVal = parseFloat(newKR.targetValue) || 0;
      const initialVal = parseFloat(newKR.initialValue) || 0;

      // Get current obj
      const goal = goals.find(g => g.id === goalId);
      const obj = goal?.objectives?.find((o: any) => o.id === objId);
      const existingKRs = obj?.keyResults || [];

      const res = await fetch(`/api/objectives/${objId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          keyResults: [
            ...existingKRs.map((k: any) => ({
              id: k.id, title: k.title, targetValue: k.targetValue, initialValue: k.initialValue, currentValue: k.currentValue, unit: k.unit
            })),
            {
              title: newKR.title,
              targetValue: targetVal,
              initialValue: initialVal,
              currentValue: initialVal,
              unit: newKR.unit
            }
          ]
        })
      });
      if (res.ok) {
        toast.success('Key result created!');
        setNewKR({ title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' });
        setAddingKRToObj(null);
        onRefresh();
      }
    } catch {
      toast.error('Failed to create key result');
    } finally {
      setSaving(false);
    }
  };

  const delKR = async (krId: string) => {
    if (!confirm('Delete this key result?')) return;
    try {
      await fetch(`/api/key-results/${krId}`, { method: 'DELETE', credentials: 'include' });
      toast.success('Key result deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete key result');
    }
  };

  const delObj = async (objId: string) => {
    if (!confirm('Delete this objective and its key results?')) return;
    try {
      await fetch(`/api/objectives/${objId}`, { method: 'DELETE', credentials: 'include' });
      toast.success('Objective deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete objective');
    }
  };

  if (!goals.length) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#42526E', fontSize: 13 }}>No OKRs to display</div>;

  return (
    <div style={{ paddingTop: 16 }}>
      {goals.map((goal: any) => {
        const isOpen = openGoals.has(goal.id);
        const objectives: any[] = goal.objectives || [];
        const prog = goal.computed?.progress ?? goal.progress ?? 0;
        const hc: Record<string, string> = { ON_TRACK: '#36B37E', AT_RISK: '#FFAB00', CRITICAL: '#FF5630', COMPLETED: '#0052CC' };

        return (
          <div key={goal.id} className="okr-card" style={{ marginBottom: 20, background: '#FFF', border: '1px solid #DFE1E6', borderRadius: 12, overflow: 'hidden' }}>
            {/* Strategic Goal Header */}
            <div className="okr-header" style={{ padding: '16px 20px', background: '#FAFBFC', borderBottom: isOpen ? '1px solid #DFE1E6' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#42526E', padding: 0 }} onClick={() => toggleGoal(goal.id)}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#172B4D' }}>{goal.title}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#E3F2FD', color: '#0052CC', fontWeight: 700 }}>
                    {objectives.length} Objectives
                  </span>
                </div>
                <div style={{ marginLeft: 26, marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="g-prog" style={{ width: 220, height: 7 }}>
                    <div className="g-prog-fill" style={{ width: `${prog}%`, background: '#0052CC' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0052CC' }}>{prog}% Overall</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {goal.owner && <span style={{ fontSize: 11, color: '#42526E' }}>Owner: <b>{goal.owner.name}</b></span>}
                <button className="gb-primary" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => setAddingObjToGoal(goal.id)}>
                  <Plus size={11} /> Add Objective
                </button>
              </div>
            </div>

            {/* Content: Objectives & Key Results */}
            {isOpen && (
              <div style={{ padding: '16px 20px' }}>
                {/* Form to add objective */}
                {addingObjToGoal === goal.id && (
                  <div style={{ background: '#F4F5F7', padding: 12, borderRadius: 8, border: '1px solid #DFE1E6', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', marginBottom: 6 }}>New Objective for Goal</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="ginput" style={{ flex: 1, fontSize: 12 }} placeholder="Objective title..." value={newObjTitle} onChange={e => setNewObjTitle(e.target.value)} autoFocus />
                      <button className="gb-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setAddingObjToGoal(null)}>Cancel</button>
                      <button className="gb-primary" style={{ padding: '4px 14px', fontSize: 12 }} onClick={() => handleCreateObjective(goal.id)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                  </div>
                )}

                {/* Objectives list */}
                {objectives.map((obj: any) => {
                  const krs: any[] = obj.keyResults || [];
                  return (
                    <div key={obj.id} style={{ marginBottom: 16, background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Target size={14} color="#0052CC" />
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#172B4D' }}>{obj.title}</span>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#0052CC', marginLeft: 6 }}>({obj.progress}%)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button className="gb-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setAddingKRToObj(obj.id)}>
                            <Plus size={10} /> Add KR
                          </button>
                          <button className="gb-ghost" style={{ padding: '3px 6px', color: '#FF5630', borderColor: 'transparent' }} onClick={() => delObj(obj.id)}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Key Results list under this Objective */}
                      <div style={{ borderTop: '1px solid #DFE1E6', paddingTop: 8 }}>
                        {krs.map((kr: any) => {
                          const isEd = editingKR?.id === kr.id;
                          const color = hc[kr.healthStatus || 'ON_TRACK'] || '#36B37E';
                          return (
                            <div key={kr.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px 80px auto', gap: 12, padding: '8px 0', borderBottom: '1px solid #F4F5F7', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 13, color: '#172B4D', fontWeight: 500 }}>{kr.title}</div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {isEd ? (
                                  <>
                                    <input type="number" className="okr-input" style={{ width: 65, padding: '3px 6px', fontSize: 12 }} value={editingKR?.val || 0} onChange={e => setEditingKR({ id: kr.id, val: parseFloat(e.target.value) || 0 })} autoFocus />
                                    <span style={{ fontSize: 11, color: '#42526E' }}>/ {kr.targetValue}</span>
                                    <button className="gb-primary" style={{ padding: '3px 6px', fontSize: 10 }} onClick={() => saveKRValue(kr.id, editingKR!.val)} disabled={saving}>
                                      <Save size={10} />
                                    </button>
                                  </>
                                ) : (
                                  <span style={{ fontSize: 12, color: '#42526E', cursor: 'pointer' }} onClick={() => setEditingKR({ id: kr.id, val: kr.currentValue })} title="Click to update progress">
                                    <b>{kr.currentValue}</b> / {kr.targetValue} {kr.unit}
                                  </span>
                                )}
                              </div>

                              <KRProg current={kr.currentValue} target={kr.targetValue} initial={kr.initialValue} />
                              <span style={{ fontSize: 11, fontWeight: 700, color }}>{(kr.healthStatus || 'ON_TRACK').replace(/_/g, ' ')}</span>
                              <button className="gb-ghost" style={{ padding: '2px 5px', borderColor: 'transparent', color: '#FF5630' }} onClick={() => delKR(kr.id)}>
                                <Trash2 size={10} />
                              </button>
                            </div>
                          );
                        })}

                        {/* Add KR form */}
                        {addingKRToObj === obj.id && (
                          <div style={{ padding: '10px 0', borderTop: '1px dashed #0052CC', marginTop: 8 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 65px 70px auto', gap: 8, alignItems: 'center' }}>
                              <input className="ginput" style={{ padding: '5px 8px', fontSize: 11 }} placeholder="KR title…" value={newKR.title} onChange={e => setNewKR(p => ({ ...p, title: e.target.value }))} />
                              <input className="ginput" style={{ padding: '5px 6px', fontSize: 11 }} type="number" placeholder="Target" value={newKR.targetValue} onChange={e => setNewKR(p => ({ ...p, targetValue: e.target.value }))} />
                              <input className="ginput" style={{ padding: '5px 6px', fontSize: 11 }} type="number" placeholder="Start" value={newKR.initialValue} onChange={e => setNewKR(p => ({ ...p, initialValue: e.target.value }))} />
                              <select className="gselect" style={{ padding: '5px 4px', fontSize: 11 }} value={newKR.unit} onChange={e => setNewKR(p => ({ ...p, unit: e.target.value }))}>
                                <option value="NUMBER">Num</option><option value="PERCENTAGE">%</option><option value="BOOLEAN">Bool</option><option value="CURRENCY">$</option>
                              </select>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="gb-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleCreateKR(obj.id, goal.id)} disabled={saving}>{saving ? '...' : 'Add'}</button>
                                <button className="gb-ghost" style={{ padding: '4px 6px', fontSize: 11 }} onClick={() => setAddingKRToObj(null)}>✕</button>
                              </div>
                            </div>
                          </div>
                        )}

                        {krs.length === 0 && !addingKRToObj && (
                          <div style={{ fontSize: 11, color: '#8993A4', fontStyle: 'italic', padding: '6px 0' }}>No Key Results defined yet. Click "Add KR" above to create key results under this objective.</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {objectives.length === 0 && !addingObjToGoal && (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#FAFBFC', border: '1px dashed #DFE1E6', borderRadius: 8, fontSize: 12, color: '#6B778C' }}>
                    No Objectives defined yet for this Strategic Goal. Click <b>"Add Objective"</b> to build your OKR hierarchy.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
