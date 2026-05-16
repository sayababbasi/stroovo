"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Calendar, ChevronDown, MoreHorizontal, Sparkles, Plus,
  Target, Clock, AlertTriangle, Users, Activity,
  Layout, AlignLeft, BarChart2, Filter, Zap, LayoutList,
  AlertCircle, ArrowRight, X, TrendingUp, CheckCircle, ChevronRight,
  MoreVertical, Settings, Database, MoveRight, Maximize2, ShieldAlert
} from 'lucide-react';

// --- MOCK DATA ---

const kanbanData = {
  Backlog: [
    { id: 1, title: 'User Authentication Module', type: 'Feature', typeC: '#0052CC', sp: 8, p: 'P2', assign: 'https://i.pravatar.cc/150?u=sara' },
    { id: 2, title: 'Landing Page Redesign', type: 'UI/UX', typeC: '#8B5CF6', sp: 5, p: 'P3', assign: 'https://i.pravatar.cc/150?u=ali' },
    { id: 3, title: 'Payment Gateway Integration', type: 'Feature', typeC: '#0052CC', sp: 8, p: 'P1', assign: 'https://i.pravatar.cc/150?u=hamza' },
  ],
  ToDo: [
    { id: 4, title: 'API Rate Limiting', type: 'Improvement', typeC: '#10B981', sp: 3, p: 'P2', assign: 'https://i.pravatar.cc/150?u=ali' },
    { id: 5, title: 'Email Notification System', type: 'Feature', typeC: '#0052CC', sp: 5, p: 'P2', assign: 'https://i.pravatar.cc/150?u=zainab' },
    { id: 6, title: 'Dashboard Analytics Widgets', type: 'UI/UX', typeC: '#8B5CF6', sp: 5, p: 'P3', assign: 'https://i.pravatar.cc/150?u=sara' },
  ],
  InProgress: [
    { id: 7, title: 'Performance Optimization', type: 'Improvement', typeC: '#10B981', sp: 8, risk: 'High', assign: 'https://i.pravatar.cc/150?u=ali' },
    { id: 8, title: 'Mobile Responsiveness Fixes', type: 'Bug', typeC: '#EF4444', sp: 3, risk: 'Medium', assign: 'https://i.pravatar.cc/150?u=hamza' },
    { id: 9, title: 'User Profile Enhancements', type: 'Feature', typeC: '#0052CC', sp: 5, risk: 'Medium', assign: 'https://i.pravatar.cc/150?u=usman' },
  ],
  Review: [
    { id: 10, title: 'Unit Test Coverage Improvement', type: 'Improvement', typeC: '#10B981', sp: 5, risk: 'Medium', assign: 'https://i.pravatar.cc/150?u=sara' },
    { id: 11, title: 'Form Validation Enhancements', type: 'Bug', typeC: '#EF4444', sp: 3, risk: 'Medium', assign: 'https://i.pravatar.cc/150?u=zainab' },
    { id: 12, title: 'Security Vulnerability Fixes', type: 'Bug', typeC: '#EF4444', sp: 5, risk: 'High', assign: 'https://i.pravatar.cc/150?u=usman' },
  ],
  Done: [
    { id: 13, title: 'Project Setup and Structure', type: 'Chore', typeC: '#6B778C', sp: 3, done: true, assign: 'https://i.pravatar.cc/150?u=ali' },
    { id: 14, title: 'Database Schema Design', type: 'Chore', typeC: '#6B778C', sp: 5, done: true, assign: 'https://i.pravatar.cc/150?u=hamza' },
    { id: 15, title: 'Login Page UI Design', type: 'UI/UX', typeC: '#8B5CF6', sp: 3, done: true, assign: 'https://i.pravatar.cc/150?u=sara' },
  ]
};

const TaskCard = ({ t }: { t: any }) => (
  <div className="s-card" style={{ padding: '14px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'grab', background: 'white', border: '1px solid #DFE1E6', borderRadius: '8px', boxShadow: '0 1px 2px rgba(9,30,66,0.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', margin: '0 0 6px 0', lineHeight: 1.4 }}>{t.title}</h4>
        <span style={{ fontSize: '10px', fontWeight: 700, color: t.typeC, padding: '2px 6px', borderRadius: '4px', background: `${t.typeC}15` }}>{t.type}</span>
      </div>
      <MoreVertical size={14} color="#8A94A6" style={{ cursor: 'pointer' }} />
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
      <img src={t.assign} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 600, color: '#6B778C' }}>
          <Database size={12} /> {t.sp} SP
        </span>
        {t.p && (
          <span style={{ fontSize: '11px', fontWeight: 700, color: t.p === 'P1' ? '#EF4444' : t.p === 'P2' ? '#F59E0B' : '#0052CC', background: '#F4F5F7', padding: '2px 6px', borderRadius: '4px' }}>{t.p}</span>
        )}
        {t.risk && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 700, color: t.risk === 'High' ? '#BF2600' : '#974F0C', background: t.risk === 'High' ? '#FFF0F0' : '#FFFAE6', padding: '2px 6px', borderRadius: '4px' }}>
            <AlertTriangle size={10} /> {t.risk} Risk
          </span>
        )}
        {t.done && (
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#36B37E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={10} />
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function SprintPlanningPage() {
  const [activeTab, setActiveTab] = useState('board');

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Sidebar />
      <style>{`
        .s-panel { background: white; border: 1px solid #DFE1E6; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(9,30,66,.04); }
        .s-tab { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 6px; border: 1px solid transparent; transition: all 0.2s; }
        .s-tab.active { background: white; border-color: #DFE1E6; color: #0052CC; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .s-tab:not(.active) { color: #6B778C; }
        .s-tab:not(.active):hover { background: rgba(9,30,66,.04); color: #172B4D; }
        .k-col { background: #F4F5F7; border-radius: 8px; width: 280px; flex-shrink: 0; display: flex; flex-direction: column; max-height: 100%; }
        .k-header { padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #DFE1E6; }
        .k-body { padding: 10px; overflow-y: auto; flex: 1; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 4px; }
      `}</style>

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* ── HEADER ── */}
        <div style={{ padding: '20px 28px', background: 'white', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', letterSpacing: '-0.3px', margin: 0 }}>Sprint Planning</h1>
            <p style={{ fontSize: 13, color: '#6B778C', margin: '4px 0 0 0' }}>Plan smarter. Execute better. Deliver more.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, padding: '0 12px', height: 34, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#172B4D', cursor: 'pointer' }}>
              Sprint 12 (Active) <ChevronDown size={14} color="#8A94A6" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, padding: '0 12px', height: 34, gap: 8, fontSize: 13, fontWeight: 500, color: '#42526E' }}>
              <Calendar size={14} color="#8A94A6" /> May 12 – May 25, 2026
            </div>
            <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E', cursor: 'pointer' }}>
              <MoreHorizontal size={14} />
            </button>
            <button style={{ background: '#E6EFFF', border: 'none', borderRadius: 8, padding: '0 16px', height: 34, display: 'flex', alignItems: 'center', gap: 6, color: '#0052CC', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Sparkles size={14} /> Optimize Sprint
            </button>
            <button style={{ background: '#0052CC', border: 'none', borderRadius: 8, padding: '0 16px', height: 34, display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,82,204,0.2)' }}>
              <Plus size={14} /> Add Task <ChevronDown size={14} style={{ opacity: 0.8 }} />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT AREA ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* ── KPI CARDS ── */}
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { t: 'Sprint Progress', v: '56%', s: '28 / 50 Story Points', i: Target, c: '#0052CC', bg: '#E6EFFF', chart: true, prog: 56 },
              { t: 'Completion Forecast', v: '72%', s: 'May 25 ± 2 days', i: Clock, c: '#3B82F6', bg: '#EFF6FF', trend: true },
              { t: 'At Risk Tasks', v: '6', s: '2 High • 4 Medium', i: AlertTriangle, c: '#EF4444', bg: '#FEE2E2', sC: '#BF2600' },
              { t: 'Team Capacity', v: '84%', s: '336h / 400h', i: Users, c: '#F59E0B', bg: '#FEF3C7' },
              { t: 'Execution Score', v: '76', s: 'Good', i: Activity, c: '#10B981', bg: '#D1FAE5', sC: '#006644' },
            ].map(k => (
              <div key={k.t} className="s-panel" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: k.bg, color: k.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <k.i size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6B778C' }}>{k.t}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', lineHeight: 1.2, marginTop: 2 }}>{k.v}</div>
                  </div>
                </div>
                {k.chart && (
                  <div style={{ width: '100%', height: 4, background: '#EBECF0', borderRadius: 2 }}>
                    <div style={{ width: `${k.prog}%`, height: '100%', background: k.c, borderRadius: 2 }} />
                  </div>
                )}
                {k.trend && (
                  <svg width="100%" height="16" viewBox="0 0 100 16" preserveAspectRatio="none" style={{ marginTop: -4 }}>
                    <path d="M0,12 L20,8 L40,10 L60,4 L80,6 L100,0" fill="none" stroke="#36B37E" strokeWidth="2" />
                  </svg>
                )}
                <div style={{ fontSize: 11, color: k.sC || '#6B778C', fontWeight: 600 }}>{k.s}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 600 }}>
            
            {/* ── MAIN WORKSPACE ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              
              {/* ── TOOLBAR ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', background: '#F4F5F7', padding: 4, borderRadius: 10 }}>
                  <div className={`s-tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}><Layout size={14} /> Board</div>
                  <div className={`s-tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}><AlignLeft size={14} /> Timeline</div>
                  <div className={`s-tab ${activeTab === 'capacity' ? 'active' : ''}`} onClick={() => setActiveTab('capacity')}><Users size={14} /> Capacity</div>
                  <div className={`s-tab ${activeTab === 'backlog' ? 'active' : ''}`} onClick={() => setActiveTab('backlog')}><LayoutList size={14} /> Backlog</div>
                  <div className={`s-tab ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}><BarChart2 size={14} /> Insights</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#172B4D', cursor: 'pointer' }}>
                    Group by: Status <ChevronDown size={14} color="#8A94A6" />
                  </button>
                  <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#172B4D', cursor: 'pointer' }}>
                    <Filter size={14} color="#8A94A6" /> Filters
                  </button>
                </div>
              </div>

              {/* ── KANBAN BOARD ── */}
              {activeTab === 'board' && (
                <div style={{ minHeight: 600, display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
                  
                  {/* BACKLOG */}
                  <div className="k-col">
                    <div className="k-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8A94A6' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Backlog</span>
                        <span style={{ fontSize: 11, background: '#EBECF0', padding: '2px 6px', borderRadius: 10, color: '#42526E', fontWeight: 600 }}>8</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600 }}>28 SP</span>
                    </div>
                    <div className="k-body">
                      {kanbanData.Backlog.map(t => <TaskCard key={t.id} t={t} />)}
                      <div style={{ textAlign: 'center', padding: '8px', fontSize: 11, color: '#6B778C', fontWeight: 600 }}>+ 5 more tasks</div>
                    </div>
                  </div>

                  {/* TO DO */}
                  <div className="k-col">
                    <div className="k-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0052CC' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>To Do</span>
                        <span style={{ fontSize: 11, background: '#EBECF0', padding: '2px 6px', borderRadius: 10, color: '#42526E', fontWeight: 600 }}>7</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600 }}>21 SP</span>
                    </div>
                    <div className="k-body">
                      {kanbanData.ToDo.map(t => <TaskCard key={t.id} t={t} />)}
                      <div style={{ textAlign: 'center', padding: '8px', fontSize: 11, color: '#6B778C', fontWeight: 600 }}>+ 4 more tasks</div>
                    </div>
                  </div>

                  {/* IN PROGRESS */}
                  <div className="k-col" style={{ background: '#FFF7E6', border: '1px solid #FFE380' }}>
                    <div className="k-header" style={{ borderBottomColor: '#FFE380' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>In Progress</span>
                        <span style={{ fontSize: 11, background: '#FFE380', padding: '2px 6px', borderRadius: 10, color: '#974F0C', fontWeight: 600 }}>5</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#974F0C', fontWeight: 600 }}>18 SP</span>
                    </div>
                    <div className="k-body">
                      {kanbanData.InProgress.map(t => <TaskCard key={t.id} t={t} />)}
                    </div>
                  </div>

                  {/* REVIEW */}
                  <div className="k-col">
                    <div className="k-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Review</span>
                        <span style={{ fontSize: 11, background: '#EBECF0', padding: '2px 6px', borderRadius: 10, color: '#42526E', fontWeight: 600 }}>3</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600 }}>8 SP</span>
                    </div>
                    <div className="k-body">
                      {kanbanData.Review.map(t => <TaskCard key={t.id} t={t} />)}
                    </div>
                  </div>

                  {/* DONE */}
                  <div className="k-col">
                    <div className="k-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#36B37E' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Done</span>
                        <span style={{ fontSize: 11, background: '#EBECF0', padding: '2px 6px', borderRadius: 10, color: '#42526E', fontWeight: 600 }}>12</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600 }}>23 SP</span>
                    </div>
                    <div className="k-body">
                      {kanbanData.Done.map(t => <TaskCard key={t.id} t={t} />)}
                      <div style={{ textAlign: 'center', padding: '8px', fontSize: 11, color: '#6B778C', fontWeight: 600 }}>+ 9 more tasks</div>
                    </div>
                  </div>

                </div>
              )}
              
              {/* Other Views Placeholder */}
              {activeTab !== 'board' && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC', border: '1px dashed #DFE1E6', borderRadius: 12 }}>
                  <p style={{ color: '#6B778C', fontWeight: 600 }}>Switch to Board view for full demo. {activeTab} view in development.</p>
                </div>
              )}

              {/* ── CHARTS SECTION ── */}
              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                
                <div className="s-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0' }}>Burndown Chart</h4>
                  <div style={{ flex: 1, position: 'relative', minHeight: 120 }}>
                    {/* Simplified mock chart */}
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,10 L100,90" fill="none" stroke="#DFE1E6" strokeWidth="1" strokeDasharray="4,4" />
                      <path d="M0,10 L20,15 L40,40 L60,50 L80,55" fill="none" stroke="#0052CC" strokeWidth="2" />
                      <circle cx="80" cy="55" r="3" fill="#0052CC" />
                    </svg>
                  </div>
                </div>

                <div className="s-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0' }}>Velocity <span style={{ color: '#36B37E', float: 'right' }}>42 SP</span></h4>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                    {[28, 34, 38, 42, 40].map((v, i) => (
                      <div key={i} style={{ width: '100%', background: i === 4 ? '#8B5CF6' : '#DFE1E6', height: `${v}%`, borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: i === 4 ? 'white' : '#6B778C', marginTop: 4 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 9, color: '#8A94A6', fontWeight: 600 }}>
                    <span>Sprint 8</span><span>Sprint 9</span><span>Sprint 10</span><span>Sprint 11</span><span>Sprint 12</span>
                  </div>
                </div>

                <div className="s-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0', alignSelf: 'flex-start' }}>Sprint Health</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', width: 70, height: 70 }}>
                      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EBECF0" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#36B37E" strokeWidth="3" strokeDasharray="76, 100" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>76</span>
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#36B37E' }}>Good</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 10, color: '#6B778C' }}>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}><span>Scope</span><span style={{ fontWeight: 600, color: '#172B4D' }}>70/100</span></div>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}><span>Progress</span><span style={{ fontWeight: 600, color: '#172B4D' }}>80/100</span></div>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}><span>Velocity</span><span style={{ fontWeight: 600, color: '#172B4D' }}>75/100</span></div>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}><span>Quality</span><span style={{ fontWeight: 600, color: '#172B4D' }}>80/100</span></div>
                    </div>
                  </div>
                </div>

                <div className="s-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0', alignSelf: 'flex-start' }}>Task Status</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', width: 70, height: 70 }}>
                      {/* Segmented Donut */}
                      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#36B37E" strokeWidth="4" strokeDasharray="34 66" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="14 86" strokeDashoffset="-34" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0052CC" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-48" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8A94A6" strokeWidth="4" strokeDasharray="23 77" strokeDashoffset="-68" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="9 91" strokeDashoffset="-91" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>35</span>
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#6B778C' }}>Total</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 9, color: '#6B778C' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#36B37E' }}/>Done 12 (34%)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }}/>In Progress 5 (14%)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0052CC' }}/>To Do 7 (20%)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8A94A6' }}/>Backlog 8 (23%)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }}/>Review 3 (9%)</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── TASKS AT RISK TABLE ── */}
              <div className="s-panel" style={{ marginTop: 24, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Tasks at Risk <AlertCircle size={14} color="#8A94A6" />
                  </h4>
                  <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all at risk tasks →</a>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #DFE1E6' }}>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Task</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Assignee</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Risk Level</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Impact</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Reason</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase' }}>Predicted Delay</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { t: 'Performance Optimization', a: { n: 'Ali Raza', p: 'https://i.pravatar.cc/150?u=ali' }, s: 'In Progress', sC: '#F59E0B', r: 'High', rC: '#EF4444', i: 'High', res: 'Overloaded assignee, complex task', d: '+2 days', ac: 'Reassign' },
                      { t: 'Security Vulnerability Fixes', a: { n: 'Usman Tariq', p: 'https://i.pravatar.cc/150?u=usman' }, s: 'Review', sC: '#8B5CF6', r: 'High', rC: '#EF4444', i: 'High', res: 'Waiting for code review', d: '+1 day', ac: 'View' },
                      { t: 'Mobile Responsiveness Fixes', a: { n: 'Sara Khan', p: 'https://i.pravatar.cc/150?u=sara' }, s: 'In Progress', sC: '#F59E0B', r: 'Medium', rC: '#F59E0B', i: 'Medium', res: 'Dependency on API changes', d: '+1 day', ac: 'View' },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: i === 2 ? 'none' : '1px solid #F4F5F7' }}>
                        <td style={{ padding: '12px 8px', fontSize: 12, fontWeight: 600, color: '#172B4D' }}>{row.t}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <img src={row.a.p} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                            <span style={{ fontSize: 12, color: '#42526E', fontWeight: 500 }}>{row.a.n}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: row.sC }} />
                            <span style={{ fontSize: 12, color: '#42526E', fontWeight: 500 }}>{row.s}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: row.rC === '#EF4444' ? '#BF2600' : '#974F0C', background: row.rC === '#EF4444' ? '#FFF0F0' : '#FFFAE6', padding: '2px 6px', borderRadius: 4 }}>
                            <AlertTriangle size={10} /> {row.r}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12, color: '#42526E', fontWeight: 500 }}>{row.i}</td>
                        <td style={{ padding: '12px 8px', fontSize: 12, color: '#42526E' }}>{row.res}</td>
                        <td style={{ padding: '12px 8px', fontSize: 12, fontWeight: 700, color: '#EF4444' }}>{row.d}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: '#42526E', cursor: 'pointer' }}>{row.ac}</button>
                            <MoreVertical size={14} color="#8A94A6" style={{ cursor: 'pointer' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* ── RIGHT PANEL (INTELLIGENCE) ── */}
            <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0 }}>
              
              <div className="s-panel" style={{ padding: '16px 20px', background: '#FAFBFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Sparkles size={16} color="#8B5CF6" />
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#172B4D' }}>Sprint Intelligence</span>
                </div>

                {/* Risk Warning */}
                <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderLeft: '3px solid #EF4444', borderRadius: 8, padding: '12px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldAlert size={14} color="#EF4444" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#BF2600' }}>Sprint at Risk</span>
                    </div>
                    <span style={{ fontSize: 10, background: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>High</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#42526E', margin: '0 0 12px 0', lineHeight: 1.4 }}>Sprint may miss the deadline by 2-3 days.</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 4, background: '#EBECF0', borderRadius: 2 }}>
                      <div style={{ width: '72%', height: '100%', background: '#EF4444', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#172B4D' }}>72%</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B778C', marginBottom: 12 }}>72% probability</div>
                  
                  <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View analysis →</a>
                </div>

                {/* Top Issues */}
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 10px 0' }}>Top Issues</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#172B4D', fontWeight: 500 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} /> 5 tasks are blocked
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#172B4D', fontWeight: 500 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} /> Ali is overloaded (136%)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#172B4D', fontWeight: 500 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} /> Review stage bottleneck
                    </li>
                  </ul>
                  <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>View all issues →</a>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="#0052CC" /> Recommendations
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ background: 'white', border: '1px solid #DFE1E6', padding: '10px 12px', borderRadius: 8, fontSize: 12, color: '#0052CC', fontWeight: 600, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                      Move 3 tasks to next sprint <ChevronRight size={14} />
                    </div>
                    <div style={{ background: 'white', border: '1px solid #DFE1E6', padding: '10px 12px', borderRadius: 8, fontSize: 12, color: '#0052CC', fontWeight: 600, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                      Reassign 2 tasks from Ali <ChevronRight size={14} />
                    </div>
                    <div style={{ background: 'white', border: '1px solid #DFE1E6', padding: '10px 12px', borderRadius: 8, fontSize: 12, color: '#0052CC', fontWeight: 600, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                      Reduce scope by 8 story points <ChevronRight size={14} />
                    </div>
                  </div>
                  <button style={{ width: '100%', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                    <Zap size={14} /> Apply All
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="s-panel" style={{ padding: '16px 20px' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 16px 0' }}>Quick Actions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { l: 'Rebalance Workload', i: Users, c: '#0052CC' },
                    { l: 'Optimize Sprint', i: Sparkles, c: '#8B5CF6' },
                    { l: 'Adjust Scope', i: Target, c: '#F59E0B' },
                    { l: 'Create Task', i: Plus, c: '#10B981' },
                    { l: 'Move to Backlog', i: ArrowRight, c: '#6B778C' },
                    { l: 'Extend Sprint', i: Calendar, c: '#0052CC' },
                  ].map(a => (
                    <div key={a.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F4F5F7', color: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <a.i size={16} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#42526E', lineHeight: 1.2 }}>{a.l}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
