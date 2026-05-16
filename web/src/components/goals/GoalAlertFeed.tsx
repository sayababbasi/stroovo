"use client";
import { AlertTriangle, Clock, TrendingDown, PieChart, X } from 'lucide-react';

interface Props {
  alerts: any[];
  onGoalClick: (id: string) => void;
}

const ICONS: Record<string, any> = {
  CRITICAL_MISS: AlertTriangle,
  DEADLINE_RISK: Clock,
  KR_STAGNATION: Clock,
  VELOCITY_DROP: TrendingDown,
  UNBALANCED_KR: PieChart,
};

export default function GoalAlertFeed({ alerts, onGoalClick }: Props) {
  return (
    <div className="alert-feed">
      <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0, alignSelf: 'center' }}>
        Alerts
      </span>
      {alerts.slice(0, 12).map((alert: any) => {
        const Icon = ICONS[alert.type] || AlertTriangle;
        return (
          <button
            key={alert.id}
            className={`alert-chip ${alert.severity}`}
            onClick={() => onGoalClick(alert.goalId)}
            title={alert.detail}
          >
            <span className={`alert-dot ${alert.severity}`} />
            <Icon size={10} />
            {alert.message}
          </button>
        );
      })}
    </div>
  );
}
