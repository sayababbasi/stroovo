"use client";
import { Search, TrendingUp, TrendingDown, Minus, AlertTriangle, Activity } from 'lucide-react';

interface Props {
  summary: any;
  filter: any;
  setFilter: (f: any) => void;
  statusCardFilter: string | null;
  setStatusCardFilter: (s: string | null) => void;
  goals: any[];
}

export default function GoalsCommandBar({ summary, filter, setFilter, statusCardFilter, setStatusCardFilter, goals }: Props) {
  const TrendIcon = summary.velocityTrend === 'up' ? TrendingUp : summary.velocityTrend === 'down' ? TrendingDown : Minus;
  const trendColor = summary.velocityTrend === 'up' ? '#34D399' : summary.velocityTrend === 'down' ? '#F87171' : '#94A3B8';

  const cards = [
    {
      label: 'Active Goals',
      value: summary.activeGoals ?? goals.filter((g: any) => g.status !== 'COMPLETED').length,
      trend: null,
      filter: 'ACTIVE',
      accent: '#6366F1',
    },
    {
      label: 'At Risk',
      value: summary.atRiskGoals ?? 0,
      trend: '↑',
      trendColor: '#FBBF24',
      filter: 'AT_RISK',
      accent: '#FBBF24',
    },
    {
      label: 'Critical',
      value: summary.criticalGoals ?? 0,
      trend: null,
      filter: 'CRITICAL',
      accent: '#F87171',
    },
    null, // divider
    {
      label: 'Execution Score',
      value: `${summary.executionScore ?? 0}`,
      unit: '%',
      trend: <TrendIcon size={11} color={trendColor} />,
      filter: null,
      accent: summary.executionScore > 70 ? '#34D399' : summary.executionScore > 40 ? '#FBBF24' : '#F87171',
    },
    {
      label: 'Avg Confidence',
      value: `${summary.avgConfidence ?? 0}`,
      unit: '%',
      trend: null,
      filter: null,
      accent: '#60A5FA',
    },
  ];

  return (
    <div className="command-bar">
      {cards.map((card, idx) => {
        if (card === null) return <div key={idx} className="mc-divider" />;
        const isActive = statusCardFilter === card.filter;
        return (
          <div
            key={idx}
            className={`metric-card ${isActive ? 'active' : ''}`}
            style={{ borderColor: isActive ? card.accent : undefined }}
            onClick={() => card.filter ? setStatusCardFilter(isActive ? null : card.filter) : null}
          >
            <span className="mc-label">{card.label}</span>
            <span className="mc-value" style={{ color: card.accent }}>
              {card.value}{card.unit ?? ''}
            </span>
            <span className="mc-trend">
              {card.trend}
            </span>
          </div>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div className="search-input-wrapper">
        <Search size={13} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search goals…"
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
        />
      </div>

      {/* Status Filter */}
      <select
        className="filter-select"
        value={filter.status}
        onChange={e => setFilter({ ...filter, status: e.target.value })}
      >
        <option value="ALL">All Statuses</option>
        <option value="ON TRACK">On Track</option>
        <option value="AT RISK">At Risk</option>
        <option value="OFF TRACK">Off Track</option>
        <option value="COMPLETED">Completed</option>
      </select>
    </div>
  );
}
