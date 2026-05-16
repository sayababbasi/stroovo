"use client";
import { useState } from 'react';
import { X, Edit2, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

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
  const [tab, setTab] = useState<'overview' | 'keyresults' | 'insights'>('overview');
  const [updatingKR, setUpdatingKR] = useState<string | null>(null);
  const [krVals, setKRVals] = useState<Record<string, number>>({});

  const c = goal.computed || {};
  const krs: any[] = c.keyResults || goal.keyResults || [];
  const riskColor = (c.riskScore ?? 0) > 70 ? '#FF5630' : (c.riskScore ?? 0) > 40 ? '#FFAB00' : '#36B37E';
  const healthColor = (c.healthScore ?? 0) >= 70 ? '#36B37E' : (c.healthScore ?? 0) >= 40 ? '#FFAB00' : '#FF5630';

  const saveKR = async (krId: string) => {
    const val = krVals[krId];
    if (val === undefined) return;
    await fetch(`/api/key-results/${krId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ currentValue: val }),
    });
    setUpdatingKR(null); onRefresh();
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'keyresults', label: 'Key Results' },
    { id: 'insights', label: 'Insights' },
  ] as const;

  return (
    <div className="dpanel">
      {/* Header */}
      <div className="dpanel-sec" style={{ background: '#FAFBFC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#42526E', marginBottom: 4 }}>
              {goal.cycle?.name || 'Company Objective'}
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
        <div style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Progress</div>
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
                <div style={{ fontSize: 11, color: '#42526E', marginTop: 2 }}>{krs.filter((k: any) => k.isStagnant).length} KR behind schedule</div>
              </div>
            </div>
            {(c.riskFactors || []).map((rf: any, i: number) => {
              const sc: Record<string,string> = { critical:'#FF5630', high:'#FB923C', medium:'#FFAB00', low:'#36B37E' };
              return (
                <div key={i} style={{ padding: '8px 10px', background: '#F8F9FA', borderRadius: 8, border: '1px solid #DFE1E6', marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>{rf.factor}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: sc[rf.severity] }}>+{rf.impact}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#42526E' }}>{rf.description}</span>
                </div>
              );
            })}
          </div>

          {/* Performance */}
          <div className="dpanel-sec">
            <div className="dp-label">Performance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Velocity', val: `${(c.velocityScore ?? 0).toFixed(2)}%/d`, color: '#36B37E' },
                { label: 'Expected at Deadline', val: `${c.expectedCompletion ?? 0}%`, color: (c.expectedCompletion ?? 0) >= 100 ? '#36B37E' : '#FF5630' },
                { label: 'Days Remaining', val: c.daysRemaining ?? '—', color: (c.daysRemaining ?? 0) < 0 ? '#FF5630' : '#42526E' },
                { label: 'KR Count', val: krs.length, color: '#0052CC' },
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

      {/* ── KEY RESULTS TAB ── */}
      {tab === 'keyresults' && (
        <div className="dpanel-sec">
          <div className="dp-label">Key Results ({krs.length})</div>
          {krs.map((kr: any) => {
            const hc: Record<string,string> = { ON_TRACK:'#36B37E', AT_RISK:'#FFAB00', CRITICAL:'#FF5630', COMPLETED:'#0052CC' };
            const hColor = hc[kr.healthStatus] || '#42526E';
            const isEd = updatingKR === kr.id;
            return (
              <div key={kr.id} style={{ marginBottom: 10, padding: 12, background: '#F8F9FA', borderRadius: 8, border: `1px solid ${kr.isStagnant ? '#FFAB00' : '#DFE1E6'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#172B4D', fontWeight: 500, flex: 1 }}>{kr.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: hColor, marginLeft: 6, flexShrink: 0 }}>{(kr.healthStatus || '').replace(/_/g,' ')}</span>
                </div>
                <div className="g-prog" style={{ marginBottom: 6 }}>
                  <div className="g-prog-fill" style={{ width: `${kr.progress}%`, background: hColor }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {isEd ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="number" className="okr-input" value={krVals[kr.id] ?? kr.currentValue}
                        onChange={e => setKRVals(p => ({ ...p, [kr.id]: parseFloat(e.target.value) || 0 }))} autoFocus />
                      <span style={{ fontSize: 11, color: '#42526E' }}>/ {kr.targetValue}</span>
                      <button className="gb-primary" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => saveKR(kr.id)}>✓</button>
                      <button className="gb-ghost" style={{ padding: '3px 6px', fontSize: 11 }} onClick={() => setUpdatingKR(null)}>✕</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: '#42526E', cursor: 'pointer' }}
                      onClick={() => { setUpdatingKR(kr.id); setKRVals(p => ({ ...p, [kr.id]: kr.currentValue })); }}
                      title="Click to update">
                      {kr.currentValue} / {kr.targetValue} {kr.unit}
                    </span>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, color: hColor }}>{kr.progress}%</span>
                </div>
                {kr.isStagnant && <div style={{ fontSize: 10, color: '#172B4D', marginTop: 4 }}>⚠ No updates in {kr.daysSinceUpdate} days</div>}
              </div>
            );
          })}
          {krs.length === 0 && <p style={{ fontSize: 12, color: '#42526E' }}>No key results defined</p>}
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
            const pc: Record<string,string> = { high:'#FF5630', medium:'#FFAB00', low:'#36B37E' };
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
