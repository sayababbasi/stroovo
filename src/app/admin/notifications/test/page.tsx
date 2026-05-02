'use client';

import { useState, useEffect } from 'react';
import styles from './test.module.css';

export default function NotificationTestPage() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/notifications/test');
      const data = await res.json();
      setScenarios(data.scenarios || []);
      setResults(data.results || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Failed to fetch test data:', error);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications/test', {
        method: 'POST',
      });
      const data = await res.json();
      await fetchData();
    } catch (error) {
      console.error('Failed to run all tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const runScenario = async (scenarioId: string) => {
    setRunningId(scenarioId);
    try {
      const res = await fetch('/api/admin/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
      await fetchData();
    } catch (error) {
      console.error(`Failed to run scenario ${scenarioId}:`, error);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Notification Intelligence Lab</h1>
        <p>Test and verify your multi-channel notification systems and AI routing.</p>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.mainAction} 
          onClick={runAllTests}
          disabled={loading}
        >
          {loading ? 'Running Suite...' : '🚀 Run Full Test Suite'}
        </button>
      </div>

      <div className={styles.dashboard}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>🛠️</span> Test Scenarios
          </div>
          <div className={styles.scenarioList}>
            {scenarios.map((scenario) => (
              <div key={scenario.id} className={styles.scenarioItem}>
                <div className={styles.scenarioInfo}>
                  <h3>
                    {scenario.name}
                    <span className={`${styles.priority} ${styles[scenario.priority]}`}>
                      {scenario.priority}
                    </span>
                  </h3>
                  <p>{scenario.description}</p>
                </div>
                <button 
                  className={styles.runBtn}
                  onClick={() => runScenario(scenario.id)}
                  disabled={loading || runningId === scenario.id}
                >
                  {runningId === scenario.id ? '...' : 'Run Test'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.card} style={{ marginBottom: '30px' }}>
            <div className={styles.cardTitle}>
              <span>📊</span> System Status
            </div>
            {summary ? (
              <div className={styles.stats}>
                <div className={styles.statItem} style={{ background: '#f0fff4' }}>
                  <div className={styles.statValue} style={{ color: '#2f855a' }}>{summary.passed}</div>
                  <div className={styles.statLabel}>Passed</div>
                </div>
                <div className={styles.statItem} style={{ background: '#fff5f5' }}>
                  <div className={styles.statValue} style={{ color: '#c53030' }}>{summary.failed}</div>
                  <div className={styles.statLabel}>Failed</div>
                </div>
                <div className={styles.statItem} style={{ background: '#fffaf0', gridColumn: 'span 2' }}>
                  <div className={styles.statValue} style={{ color: '#c05621' }}>{summary.successRate.toFixed(1)}%</div>
                  <div className={styles.statLabel}>Success Rate</div>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#718096' }}>No tests run yet.</p>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span>📜</span> Recent Results
            </div>
            <div className={styles.resultsList}>
              {results.slice().reverse().map((result, idx) => (
                <div key={idx} className={`${styles.resultItem} ${styles[result.status]}`}>
                  <span>{result.scenarioName}</span>
                  <span className={styles.statusBadge}>{result.status}</span>
                </div>
              ))}
              {results.length === 0 && (
                <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px' }}>
                  Run a test to see results.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
