"use client";
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';

interface Props {
  goals: any[];
  summary: any;
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="pbar">
      {label && <div className="pbar-label" title={label}>{label}</div>}
      <div className="pbar-track">
        <div className="pbar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="pbar-val">{value}%</span>
    </div>
  );
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={70} height={70}>
        <circle cx={35} cy={35} r={r} fill="none" stroke="#DFE1E6" strokeWidth={5} />
        <circle
          cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 35 35)"
        />
        <text x={35} y={39} textAnchor="middle" fill={color} fontSize={13} fontWeight={700}>{value}</text>
      </svg>
      <span style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function PerformanceView({ goals, summary }: Props) {
  const sorted = useMemo(() =>
    [...goals].sort((a, b) => (b.computed?.healthScore ?? 0) - (a.computed?.healthScore ?? 0)),
    [goals]
  );

  const velocityData = useMemo(() =>
    goals.map((g: any) => ({
      id: g.id,
      title: g.title,
      velocity: Math.round((g.computed?.velocityScore ?? 0) * 100) / 100,
      display: Math.min(100, Math.round((g.computed?.velocityScore ?? 0) * 30)),
    })),
    [goals]
  );

  const krContribution = useMemo(() => {
    const krs = goals.flatMap((g: any) => (g.computed?.keyResults || []).map((kr: any) => ({
      ...kr, goalTitle: g.title
    })));
    return krs.sort((a: any, b: any) => b.progress - a.progress).slice(0, 8);
  }, [goals]);

  return (
    <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

      {/* Score Rings */}
      <div className="perf-box" style={{ gridColumn: '1/-1' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 20 }}>Execution Metrics</h3>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          <ScoreRing value={summary.executionScore ?? 0} label="Execution" color="#0052CC" />
          <ScoreRing value={summary.avgConfidence ?? 0} label="Confidence" color="#36B37E" />
          <ScoreRing value={summary.avgProgress ?? 0} label="Avg Progress" color="#0052CC" />
          <ScoreRing value={summary.completionRate ?? 0} label="Completion Rate" color="#FFAB00" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FF5630' }}>{summary.criticalAlerts ?? 0}</div>
            <div style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em' }}>Critical Alerts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FFAB00' }}>{summary.atRiskGoals ?? 0}</div>
            <div style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em' }}>At Risk</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#36B37E' }}>{summary.activeGoals ?? 0}</div>
            <div style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em' }}>Active</div>
          </div>
        </div>
      </div>

      {/* Goal Performance Ranking */}
      <div className="perf-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Award size={14} color="#0052CC" />
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '.06em' }}>Goal Health Ranking</h3>
        </div>
        {sorted.map((g: any, i: number) => (
          <MiniBar
            key={g.id}
            label={`${i + 1}. ${g.title}`}
            value={g.computed?.healthScore ?? 0}
            color={i === 0 ? '#0052CC' : i === 1 ? '#0052CC' : i === 2 ? '#0052CC' : '#DFE1E6'}
          />
        ))}
        {!sorted.length && <p style={{ fontSize: 12, color: '#42526E' }}>No data</p>}
      </div>

      {/* Velocity */}
      <div className="perf-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={14} color="#36B37E" />
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '.06em' }}>Progress Velocity (%/day)</h3>
        </div>
        {velocityData.map((v: any) => (
          <MiniBar key={v.id} label={v.title} value={v.display} color="#36B37E" />
        ))}
        {!velocityData.length && <p style={{ fontSize: 12, color: '#42526E' }}>No data</p>}
      </div>

      {/* KR Contribution */}
      <div className="perf-box" style={{ gridColumn: '1/-1' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>KR Performance Distribution</h3>
        {krContribution.map((kr: any, i: number) => {
          const color = kr.progress >= 70 ? '#34D399' : kr.progress >= 40 ? '#FBBF24' : '#F87171';
          return (
            <div key={kr.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: '#172B4D' }}>{kr.title}</span>
                <span style={{ fontSize: 10, color: '#42526E' }}>{kr.goalTitle}</span>
              </div>
              <MiniBar label="" value={kr.progress} color={color} />
            </div>
          );
        })}
        {!krContribution.length && <p style={{ fontSize: 12, color: '#42526E' }}>No KR data</p>}
      </div>
    </div>
  );
}
