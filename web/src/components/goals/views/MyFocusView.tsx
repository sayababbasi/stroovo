"use client";
import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

interface Props {
  goals: any[];
  currentUserId: string;
  onSelectGoal: (id: string) => void;
  onRefresh: () => void;
}

export default function MyFocusView({ goals, currentUserId, onSelectGoal }: Props) {
  const myGoals = useMemo(() =>
    goals.filter((g: any) => g.ownerId === currentUserId),
    [goals, currentUserId]
  );

  const critical = myGoals.filter((g: any) => (g.computed?.riskScore ?? 0) > 70);
  const atRisk   = myGoals.filter((g: any) => (g.computed?.riskScore ?? 0) > 40 && (g.computed?.riskScore ?? 0) <= 70);
  const healthy  = myGoals.filter((g: any) => (g.computed?.riskScore ?? 0) <= 40);

  const totalExposure = myGoals.length > 0
    ? Math.round(myGoals.reduce((s: number, g: any) => s + (g.computed?.riskScore ?? 0), 0) / myGoals.length)
    : 0;

  const allMyKRs = useMemo(() =>
    myGoals.flatMap((g: any) => (g.computed?.keyResults || []).map((kr: any) => ({ ...kr, goalTitle: g.title, goalId: g.id }))),
    [myGoals]
  );
  const stagnantKRs = allMyKRs.filter((kr: any) => kr.isStagnant);

  function GoalCard({ goal }: { goal: any }) {
    const c = goal.computed || {};
    const risk = c.riskScore ?? 0;
    const riskColor = risk > 70 ? '#FF5630' : risk > 40 ? '#FFAB00' : '#36B37E';
    return (
      <div className="focus-card" onClick={() => onSelectGoal(goal.id)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#172B4D' }}>{goal.title}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: riskColor }}>{risk}% risk</span>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="g-prog" style={{ flex: 1 }}>
            <div className="g-prog-fill" style={{ width: `${c.progress ?? goal.progress ?? 0}%`, background: '#0052CC' }} />
          </div>
          <span style={{ fontSize: 12, color: '#0052CC', fontWeight: 700, minWidth: 32 }}>{c.progress ?? goal.progress ?? 0}%</span>
          {goal.targetDate && (
            <span style={{ fontSize: 11, color: '#6B778C' }}>
              {c.daysRemaining < 0 ? `${Math.abs(c.daysRemaining)}d overdue` : `${c.daysRemaining}d left`}
            </span>
          )}
        </div>
        <div style={{ height: 4, borderRadius: 2, marginTop: 14, background: `linear-gradient(90deg, ${riskColor} ${risk}%, #EBECF0 ${risk}%)` }} />
      </div>
    );
  }

  if (!currentUserId) {
    return <div style={{ padding: 40, color: '#42526E', fontSize: 13 }}>Please log in to see your focus view.</div>;
  }

  return (
    <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
      {/* Left: My Goals */}
      <div>
        {/* Summary strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'My Goals', value: myGoals.length, color: '#6366F1', Icon: Target },
            { label: 'Critical', value: critical.length, color: '#FF5630', Icon: AlertTriangle },
            { label: 'At Risk', value: atRisk.length, color: '#FFAB00', Icon: Clock },
            { label: 'On Track', value: healthy.length, color: '#36B37E', Icon: CheckCircle },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} style={{ flex: 1, background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon size={16} color={color} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 10, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {critical.length > 0 && (
          <>
            <div style={{ color: '#FF5630', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>🔴 Critical — Immediate Action</div>
            {critical.map((g: any) => <GoalCard key={g.id} goal={g} />)}
          </>
        )}
        {atRisk.length > 0 && (
          <>
            <div style={{ color: '#FFAB00', marginTop: critical.length ? 16 : 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>🟡 At Risk — Monitor Closely</div>
            {atRisk.map((g: any) => <GoalCard key={g.id} goal={g} />)}
          </>
        )}
        {healthy.length > 0 && (
          <>
            <div style={{ color: '#36B37E', marginTop: (critical.length || atRisk.length) ? 16 : 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>🟢 On Track</div>
            {healthy.map((g: any) => <GoalCard key={g.id} goal={g} />)}
          </>
        )}
        {myGoals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#42526E' }}>
            <p style={{ fontSize: 14 }}>You have no goals assigned yet.</p>
          </div>
        )}
      </div>

      {/* Right: Risk Exposure + Stagnant KRs */}
      <div>
        <div style={{ background: '#FAFBFC', border: '1px solid #DFE1E6', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#42526E', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Risk Exposure</h3>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: totalExposure > 70 ? '#FF5630' : totalExposure > 40 ? '#FFAB00' : '#36B37E' }}>
              {totalExposure}%
            </div>
            <div style={{ fontSize: 12, color: '#42526E' }}>Average Risk Score</div>
          </div>
          <div className="g-prog" style={{ height: 8 }}>
            <div className="g-prog-fill" style={{
              width: `${totalExposure}%`,
              background: totalExposure > 70 ? '#FF5630' : totalExposure > 40 ? '#FFAB00' : '#36B37E'
            }} />
          </div>
        </div>

        {stagnantKRs.length > 0 && (
          <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#FF5630', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
              Stagnant KRs ({stagnantKRs.length})
            </h3>
            {stagnantKRs.map((kr: any) => (
              <div key={kr.id} style={{ padding: '8px 0', borderBottom: '1px solid #FFEBEB', cursor: 'pointer' }} onClick={() => onSelectGoal(kr.goalId)}>
                <div style={{ fontSize: 12, color: '#BF2600', fontWeight: 500 }}>{kr.title}</div>
                <div style={{ fontSize: 10, color: '#FF5630', marginTop: 2 }}>
                  {kr.goalTitle} · {kr.daysSinceUpdate}d idle · {kr.progress}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
