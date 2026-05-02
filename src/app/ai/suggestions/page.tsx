'use client';

import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { AlertCircle, Lightbulb, Loader2, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/lib/api';

type SuggestionPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface AISuggestion {
  action: string;
  reason: string;
  priority: SuggestionPriority;
  impact: string;
}

const priorityStyles: Record<SuggestionPriority, string> = {
  LOW: 'border-green-200 bg-green-50 text-green-700',
  MEDIUM: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  HIGH: 'border-red-200 bg-red-50 text-red-700',
};

export default function SuggestionsPage() {
  const { accessToken } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiPost('/api/ai/suggestions', accessToken, { timeRange: 'week' });

      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
      }

      const result = await response.json();
      setSuggestions(Array.isArray(result.data?.suggestions) ? result.data.suggestions : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (fetchError) {
      console.error('Error fetching suggestions:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-0 min-h-screen p-4 md:ml-60 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">AI Suggestions</h1>
                    <p className="text-sm text-slate-500">Fresh recommendations built from current workload, tasks, and deadlines.</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Powered by the local suggestions engine
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {lastUpdated ? (
                  <span className="text-sm text-slate-500">Updated at {lastUpdated}</span>
                ) : null}
                <button
                  type="button"
                  onClick={fetchSuggestions}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </button>
              </div>
            </div>
          </section>

          {error ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </section>
          ) : null}

          {loading ? (
            <section className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="text-sm font-medium">Generating AI suggestions...</p>
              </div>
            </section>
          ) : suggestions.length > 0 ? (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {suggestions.map((suggestion, index) => (
                <article
                  key={`${suggestion.action}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[suggestion.priority]}`}>
                      {suggestion.priority}
                    </div>
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Title</p>
                      <h2 className="text-lg font-semibold leading-tight text-slate-900">{suggestion.action}</h2>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reason</p>
                      <p className="text-sm leading-6 text-slate-600">{suggestion.reason}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Impact</p>
                      <p className="text-sm font-medium text-slate-700">{suggestion.impact}</p>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-600">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">No suggestions available</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Refresh to generate a fresh set of AI suggestions from your current tenant activity.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
