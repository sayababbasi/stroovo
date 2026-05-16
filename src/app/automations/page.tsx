'use client';

import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import GlobalHeader from '@/components/GlobalHeader';
import { AlertCircle, Bot, CheckCircle, Loader2, Play, Power, RefreshCw, Zap, Activity, Search, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastTriggered?: string | null;
  triggerCount: number;
  source?: 'database' | 'mock';
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [busyRuleId, setBusyRuleId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>('');
  const [searchQ, setSearchQ] = useState('');

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/automations', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load automations: ${response.statusText}`);
      const result = await response.json();
      setRules(Array.isArray(result.data) ? result.data : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const toggleRule = async (rule: AutomationRule) => {
    setBusyRuleId(rule.id);
    setNotice('');
    try {
      const response = await fetch('/api/automations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, enabled: !rule.enabled }),
      });
      if (!response.ok) throw new Error(`Failed to update rule: ${response.statusText}`);
      setRules(current => current.map(e => e.id === rule.id ? { ...e, enabled: !e.enabled } : e));
      setNotice(`${rule.name} ${rule.enabled ? 'disabled' : 'enabled'}.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unknown error occurred');
    } finally {
      setBusyRuleId(null);
    }
  };

  const runAutomation = async (rule: AutomationRule) => {
    setBusyRuleId(rule.id);
    setNotice('');
    try {
      const response = await fetch('/api/automations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId: rule.id }),
      });
      if (!response.ok) throw new Error(`Failed to run automation: ${response.statusText}`);
      setRules(current => current.map(e => e.id === rule.id ? { ...e, lastTriggered: new Date().toISOString(), triggerCount: e.triggerCount + 1 } : e));
      setNotice(`${rule.name} queued successfully.`);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Unknown error occurred');
    } finally {
      setBusyRuleId(null);
    }
  };

  const filtered = rules.filter(r =>
    r.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQ.toLowerCase())
  );

  const activeCount = rules.filter(r => r.enabled).length;
  const totalRuns = rules.reduce((sum, r) => sum + r.triggerCount, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFBFC' }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <GlobalHeader />

        <div style={{ padding: '24px 32px', flex: 1 }}>
          {/* Page Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ background: '#FFF4E6', padding: 8, borderRadius: 10 }}>
                  <Zap size={22} color="#FFAB00" />
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#172B4D', margin: 0, letterSpacing: '-0.02em' }}>
                  Stroovo Automations
                </h1>
              </div>
              <p style={{ fontSize: '15px', color: '#6B778C', margin: 0, fontWeight: 500 }}>
                Manage rule-based execution across tasks, risk signals, and Stroovo workflow events.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={fetchRules}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'white', border: '1px solid #E8EAED', borderRadius: 8, fontSize: '13px', fontWeight: 600, color: '#42526E', cursor: 'pointer', boxShadow: '0 1px 4px rgba(9,30,66,0.04)' }}
              >
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                Refresh
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: 8, fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,82,204,0.2)' }}>
                <Plus size={16} /> Create Rule
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Active Rules', val: activeCount, icon: Play, color: '#0052CC', bg: '#E6EFFF' },
              { label: 'Total Rules', val: rules.length, icon: Bot, color: '#6554C0', bg: '#F2F0FF' },
              { label: 'Total Executions', val: totalRuns, icon: Activity, color: '#36B37E', bg: '#E3FCEF' },
              { label: 'Errors (30d)', val: 0, icon: AlertCircle, color: '#FF5630', bg: '#FFEBE6' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #E8EAED', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(9,30,66,0.04)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={20} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#172B4D' }}>{s.val}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#8A94A6' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#FFEBE6', border: '1px solid #FFBDAD', borderRadius: 10, marginBottom: 20, fontSize: '13px', fontWeight: 600, color: '#BF2600' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {notice && !error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#E3FCEF', border: '1px solid #ABF5D1', borderRadius: 10, marginBottom: 20, fontSize: '13px', fontWeight: 600, color: '#006644' }}>
              <CheckCircle size={14} /> {notice}
            </div>
          )}

          {/* Search */}
          <div style={{ position: 'relative', width: 320, marginBottom: 20 }}>
            <Search size={14} color="#8A94A6" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search rules..."
              style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, border: '1px solid #E8EAED', fontSize: '13px', outline: 'none', background: 'white' }}
            />
          </div>

          {/* Rules */}
          {loading ? (
            <div style={{ background: 'white', border: '1px solid #E8EAED', borderRadius: 12, padding: '60px', textAlign: 'center', color: '#8A94A6' }}>
              <Loader2 size={28} color="#6554C0" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading automation rules...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: 'white', border: '2px dashed #E8EAED', borderRadius: 12, padding: '60px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F2F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Bot size={28} color="#6554C0" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#172B4D', marginBottom: 8 }}>No automation rules yet</div>
              <div style={{ fontSize: '13px', color: '#8A94A6' }}>Create your first rule to start automating your Stroovo workflow.</div>
            </div>
          ) : (
            <div style={{ background: 'white', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(9,30,66,0.04)' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px,2fr) minmax(180px,1.5fr) minmax(180px,1.5fr) 140px 100px 120px', padding: '10px 20px', background: '#FAFBFC', borderBottom: '1px solid #E8EAED', fontSize: '11px', fontWeight: 700, color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <div>Rule</div><div>Trigger</div><div>Action</div><div>Last Run</div><div>Runs</div><div style={{ textAlign: 'right' }}>Controls</div>
              </div>

              {filtered.map(rule => (
                <div key={rule.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px,2fr) minmax(180px,1.5fr) minmax(180px,1.5fr) 140px 100px 120px', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #F4F5F7', opacity: rule.enabled ? 1 : 0.65, transition: 'opacity 0.2s' }}>
                  {/* Name */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>{rule.name}</div>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '10px', fontWeight: 800, background: rule.enabled ? '#E3FCEF' : '#F4F5F7', color: rule.enabled ? '#006644' : '#6B778C' }}>{rule.enabled ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B778C', lineHeight: 1.5 }}>{rule.description}</div>
                  </div>

                  {/* Trigger */}
                  <div style={{ fontSize: '12px', color: '#42526E', background: '#FFFAE6', padding: '6px 10px', borderRadius: 6, fontWeight: 600 }}>
                    <span style={{ color: '#974F0C', fontWeight: 800 }}>IF: </span>{rule.trigger}
                  </div>

                  {/* Action */}
                  <div style={{ fontSize: '12px', color: '#42526E', background: '#E6EFFF', padding: '6px 10px', borderRadius: 6, fontWeight: 600 }}>
                    <span style={{ color: '#0052CC', fontWeight: 800 }}>THEN: </span>{rule.action}
                  </div>

                  {/* Last Run */}
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C' }}>
                    {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
                  </div>

                  {/* Runs */}
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>{rule.triggerCount}</div>

                  {/* Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => toggleRule(rule)}
                      disabled={busyRuleId === rule.id}
                      title={rule.enabled ? 'Disable' : 'Enable'}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: rule.enabled ? '#36B37E' : '#8A94A6', padding: 0, lineHeight: 0 }}
                    >
                      {rule.enabled ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                    </button>
                    <button
                      onClick={() => runAutomation(rule)}
                      disabled={!rule.enabled || busyRuleId === rule.id}
                      title="Run now"
                      style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: rule.enabled ? '#0052CC' : '#E8EAED', color: rule.enabled ? 'white' : '#B0B7C3', cursor: rule.enabled ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {busyRuleId === rule.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
