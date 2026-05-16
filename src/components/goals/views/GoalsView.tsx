"use client";
import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Props { goals: any[]; onSelectGoal: (id: string) => void; onEditGoal: (g: any) => void; selectedGoalId: string | null; onRefresh: () => void; }

function Pill({ v }: { v: number }) { const cls = v >= 70 ? 'h' : v >= 40 ? 'm' : 'l'; return <span className={`spill ${cls}`}>{v}</span>; }

function Badge({ status }: { status: string }) {
  const n = status?.replace(/_/g, ' ') || '';
  const cls = n === 'ON TRACK' ? 'on' : n === 'AT RISK' ? 'at' : n === 'COMPLETED' ? 'done' : 'off';
  const dot: Record<string,string> = { on: '#36B37E', at: '#FFAB00', off: '#FF5630', done: '#0052CC' };
  return <span className={`gbadge ${cls}`}><span style={{ width: 5, height: 5, borderRadius: '50%', background: dot[cls], display: 'inline-block' }} />{n || 'UNKNOWN'}</span>;
}

function Bar({ v }: { v: number }) {
  const c = v >= 70 ? '#36B37E' : v >= 40 ? '#FFAB00' : '#FF5630';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="g-prog" style={{ flex: 1 }}><div className="g-prog-fill" style={{ width: `${v}%`, background: c }} /></div>
      <span style={{ fontSize: 11, color: '#42526E', minWidth: 28, textAlign: 'right' }}>{v}%</span>
    </div>
  );
}

function MiniTrend({ positive }: { positive: boolean }) {
  const pts = positive ? '0,10 8,7 16,5 24,3' : '0,3 8,5 16,7 24,10';
  return <svg width={24} height={12}><polyline points={pts} fill="none" stroke={positive ? '#36B37E' : '#FF5630'} strokeWidth={1.5} strokeLinecap="round" /></svg>;
}

function AvatarColor(name = '') {
  const colors = ['#0052CC','#36B37E','#FF5630','#FFAB00','#6554C0','#00B8D9','#FF8B00'];
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function GoalsView({ goals, onSelectGoal, onEditGoal, selectedGoalId, onRefresh }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const del = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); if (!confirm('Delete this goal?')) return;
    await fetch(`/api/goals/${id}`, { method: 'DELETE', credentials: 'include' }); onRefresh();
  };

  if (!goals.length) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B778C' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
      <p style={{ fontSize: 14, color: '#42526E', fontWeight: 500 }}>No goals match your filters</p>
    </div>
  );

  return (
    <table className="goals-table">
      <thead>
        <tr>
          <th style={{ width: 28 }} /><th>Goal</th><th>Owner</th>
          <th style={{ width: 150 }}>Progress</th><th style={{ width: 80 }}>Health</th>
          <th style={{ width: 70 }}>Risk</th><th style={{ width: 90 }}>Confidence</th>
          <th style={{ width: 90 }}>Cycle</th><th style={{ width: 110 }}>Deadline</th>
          <th style={{ width: 50 }}>Trend</th><th style={{ width: 72 }} />
        </tr>
      </thead>
      <tbody>
        {goals.map((g: any) => {
          const c = g.computed || {};
          const prog = c.progress ?? g.progress ?? 0;
          const dl = g.targetDate ? differenceInDays(new Date(g.targetDate), new Date()) : null;
          const krs: any[] = c.keyResults || g.keyResults || [];
          const isExp = expanded.has(g.id);
          return (
            <>
              <tr key={g.id} className={selectedGoalId === g.id ? 'gsel' : ''} onClick={() => onSelectGoal(g.id)}>
                <td style={{ paddingLeft: 8, paddingRight: 0 }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B778C', padding: 4, display: 'flex' }} onClick={e => { e.stopPropagation(); toggle(g.id); }}>
                    {isExp ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#172B4D', fontSize: 13, marginBottom: 2 }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: '#42526E' }}>
                    {g.description ? g.description.slice(0, 52) + (g.description.length > 52 ? '…' : '') : 'Company Objective'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: AvatarColor(g.owner?.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {g.owner?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#172B4D', fontWeight: 500 }}>{g.owner?.name || 'Unassigned'}</div>
                      <div style={{ fontSize: 10, color: '#42526E' }}>{g.owner?.email?.split('@')[0] || ''}</div>
                    </div>
                  </div>
                </td>
                <td><Bar v={prog} /></td>
                <td><Pill v={c.healthScore ?? 0} /></td>
                <td><Pill v={c.riskScore ?? 0} /></td>
                <td><Pill v={c.confidenceScore ?? 0} /></td>
                <td>{g.cycle ? <span style={{ fontSize: 11, color: '#0052CC', background: 'rgba(0,82,204,.08)', padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>{g.cycle.name}</span> : <span style={{ color: '#C1C7D0', fontSize: 12 }}>—</span>}</td>
                <td>
                  {g.targetDate ? (
                    <div>
                      <div style={{ fontSize: 12, color: '#172B4D' }}>{format(new Date(g.targetDate), 'MMM d, yyyy')}</div>
                      <div style={{ fontSize: 10, color: dl !== null && dl < 0 ? '#FF5630' : dl !== null && dl <= 14 ? '#FFAB00' : '#42526E', marginTop: 1 }}>
                        {dl === null ? '' : dl < 0 ? `${Math.abs(dl)}d overdue` : `${dl}d left`}
                      </div>
                    </div>
                  ) : <span style={{ color: '#C1C7D0' }}>—</span>}
                </td>
                <td><MiniTrend positive={(c.riskScore ?? 0) < 50} /></td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="gb-ghost" style={{ padding: '4px 6px' }} onClick={() => onEditGoal(g)}><Edit2 size={11} /></button>
                    <button className="gb-ghost" style={{ padding: '4px 6px', borderColor: '#FFEBEB', color: '#FF5630' }} onClick={e => del(e, g.id)}><Trash2 size={11} /></button>
                  </div>
                </td>
              </tr>
              {isExp && krs.map((kr: any) => {
                const hc: Record<string,string> = { ON_TRACK:'#36B37E', AT_RISK:'#FFAB00', CRITICAL:'#FF5630', COMPLETED:'#0052CC' };
                const hColor = hc[kr.healthStatus] || '#6B778C';
                return (
                  <tr key={kr.id}><td colSpan={11} style={{ padding: 0 }}>
                    <div className="kr-expand">
                      <div /><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: hColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#172B4D' }}>{kr.title}</span>
                        {kr.isStagnant && <span style={{ fontSize: 9, background: 'rgba(255,171,0,.1)', color: '#974F0C', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>STAGNANT</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#172B4D' }}>{kr.currentValue} / {kr.targetValue} <span style={{ color: '#6B778C' }}>{kr.unit}</span></div>
                      <div className="g-prog"><div className="g-prog-fill" style={{ width: `${kr.progress}%`, background: hColor }} /></div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: hColor }}>{kr.progress}%</span>
                      <span style={{ fontSize: 10, color: '#42526E' }}>{(kr.healthStatus || '').replace(/_/g,' ')}</span>
                    </div>
                  </td></tr>
                );
              })}
            </>
          );
        })}
      </tbody>
    </table>
  );
}
