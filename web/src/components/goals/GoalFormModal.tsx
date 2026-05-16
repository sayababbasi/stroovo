"use client";
import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Props { editingGoal: any | null; onClose: () => void; onSuccess: () => void; currentUserId: string; }

export default function GoalFormModal({ editingGoal, onClose, onSuccess, currentUserId }: Props) {
  const [form, setForm] = useState({ title: '', description: '', status: 'ON_TRACK', targetDate: '', cycleId: '' });
  const [krs, setKRs] = useState<{ title: string; targetValue: string; initialValue: string; unit: string }[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/cycles', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(d => setCycles(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (editingGoal) {
      setForm({ title: editingGoal.title || '', description: editingGoal.description || '', status: editingGoal.status || 'ON_TRACK', targetDate: editingGoal.targetDate ? editingGoal.targetDate.split('T')[0] : '', cycleId: editingGoal.cycleId || '' });
      setKRs((editingGoal.keyResults || []).map((kr: any) => ({ title: kr.title, targetValue: String(kr.targetValue), initialValue: String(kr.initialValue || 0), unit: kr.unit || 'NUMBER' })));
    }
  }, [editingGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Goal title is required'); return; }
    setSaving(true); setError('');
    const payload: any = {
      title: form.title, description: form.description, status: form.status,
      targetDate: form.targetDate || null, cycleId: form.cycleId || null, ownerId: currentUserId,
      keyResults: krs.filter(kr => kr.title && kr.targetValue).map(kr => ({
        title: kr.title, targetValue: parseFloat(kr.targetValue) || 0,
        initialValue: parseFloat(kr.initialValue) || 0, unit: kr.unit, currentValue: 0,
      })),
    };
    try {
      const url = editingGoal ? `/api/goals/${editingGoal.id}` : '/api/goals';
      const res = await fetch(url, { method: editingGoal ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to save goal'); }
      else { window.dispatchEvent(new Event('goalsUpdated')); onSuccess(); }
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="gm-overlay" onClick={onClose}>
      <div className="gm-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#172B4D' }}>{editingGoal ? 'Edit Strategic Goal' : 'Create Strategic Goal'}</h2>
            <p style={{ fontSize: 12, color: '#42526E', marginTop: 2 }}>Define outcomes and key results</p>
          </div>
          <button className="gb-ghost" style={{ padding: '6px 8px' }} onClick={onClose}><X size={14} /></button>
        </div>

        {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#BF2600' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="gm-field">
            <label>Goal Title *</label>
            <input className="ginput" placeholder="e.g. Increase Revenue to $50M" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="gm-field">
            <label>Description</label>
            <textarea className="gtextarea" placeholder="Context and success definition…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="gm-field" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select className="gselect" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="ON_TRACK">On Track</option><option value="AT_RISK">At Risk</option>
                <option value="OFF_TRACK">Off Track</option><option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="gm-field" style={{ marginBottom: 0 }}>
              <label>Deadline</label>
              <input type="date" className="ginput" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} />
            </div>
            <div className="gm-field" style={{ marginBottom: 0 }}>
              <label>Cycle</label>
              <select className="gselect" value={form.cycleId} onChange={e => setForm(p => ({ ...p, cycleId: e.target.value }))}>
                <option value="">No Cycle</option>
                {cycles.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Key Results */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em' }}>Key Results ({krs.length})</label>
              <button type="button" className="gb-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setKRs(p => [...p, { title: '', targetValue: '', initialValue: '0', unit: 'NUMBER' }])}>
                <Plus size={11} /> Add KR
              </button>
            </div>
            {krs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px', background: '#FAFBFC', borderRadius: 8, border: '1px dashed #DFE1E6', fontSize: 12, color: '#42526E' }}>
                Add Key Results to make this goal measurable
              </div>
            )}
            {krs.map((kr, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 68px 70px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input className="ginput" style={{ padding: '7px 10px' }} placeholder="KR title…" value={kr.title} onChange={e => setKRs(p => p.map((k, idx) => idx === i ? { ...k, title: e.target.value } : k))} />
                <input className="ginput" style={{ padding: '7px 10px' }} type="number" placeholder="Target" value={kr.targetValue} onChange={e => setKRs(p => p.map((k, idx) => idx === i ? { ...k, targetValue: e.target.value } : k))} />
                <input className="ginput" style={{ padding: '7px 10px' }} type="number" placeholder="Start" value={kr.initialValue} onChange={e => setKRs(p => p.map((k, idx) => idx === i ? { ...k, initialValue: e.target.value } : k))} />
                <select className="gselect" style={{ padding: '7px 6px', fontSize: 11 }} value={kr.unit} onChange={e => setKRs(p => p.map((k, idx) => idx === i ? { ...k, unit: e.target.value } : k))}>
                  <option value="NUMBER">Num</option><option value="PERCENTAGE">%</option><option value="BOOLEAN">Bool</option><option value="CURRENCY">$</option>
                </select>
                <button type="button" className="gb-ghost" style={{ padding: '6px 8px', borderColor: '#FFEBEB', color: '#FF5630' }} onClick={() => setKRs(p => p.filter((_, idx) => idx !== i))}>
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button type="button" className="gb-ghost" style={{ flex: 1, justifyContent: 'center', padding: '10px' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="gb-primary" style={{ flex: 2, justifyContent: 'center', padding: '10px' }} disabled={saving}>
              {saving ? 'Saving…' : editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
