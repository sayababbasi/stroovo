'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { AlertCircle, AlertTriangle, Clock, Loader2, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';

interface Risk {
  type: "DEADLINE" | "WORKLOAD" | "BLOCKED";
  level: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  taskId?: string;
  userId?: string;
  suggestion: string;
}

interface RiskSummary {
  total: number;
  high: number;
  medium: number;
  low: number;
  byType: {
    deadline: number;
    workload: number;
    blocked: number;
  };
}

export default function AlertsPage() {
  const { accessToken } = useAuth();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiGet('/api/ai/risks', accessToken);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch risks');
      }

      setRisks(response.data?.risks || []);
      setSummary(response.data?.summary || null);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching risks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const levelColors = {
    LOW: {
      bg: '#E3FCEF',
      text: '#36B37E',
      border: '#36B37E',
      icon: 'text-green-600',
    },
    MEDIUM: {
      bg: '#FFF4E6',
      text: '#FFAB00',
      border: '#FFAB00',
      icon: 'text-yellow-600',
    },
    HIGH: {
      bg: '#FFEBE6',
      text: '#FF5630',
      border: '#FF5630',
      icon: 'text-red-600',
    },
  };

  const typeIcons = {
    DEADLINE: Clock,
    WORKLOAD: Users,
    BLOCKED: AlertTriangle,
  };

  const typeColors = {
    DEADLINE: 'text-red-600',
    WORKLOAD: 'text-yellow-600',
    BLOCKED: 'text-orange-600',
  };

  const groupedRisks = useMemo(
    () =>
      risks.reduce((acc, risk) => {
        if (!acc[risk.level]) {
          acc[risk.level] = [];
        }
        acc[risk.level].push(risk);
        return acc;
      }, {} as Record<string, Risk[]>),
    [risks],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-0 min-h-screen p-4 md:ml-60 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-100 p-3 text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Risk Alerts</h1>
                    <p className="text-sm text-slate-500">Deadline, workload, and blocked-work signals generated from live Stroovo workflow data.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {lastRefreshed ? <span className="text-sm text-slate-500">Updated at {lastRefreshed}</span> : null}
                <button
                  onClick={fetchRisks}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </button>
              </div>
            </div>
          </section>

          {error && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </section>
          )}

          {summary && (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Risks</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.total}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">High Severity</p>
                    <p className="mt-2 text-3xl font-semibold text-red-600">{summary.high}</p>
                  </div>
                  <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Medium Severity</p>
                    <p className="mt-2 text-3xl font-semibold text-yellow-600">{summary.medium}</p>
                  </div>
                  <div className="rounded-2xl bg-yellow-100 p-3 text-yellow-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Low Severity</p>
                    <p className="mt-2 text-3xl font-semibold text-green-600">{summary.low}</p>
                  </div>
                  <div className="rounded-2xl bg-green-100 p-3 text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {loading ? (
            <section className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                <p className="text-sm font-medium">Analyzing current Stroovo workflow risks...</p>
              </div>
            </section>
          ) : risks.length > 0 ? (
            <section className="space-y-8">
              {(['HIGH', 'MEDIUM', 'LOW'] as const)
                .filter((level) => groupedRisks[level]?.length)
                .map((level) => (
                <div key={level} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full border px-3 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: levelColors[level].bg,
                        color: levelColors[level].text,
                        borderColor: levelColors[level].border,
                      }}
                    >
                      {level} SEVERITY
                    </div>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {groupedRisks[level].map((risk, index) => {
                      const IconComponent = typeIcons[risk.type];
                      return (
                        <div
                          key={`${level}-${index}`}
                          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                              style={{
                                backgroundColor: levelColors[risk.level].bg,
                              }}
                            >
                              <IconComponent className={`w-5 h-5 ${typeColors[risk.type]}`} />
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                  {risk.message}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                                    {risk.type}
                                  </span>
                                  <span
                                    className="rounded-full border px-2 py-0.5 text-xs font-medium"
                                    style={{
                                      backgroundColor: levelColors[risk.level].bg,
                                      color: levelColors[risk.level].text,
                                      borderColor: levelColors[risk.level].border,
                                    }}
                                  >
                                    {risk.level}
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Suggestion</p>
                                <p className="text-sm leading-6 text-slate-600">
                                  {risk.suggestion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <section className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
              <div className="rounded-3xl bg-green-100 p-4 text-green-600">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No risks detected</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Current tasks do not trigger any deadline, workload, or blocked-work alerts for this tenant.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
