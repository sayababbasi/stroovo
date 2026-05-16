"use client";
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Save } from 'lucide-react';

interface Props { goals: any[]; onRefresh: () => void; currentUserId?: string; }

function KRProg({ current, target, initial }: { current: number; target: number; initial: number }) {
  const r = target - initial;
  const p = r === 0 ? 0 : Math.min(100, Math.max(0, Math.round(((current - initial) / r) * 100)));
  const c = p >= 70 ? '#34D399' : p >= 40 ? '#FBBF24' : '#F87171';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="g-prog" style={{ flex: 1 }}>
        <div className="g-prog-fill" style={{ width: `${p}%`, background: c }} />
      </div>
      <span style={{ fontSize: 11, color: c, fontWeight: 700, minWidth: 28 }}>{p}%</span>
    </div>
  );
}

export default function OKRsView({ goals, onRefresh }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set(goals.map((g: any) => g.id)));
  const [editing, setEditing] = useState<{ id: string; val: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newKR, setNewKR] = useState({ title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' });

  const toggle = (id: string) => setOpen(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const save = async (krId: string, val: number) => {
    setSaving(true);
    await fetch(`/api/key-results/${krId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ currentValue: val }) });
    setSaving(false); setEditing(null); onRefresh();
  };

  const addKR = async (goalId: string) => {
    if (!newKR.title || !newKR.targetValue) return;
    setSaving(true);
    await fetch(`/api/goals/${goalId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ keyResults: [{ title: newKR.title, targetValue: parseFloat(newKR.targetValue) || 0, initialValue: parseFloat(newKR.initialValue) || 0, unit: newKR.unit, currentValue: 0 }] }) });
    setSaving(false); setAddingTo(null); setNewKR({ title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' }); onRefresh();
  };

  const delKR = async (krId: string) => {
    if (!confirm('Delete this key result?')) return;
    await fetch(`/api/key-results/${krId}`, { method: 'DELETE', credentials: 'include' }); onRefresh();
  };

  if (!goals.length) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#42526E', fontSize: 13 }}>No OKRs to display</div>;

  return (
    <div style={{ paddingTop: 16 }}>
      {goals.map((goal: any) => {
        const isOpen = open.has(goal.id);
        const krs: any[] = goal.computed?.keyResults || goal.keyResults || [];
        const prog = goal.computed?.progress ?? goal.progress ?? 0;
        const hc: Record<string,string> = { ON_TRACK:'#36B37E', AT_RISK:'#FFAB00', CRITICAL:'#FF5630', COMPLETED:'#0052CC' };

        return (
          <div key={goal.id} className="okr-card">
            <div className="okr-header">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#42526E', padding: 0 }} onClick={() => toggle(goal.id)}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#172B4D' }}>{goal.title}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#DFE1E6', color: '#0052CC', fontWeight: 700 }}>{krs.length} KRs</span>
                </div>
                <div style={{ marginLeft: 24, marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="g-prog" style={{ width: 180 }}><div className="g-prog-fill" style={{ width: `${prog}%`, background: 'linear-gradient(90deg,#0052CC,#0065FF)' }} /></div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0052CC' }}>{prog}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {goal.owner && <span style={{ fontSize: 11, color: '#42526E' }}>{goal.owner.name}</span>}
                {goal.cycle && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: 'rgba(54,179,126,.1)', color: '#36B37E', fontWeight: 600 }}>{goal.cycle.name}</span>}
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: '0 18px 14px' }}>
                {/* KR Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 110px 90px auto', gap: 12, padding: '8px 0 4px', borderBottom: '1px solid #DFE1E6', marginBottom: 4 }}>
                  {['Key Result', 'Current / Target', 'Progress', 'Status', ''].map((h, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 600, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
                  ))}
                </div>

                {krs.map((kr: any) => {
                  const isEd = editing?.id === kr.id;
                  const color = hc[kr.healthStatus || 'AT_RISK'] || '#64748B';
                  return (
                    <div key={kr.id} className="okr-kr-row">
                      <div>
                        <div style={{ fontSize: 13, color: '#172B4D', fontWeight: 500 }}>{kr.title}</div>
                        {kr.isStagnant && <span style={{ fontSize: 9, background: 'rgba(255,171,0,.1)', color: '#FFAB00', padding: '1px 5px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>STAGNANT · {kr.daysSinceUpdate}d</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isEd ? (
                          <>
                            <input type="number" className="okr-input" value={editing?.val || 0} onChange={e => setEditing({ id: kr.id, val: parseFloat(e.target.value) || 0 })} autoFocus />
                            <span style={{ fontSize: 11, color: '#42526E' }}>/ {kr.targetValue}</span>
                            <button className="gb-primary" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => save(kr.id, editing!.val)} disabled={saving}>
                              <Save size={10} /> {saving ? '…' : '✓'}
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 13, color: '#42526E', cursor: 'pointer' }} onClick={() => setEditing({ id: kr.id, val: kr.currentValue })} title="Click to update">
                            {kr.currentValue} / {kr.targetValue} <span style={{ fontSize: 10, color: '#42526E' }}>{kr.unit}</span>
                          </span>
                        )}
                      </div>
                      <KRProg current={kr.currentValue} target={kr.targetValue} initial={kr.initialValue} />
                      <span style={{ fontSize: 11, fontWeight: 600, color }}>{(kr.healthStatus || 'AT_RISK').replace(/_/g,' ')}</span>
                      <button className="gb-ghost" style={{ padding: '3px 6px', borderColor: '#FFEBEB', color: '#FF5630' }} onClick={() => delKR(kr.id)}><Trash2 size={10} /></button>
                    </div>
                  );
                })}

                {/* Add KR */}
                {addingTo === goal.id ? (
                  <div style={{ padding: '10px 0', borderTop: '1px dashed #DFE1E6', marginTop: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px 72px 72px auto', gap: 8, alignItems: 'center' }}>
                      <input className="ginput" placeholder="Key Result title…" value={newKR.title} onChange={e => setNewKR(p => ({ ...p, title: e.target.value }))} />
                      <input className="ginput" type="number" placeholder="Target" value={newKR.targetValue} onChange={e => setNewKR(p => ({ ...p, targetValue: e.target.value }))} />
                      <input className="ginput" type="number" placeholder="Start" value={newKR.initialValue} onChange={e => setNewKR(p => ({ ...p, initialValue: e.target.value }))} />
                      <select className="gselect" value={newKR.unit} onChange={e => setNewKR(p => ({ ...p, unit: e.target.value }))}>
                        <option value="NUMBER">Num</option><option value="PERCENTAGE">%</option><option value="BOOLEAN">Bool</option><option value="CURRENCY">$</option>
                      </select>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="gb-primary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => addKR(goal.id)} disabled={saving}>{saving ? '…' : 'Add'}</button>
                        <button className="gb-ghost" style={{ padding: '5px 8px' }} onClick={() => setAddingTo(null)}>✕</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button className="gb-ghost" style={{ marginTop: 10, fontSize: 12, padding: '5px 10px' }} onClick={() => setAddingTo(goal.id)}>
                    <Plus size={12} /> Add Key Result
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
