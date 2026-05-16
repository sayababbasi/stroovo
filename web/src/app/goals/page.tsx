"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import GoalFormModal from '@/components/goals/GoalFormModal';
import GoalDetailPanel from '@/components/goals/GoalDetailPanel';
import GoalsView from '@/components/goals/views/GoalsView';
import OKRsView from '@/components/goals/views/OKRsView';
import PerformanceView from '@/components/goals/views/PerformanceView';
import MyFocusView from '@/components/goals/views/MyFocusView';
import {
  Target, Plus, RefreshCw, AlertTriangle, Clock,
  TrendingDown, LayoutGrid, Search, Filter, ChevronDown,
  Activity, Zap, Brain
} from 'lucide-react';

export type ViewTab = 'goals' | 'okrs' | 'performance' | 'myfocus';

// ── Tiny SVG Sparkline ────────────────────────────────────────────────────────
function Sparkline({ color, positive }: { color: string; positive: boolean }) {
  const pts = positive
    ? '0,18 8,14 16,12 24,9 32,7 40,4 48,2'
    : '0,4 8,6 16,5 24,10 32,12 40,15 48,18';
  return (
    <svg width={48} height={20} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
    </svg>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit = '', sub, accent, positive, onClick, active }: {
  label: string; value: string | number; unit?: string; sub?: string;
  accent: string; positive: boolean; onClick?: () => void; active?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? '#E6EFFF' : 'white',
        border: `1px solid ${active ? '#0052CC' : '#DFE1E6'}`,
        borderRadius: 10, padding: '16px 18px', cursor: onClick ? 'pointer' : 'default',
        display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 140,
        transition: 'all .15s', position: 'relative', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(9,30,66,.06)'
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, fontWeight: 600 }}>{unit}</span>
      </span>
      {sub && <span style={{ fontSize: 10, color: positive ? '#36B37E' : '#FF5630', display: 'flex', alignItems: 'center', gap: 3 }}>
        {positive ? '▲' : '▼'} {sub}
      </span>}
      <div style={{ position: 'absolute', right: 12, bottom: 12 }}>
        <Sparkline color={accent} positive={positive} />
      </div>
    </div>
  );
}

// ── Attention Alert Card ──────────────────────────────────────────────────────
function AttentionCard({ alert, onClick }: { alert: any; onClick: () => void }) {
  const cfg: Record<string, { bg: string; border: string; dot: string; textColor: string; badgeText: string }> = {
    critical: { bg: '#FFF0F0', border: '#FFEBEB', dot: '#FF5630', textColor: '#BF2600', badgeText: 'Critical' },
    warning: { bg: '#FFFAE6', border: '#FFF0B3', dot: '#FFAB00', textColor: '#974F0C', badgeText: 'Warning' },
    info: { bg: '#E6EFFF', border: '#B3D0FF', dot: '#0052CC', textColor: '#0052CC', badgeText: 'Info' },
    good: { bg: '#E3FCEF', border: '#D3F9E8', dot: '#36B37E', textColor: '#006644', badgeText: 'Good' },
  };
  const c = cfg[alert.severity] || cfg.info;
  return (
    <div onClick={onClick} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', minWidth: 220, flex: 1, transition: 'all .15s', boxShadow: '0 1px 3px rgba(9,30,66,.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D', flex: 1, lineHeight: 1.3 }}>{alert.message}</span>
      </div>
      {alert.detail && <p style={{ fontSize: 11, color: '#42526E', marginBottom: 8 }}>{alert.detail}</p>}
      <span style={{ fontSize: 10, fontWeight: 700, background: c.dot, color: 'white', padding: '2px 8px', borderRadius: 6 }}>{c.badgeText}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<ViewTab>('goals');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cardFilter, setCardFilter] = useState<string | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const r = await fetch('/api/goals/intelligence', { credentials: 'include' });
      if (r.ok) setData(await r.json());
    } catch { }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => fetchData(true), 30000);
    const h = () => fetchData(true);
    window.addEventListener('goalsUpdated', h);
    return () => { clearInterval(t); window.removeEventListener('goalsUpdated', h); };
  }, [fetchData]);

  const goals: any[] = data?.goals || [];
  const summary: any = data?.summary || {};
  const alerts: any[] = (data?.alerts || []).slice(0, 4);

  const filtered = useMemo(() => goals.filter(g => {
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || g.status?.replace(/_/g, ' ') === statusFilter;
    const matchCard = !cardFilter
      || (cardFilter === 'ACTIVE' && g.status !== 'COMPLETED')
      || (cardFilter === 'AT_RISK' && (g.computed?.riskScore ?? 0) > 40 && (g.computed?.riskScore ?? 0) <= 70)
      || (cardFilter === 'CRITICAL' && (g.computed?.riskScore ?? 0) > 70);
    return matchSearch && matchStatus && matchCard;
  }), [goals, search, statusFilter, cardFilter]);

  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const tabs = [
    { id: 'goals' as ViewTab, label: 'Goals', Icon: Target },
    { id: 'okrs' as ViewTab, label: 'OKRs', Icon: LayoutGrid },
    { id: 'performance' as ViewTab, label: 'Performance', Icon: Activity },
    { id: 'myfocus' as ViewTab, label: 'My Focus', Icon: Zap },
  ];

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Sidebar />
      <style>{CSS}</style>

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div style={{ padding: '24px 28px 0', background: 'white', borderBottom: '1px solid #DFE1E6', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(9,30,66,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#E6EFFF', padding: 8, borderRadius: 8, color: '#0052CC' }}>
                <Target size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: '#172B4D', letterSpacing: '-0.3px' }}>Goals Command Center</h1>
                  <Brain size={15} color="#0052CC" />
                </div>
                <p style={{ fontSize: 13, color: '#42526E', marginTop: 2 }}>Drive strategy. Track outcomes. Make better decisions.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="gb-ghost" onClick={() => fetchData(true)} disabled={refreshing}>
                <RefreshCw size={13} style={{ animation: refreshing ? 'gspin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Syncing…' : 'Refresh'}
              </button>
              <button className="gb-primary" onClick={() => { setEditingGoal(null); setShowModal(true); }}>
                <Plus size={14} /> New Goal
              </button>
            </div>
          </div>

          {/* ── METRIC CARDS ── */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <MetricCard label="Active Goals" value={summary.activeGoals ?? goals.filter(g => g.status !== 'COMPLETED').length} sub="vs last cycle" accent="#0052CC" positive onClick={() => setCardFilter(cardFilter === 'ACTIVE' ? null : 'ACTIVE')} active={cardFilter === 'ACTIVE'} />
            <MetricCard label="At Risk Goals" value={summary.atRiskGoals ?? 0} sub="vs last cycle" accent="#FFAB00" positive={false} onClick={() => setCardFilter(cardFilter === 'AT_RISK' ? null : 'AT_RISK')} active={cardFilter === 'AT_RISK'} />
            <MetricCard label="Critical Goals" value={summary.criticalGoals ?? 0} sub="vs last cycle" accent="#FF5630" positive={false} onClick={() => setCardFilter(cardFilter === 'CRITICAL' ? null : 'CRITICAL')} active={cardFilter === 'CRITICAL'} />
            <MetricCard label="Execution Score" value={summary.executionScore ?? 0} unit="%" sub="vs last cycle" accent="#36B37E" positive />
            <MetricCard label="AI Confidence" value={summary.avgConfidence ?? 0} unit="%" sub="vs last cycle" accent="#6554C0" positive />
          </div>

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #DFE1E6' }}>
            {tabs.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px 12px', background: 'none', border: 'none',
                borderBottom: tab === id ? '2px solid #0052CC' : '2px solid transparent',
                color: tab === id ? '#0052CC' : '#42526E', fontSize: 13, fontWeight: tab === id ? 600 : 500,
                cursor: 'pointer', marginBottom: -1, transition: 'color .15s', fontFamily: 'inherit',
              }}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── ATTENTION ALERTS ── */}
        {alerts.length > 0 && (
          <div style={{ padding: '14px 28px', background: '#FAFBFC', borderBottom: '1px solid #DFE1E6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>✨</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>What needs your attention</span>
              </div>
              <span style={{ fontSize: 11, color: '#0052CC', cursor: 'pointer', fontWeight: 500 }}>View all alerts →</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'nowrap', overflow: 'hidden' }}>
              {alerts.map(a => (
                <AttentionCard key={a.id} alert={a} onClick={() => setSelectedGoalId(a.goalId)} />
              ))}
            </div>
          </div>
        )}

        {/* ── FILTER BAR ── */}
        <div style={{ padding: '10px 28px', background: 'white', borderBottom: '1px solid #DFE1E6', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8A94A6' }} />
            <input
              placeholder="Search goals, KRs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '7px 12px 7px 32px', background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: 8, color: '#172B4D', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          {[
            { label: 'Status', options: ['ALL', 'ON TRACK', 'AT RISK', 'OFF TRACK', 'COMPLETED'], val: statusFilter, set: setStatusFilter },
          ].map(({ label, options, val, set }) => (
            <select key={label} value={val} onChange={e => set(e.target.value)} style={{ padding: '7px 10px', background: '#F4F5F7', border: '1px solid #DFE1E6', borderRadius: 8, color: '#42526E', fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {options.map(o => <option key={o} value={o}>{label}: {o === 'ALL' ? 'All' : o}</option>)}
            </select>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#42526E' }}>
            Showing {filtered.length} of {goals.length} goals
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px 28px' }}>
            {loading ? (
              <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 64, borderRadius: 10, background: '#111827', animation: 'gpulse 1.5s ease infinite' }} />
                ))}
              </div>
            ) : (
              <>
                {tab === 'goals' && <GoalsView goals={filtered} onSelectGoal={setSelectedGoalId} onEditGoal={g => { setEditingGoal(g); setShowModal(true); }} selectedGoalId={selectedGoalId} onRefresh={() => fetchData(true)} />}
                {tab === 'okrs' && <OKRsView goals={filtered} onRefresh={() => fetchData(true)} currentUserId={user?.id} />}
                {tab === 'performance' && <PerformanceView goals={filtered} summary={summary} />}
                {tab === 'myfocus' && <MyFocusView goals={filtered} currentUserId={user?.id || ''} onSelectGoal={setSelectedGoalId} onRefresh={() => fetchData(true)} />}
              </>
            )}
          </div>

          {selectedGoal && (
            <GoalDetailPanel
              goal={selectedGoal}
              onClose={() => setSelectedGoalId(null)}
              onRefresh={() => fetchData(true)}
              onEdit={g => { setEditingGoal(g); setShowModal(true); }}
            />
          )}
        </div>
      </div>

      {showModal && (
        <GoalFormModal
          editingGoal={editingGoal}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchData(true); }}
          currentUserId={user?.id || ''}
        />
      )}
    </main>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  @keyframes gspin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes gpulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes gslideIn{ from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes gfadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .gb-primary{display:flex;align-items:center;gap:6px;padding:7px 16px;background:#0052CC;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;box-shadow:0 2px 8px rgba(0,82,204,.2)}
  .gb-primary:hover{background:#0065FF}
  .gb-ghost{display:flex;align-items:center;gap:6px;padding:7px 12px;background:white;color:#42526E;border:1px solid #DFE1E6;border-radius:8px;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s}
  .gb-ghost:hover{background:#F4F5F7;border-color:#C1C7D0}

  /* goals table */
  .goals-table{width:100%;border-collapse:separate;border-spacing:0;margin-top:12px}
  .goals-table th{padding:9px 12px;font-size:10px;font-weight:700;color:#6B778C;text-transform:uppercase;letter-spacing:.07em;background:#F8F9FA;border-bottom:1px solid #DFE1E6;text-align:left;white-space:nowrap}
  .goals-table td{padding:11px 12px;font-size:13px;color:#172B4D;border-bottom:1px solid rgba(9,30,66,.06);vertical-align:middle}
  .goals-table tbody tr{cursor:pointer;transition:background .1s}
  .goals-table tbody tr:hover td{background:#F4F5F7}
  .goals-table tbody tr.gsel td{background:#E6EFFF}

  /* KR expand row */
  .kr-expand{background:#FAFBFC;display:grid;grid-template-columns:32px 1fr 180px 120px 90px 80px;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(9,30,66,.06);align-items:center}

  /* progress */
  .g-prog{height:5px;background:#EBECF0;border-radius:10px;overflow:hidden}
  .g-prog-fill{height:100%;border-radius:10px;transition:width .5s ease}

  /* score pill */
  .spill{display:inline-flex;align-items:center;justify-content:center;padding:2px 9px;border-radius:10px;font-size:11px;font-weight:700;min-width:40px}
  .spill.h{background:rgba(54,179,126,.12);color:#006644}
  .spill.m{background:rgba(255,171,0,.12);color:#974F0C}
  .spill.l{background:rgba(255,86,48,.12);color:#BF2600}

  /* status badge */
  .gbadge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}
  .gbadge.on{background:rgba(54,179,126,.1);color:#006644}
  .gbadge.at{background:rgba(255,171,0,.1);color:#974F0C}
  .gbadge.off{background:rgba(255,86,48,.1);color:#BF2600}
  .gbadge.done{background:rgba(0,82,204,.1);color:#0052CC}

  /* okr */
  .okr-card{background:white;border:1px solid #DFE1E6;border-radius:10px;margin-bottom:12px;overflow:hidden;animation:gfadeUp .2s ease;box-shadow:0 1px 3px rgba(9,30,66,.06)}
  .okr-header{padding:14px 18px;border-bottom:1px solid #DFE1E6;display:flex;align-items:center;justify-content:space-between;background:#FAFBFC}
  .okr-kr-row{display:grid;grid-template-columns:1fr 160px 110px 90px auto;gap:12px;padding:11px 18px;border-bottom:1px solid rgba(9,30,66,.06);align-items:center}
  .okr-kr-row:last-child{border-bottom:none}
  .okr-input{background:white;border:1px solid #DFE1E6;border-radius:6px;color:#172B4D;font-size:12px;padding:4px 8px;width:70px;text-align:right;outline:none;font-family:inherit}
  .okr-input:focus{border-color:#0052CC;box-shadow:0 0 0 2px rgba(0,82,204,.1)}

  /* perf */
  .perf-box{background:white;border:1px solid #DFE1E6;border-radius:10px;padding:18px;margin-bottom:14px;box-shadow:0 1px 3px rgba(9,30,66,.06)}
  .pbar{display:flex;align-items:center;gap:10px;margin-bottom:7px}
  .pbar-label{font-size:12px;color:#42526E;min-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .pbar-track{flex:1;height:6px;background:#EBECF0;border-radius:10px;overflow:hidden}
  .pbar-fill{height:100%;border-radius:10px;transition:width .5s}
  .pbar-val{font-size:11px;color:#6B778C;min-width:32px;text-align:right}

  /* detail panel */
  .dpanel{width:380px;min-width:380px;border-left:1px solid #DFE1E6;background:white;overflow-y:auto;display:flex;flex-direction:column;animation:gslideIn .2s ease;box-shadow:-4px 0 16px rgba(9,30,66,.08)}
  .dpanel-sec{padding:16px 18px;border-bottom:1px solid #DFE1E6}
  .dp-label{font-size:10px;font-weight:700;color:#6B778C;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;display:flex;align-items:center;gap:5px}

  /* modal */
  .gm-overlay{position:fixed;inset:0;background:rgba(9,30,66,.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(2px)}
  .gm-box{background:white;border:1px solid #DFE1E6;border-radius:12px;width:100%;max-width:580px;padding:28px;box-shadow:0 8px 32px rgba(9,30,66,.15);animation:gfadeUp .2s ease;max-height:90vh;overflow-y:auto}
  .gm-field{margin-bottom:16px}
  .gm-field label{display:block;font-size:11px;font-weight:700;color:#42526E;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
  .ginput,.gselect,.gtextarea{width:100%;padding:8px 12px;background:#FAFBFC;border:1px solid #DFE1E6;border-radius:8px;color:#172B4D;font-size:13px;outline:none;font-family:inherit;transition:border-color .15s}
  .ginput:focus,.gselect:focus,.gtextarea:focus{border-color:#0052CC;box-shadow:0 0 0 2px rgba(0,82,204,.1);background:white}
  .gtextarea{resize:vertical;min-height:68px}

  /* focus view */
  .focus-card{background:white;border:1px solid #DFE1E6;border-radius:10px;padding:16px 18px;margin-bottom:12px;cursor:pointer;transition:all .15s;box-shadow:0 1px 3px rgba(9,30,66,.04)}
  .focus-card:hover{border-color:#0052CC;box-shadow:0 3px 8px rgba(0,82,204,.08);transform:translateY(-1px)}

  /* risk donut helper */
  .risk-donut{position:relative;display:inline-flex;align-items:center;justify-content:center}
`;
