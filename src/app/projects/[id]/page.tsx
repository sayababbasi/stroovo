"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Star, ChevronDown, Share, MoreHorizontal, Plus,
  Layout, List as ListIcon, AlignLeft, Users, GitMerge,
  Filter, ArrowUpDown, MoreVertical, Database,
  AlertTriangle, Clock, Activity, Target, Zap, ShieldAlert,
  Calendar, CheckCircle, TrendingUp, Search, ChevronRight
} from 'lucide-react';

const kanbanData = {
  Backlog: [
    { id: 1, title: 'User Research & Analysis', type: 'Research', typeC: '#0052CC', sp: 8, date: 'Apr 28', assign: 'https://i.pravatar.cc/150?u=ali' },
    { id: 2, title: 'Competitor Benchmarking', type: 'Research', typeC: '#0052CC', sp: 5, date: 'Apr 30', assign: 'https://i.pravatar.cc/150?u=sara' },
    { id: 3, title: 'Market Trend Analysis', type: 'Research', typeC: '#0052CC', sp: 3, date: 'May 02', assign: 'https://i.pravatar.cc/150?u=usman' },
  ],
  ToDo: [
    { id: 4, title: 'UI/UX Wireframing', type: 'Design', typeC: '#8B5CF6', sp: 5, date: 'May 05', assign: 'https://i.pravatar.cc/150?u=zainab' },
    { id: 5, title: 'Database Schema Design', type: 'Backend', typeC: '#10B981', sp: 8, date: 'May 06', assign: 'https://i.pravatar.cc/150?u=ahmed' },
    { id: 6, title: 'API Documentation', type: 'Backend', typeC: '#10B981', sp: 3, date: 'May 07', assign: 'https://i.pravatar.cc/150?u=hamza' },
  ],
  InProgress: [
    { id: 7, title: 'User Authentication', type: 'Backend', typeC: '#10B981', sp: 8, risk: 'High Risk', assign: 'https://i.pravatar.cc/150?u=ali' },
    { id: 8, title: 'Product Catalog API', type: 'Backend', typeC: '#10B981', sp: 5, date: 'May 15', assign: 'https://i.pravatar.cc/150?u=sara' },
    { id: 9, title: 'Shopping Cart Module', type: 'Backend', typeC: '#10B981', sp: 8, risk: 'Medium Risk', assign: 'https://i.pravatar.cc/150?u=usman' },
  ],
  Review: [
    { id: 10, title: 'Payment Gateway Integration', type: 'Backend', typeC: '#10B981', sp: 5, risk: 'Medium Risk', assign: 'https://i.pravatar.cc/150?u=zainab' },
    { id: 11, title: 'Order Management', type: 'Backend', typeC: '#10B981', sp: 8, date: 'May 18', assign: 'https://i.pravatar.cc/150?u=ahmed' },
    { id: 12, title: 'Email Notifications', type: 'Backend', typeC: '#10B981', sp: 3, date: 'May 19', assign: 'https://i.pravatar.cc/150?u=hamza' },
  ],
  Done: [
    { id: 13, title: 'Project Kickoff', type: 'Management', typeC: '#F59E0B', sp: 0, date: 'Apr 20', done: true, assign: 'https://i.pravatar.cc/150?u=ali' },
    { id: 14, title: 'Requirements Gathering', type: 'Management', typeC: '#F59E0B', sp: 0, date: 'Apr 22', done: true, assign: 'https://i.pravatar.cc/150?u=sara' },
    { id: 15, title: 'Tech Stack Finalization', type: 'Management', typeC: '#F59E0B', sp: 0, date: 'Apr 23', done: true, assign: 'https://i.pravatar.cc/150?u=usman' },
  ]
};

const TaskCard = ({ t }: { t: any }) => (
  <div style={{ padding: '14px', marginBottom: '10px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '8px', boxShadow: '0 1px 2px rgba(9,30,66,0.05)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
        {t.risk && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10px', fontWeight: 700, color: t.risk === 'High Risk' ? '#BF2600' : '#974F0C', background: t.risk === 'High Risk' ? '#FFF0F0' : '#FFFAE6', padding: '2px 6px', borderRadius: '4px' }}>
            <AlertTriangle size={10} /> {t.risk}
          </span>
        )}
        {!t.risk && !t.done && t.date && (
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B778C' }}>{t.date}</span>
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

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [viewTab, setViewTab] = useState('board');

  // Simulated Real-time State
  const [progress, setProgress] = useState(64);
  const [riskScore, setRiskScore] = useState(78);

  useEffect(() => {
    // Simulated AI Engine re-calculating risk/progress
    const interval = setInterval(() => {
      if(Math.random() > 0.6) {
        setProgress(prev => Math.min(100, prev + 1));
        setRiskScore(prev => Math.max(0, prev - 1));
      }
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Sidebar />
      <style>{`
        .p-panel { background: white; border: 1px solid #DFE1E6; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(9,30,66,.04); }
        .p-tab { padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; color: #6B778C; transition: all 0.2s; }
        .p-tab.active { color: #0052CC; border-bottom-color: #0052CC; }
        .p-tab:hover:not(.active) { color: #172B4D; }
        .v-tab { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 6px; border: 1px solid transparent; transition: all 0.2s; color: #6B778C; }
        .v-tab.active { background: white; border-color: #DFE1E6; color: #0052CC; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .btn-primary { background: #0052CC; color: white; border: none; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
        .btn-secondary { background: white; color: #172B4D; border: 1px solid #DFE1E6; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
        .k-col { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; }
        .k-header { padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; border: 1px solid #DFE1E6; border-bottom: none; background: white; }
        .k-body { padding: 10px; background: #F4F5F7; border: 1px solid #DFE1E6; border-top: none; border-radius: 0 0 8px 8px; min-height: 400px; display: flex; flex-direction: column; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 4px; }
      `}</style>

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* ── HEADER ── */}
        <div style={{ padding: '24px 32px 0 32px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', margin: 0 }}>Projects / E-Commerce Platform</h1>
                <Star size={18} color="#6B778C" style={{ cursor: 'pointer' }} />
              </div>
              <p style={{ fontSize: 13, color: '#6B778C', margin: 0 }}>Build a next-gen e-commerce platform with AI recommendations and real-time analytics.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#172B4D', background: 'white', border: '1px solid #DFE1E6', padding: '6px 12px', borderRadius: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> Active <ChevronDown size={14} color="#8A94A6" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {['https://i.pravatar.cc/150?u=ali', 'https://i.pravatar.cc/150?u=sara', 'https://i.pravatar.cc/150?u=usman'].map((img, i) => (
                  <img key={i} src={img} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid white', marginLeft: i > 0 ? -10 : 0 }} />
                ))}
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid white', marginLeft: -10, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#42526E', zIndex: 1 }}>+8</div>
              </div>
              <button className="btn-secondary"><Share size={14} /> Share</button>
              <button className="btn-secondary" style={{ padding: '0 8px' }}><MoreHorizontal size={16} /></button>
              <button className="btn-primary"><Plus size={14} /> Add Task <ChevronDown size={14} style={{ opacity: 0.8 }} /></button>
            </div>
          </div>

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #DFE1E6' }}>
            {['Overview', 'Tasks', 'Timeline', 'Files', 'Risks', 'Automation', 'Insights', 'Settings'].map(t => (
              <div key={t} className={`p-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>
            ))}
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', gap: 24 }}>
          
          {/* ── MAIN AREA ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            
            {/* KPI ROW */}
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Progress', val: `${progress}%`, sub: '164 / 256 tasks done', donut: progress, color: '#0052CC' },
                { label: 'Execution Score', val: '78', span: '/100', sub: 'Good', icon: Star, color: '#10B981', trend: true },
                { label: 'Risk Score', val: 'High', span: ` ${riskScore}%`, sub: '5 risks detected', icon: AlertTriangle, color: '#EF4444', alert: true },
                { label: 'Delay Prediction', val: '+5 days', sub: 'May 30, 2026 (Predicted)', icon: Clock, color: '#F59E0B' },
                { label: 'Team Load', val: '86%', sub: 'High Capacity', icon: Users, color: '#10B981' }
              ].map((k, i) => (
                <div key={i} className="p-panel" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6B778C', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {k.donut !== undefined && (
                        <div style={{ position: 'relative', width: 36, height: 36 }}>
                          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EBECF0" strokeWidth="4" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={k.color} strokeWidth="4" strokeDasharray={`${k.donut}, 100`} />
                          </svg>
                        </div>
                      )}
                      {k.icon && <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${k.color}15`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><k.icon size={14} /></div>}
                      {k.label}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: k.alert ? '#EF4444' : '#172B4D', lineHeight: 1 }}>
                      {k.val}<span style={{ fontSize: 14, color: k.alert ? '#EF4444' : '#8A94A6' }}>{k.span}</span>
                    </div>
                    {k.trend && (
                      <svg width="100%" height="16" viewBox="0 0 100 16" preserveAspectRatio="none" style={{ marginTop: 8 }}>
                        <path d="M0,12 L20,8 L40,10 L60,4 L80,6 L100,0" fill="none" stroke="#10B981" strokeWidth="2" />
                      </svg>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 600, color: k.alert ? '#EF4444' : '#6B778C', marginTop: k.trend ? 4 : 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {k.alert && <AlertTriangle size={10} />} {k.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VIEWS TOOLBAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: '#F4F5F7', padding: 4, borderRadius: 10 }}>
                <div className={`v-tab ${viewTab === 'board' ? 'active' : ''}`} onClick={() => setViewTab('board')}><Layout size={14} /> Board</div>
                <div className={`v-tab ${viewTab === 'list' ? 'active' : ''}`} onClick={() => setViewTab('list')}><ListIcon size={14} /> List</div>
                <div className={`v-tab ${viewTab === 'timeline' ? 'active' : ''}`} onClick={() => setViewTab('timeline')}><AlignLeft size={14} /> Timeline</div>
                <div className={`v-tab ${viewTab === 'workload' ? 'active' : ''}`} onClick={() => setViewTab('workload')}><Users size={14} /> Workload</div>
                <div className={`v-tab ${viewTab === 'dependencies' ? 'active' : ''}`} onClick={() => setViewTab('dependencies')}><GitMerge size={14} /> Dependencies</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" style={{ padding: '0 12px', height: 32 }}><Filter size={14} /> Filter <ChevronDown size={14} color="#8A94A6" /></button>
                <button className="btn-secondary" style={{ padding: '0 12px', height: 32 }}>Group: Status <ChevronDown size={14} color="#8A94A6" /></button>
                <button className="btn-secondary" style={{ padding: '0 12px', height: 32 }}><ArrowUpDown size={14} /> Sort</button>
                <button className="btn-secondary" style={{ padding: '0 8px', height: 32 }}><Layout size={14} /></button>
              </div>
            </div>

            {/* KANBAN BOARD */}
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10, minHeight: 480 }}>
              
              {/* Columns */}
              {[
                { id: 'Backlog', name: 'Backlog', count: 12, total: 12, color: '#8A94A6', data: kanbanData.Backlog },
                { id: 'ToDo', name: 'To Do', count: 8, total: 8, color: '#0052CC', data: kanbanData.ToDo },
                { id: 'InProgress', name: 'In Progress', count: 6, total: 16, color: '#F59E0B', data: kanbanData.InProgress, active: true },
                { id: 'Review', name: 'Review', count: 4, total: 4, color: '#8B5CF6', data: kanbanData.Review },
                { id: 'Done', name: 'Done', count: 16, total: 16, color: '#10B981', data: kanbanData.Done },
              ].map(col => (
                <div key={col.id} className="k-col">
                  <div className="k-header" style={{ borderColor: col.active ? '#F59E0B' : '#DFE1E6', background: col.active ? '#FFFBEB' : 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>{col.name}</span>
                      <span style={{ fontSize: 11, background: '#EBECF0', padding: '2px 6px', borderRadius: 10, color: '#42526E', fontWeight: 600 }}>{col.count}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600 }}>{col.total} SP</span>
                  </div>
                  <div className="k-body" style={{ borderColor: col.active ? '#F59E0B' : '#DFE1E6', background: col.active ? '#FFFBEB' : '#F4F5F7' }}>
                    {col.data.map(t => <TaskCard key={t.id} t={t} />)}
                    <button style={{ background: 'transparent', border: 'none', color: '#6B778C', fontSize: 12, fontWeight: 600, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
                      <Plus size={14} /> Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTTOM WIDGETS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              
              {/* Burndown */}
              <div className="p-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: 0 }}>Burndown Chart</h3>
                  <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>This Sprint <ChevronDown size={12} /></span>
                </div>
                <div style={{ flex: 1, position: 'relative', minHeight: 120 }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[20, 40, 60, 80].map(y => (
                      <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#EBECF0" strokeWidth="0.5" />
                    ))}
                    {/* Ideal */}
                    <path d="M0,20 L100,90" fill="none" stroke="#8A94A6" strokeWidth="1.5" strokeDasharray="4,4" />
                    {/* Actual */}
                    <path d="M0,20 L15,25 L30,45 L45,55 L60,65" fill="none" stroke="#0052CC" strokeWidth="2.5" />
                    <circle cx="60" cy="65" r="3" fill="#0052CC" />
                  </svg>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#8A94A6' }}>
                    <span>May 12</span><span>May 15</span><span>May 18</span><span>May 21</span><span>May 25</span>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 16px 0', alignSelf: 'flex-start' }}>Task Status Distribution</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="28 72" strokeDashoffset="-25" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="16 84" strokeDashoffset="-53" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0052CC" strokeWidth="4" strokeDasharray="19 81" strokeDashoffset="-69" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8A94A6" strokeWidth="4" strokeDasharray="12 88" strokeDashoffset="-88" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>256</span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#6B778C' }}>Total Tasks</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 10, color: '#6B778C', fontWeight: 600, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}/>Done</span><span>64 (25%)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }}/>In Progress</span><span>72 (28%)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }}/>Review</span><span>40 (16%)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0052CC' }}/>To Do</span><span>48 (19%)</span></div>
                  </div>
                </div>
              </div>

              {/* Sprint Velocity */}
              <div className="p-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: 0 }}>Sprint Velocity</h3>
                  <span style={{ fontSize: 11, color: '#6B778C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>This Sprint <ChevronDown size={12} /></span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#172B4D', lineHeight: 1, marginBottom: 4 }}>42 SP</div>
                <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginBottom: 16 }}>+12% vs last sprint</div>
                
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, position: 'relative' }}>
                  {[
                    { h: 40, v: 28 }, { h: 50, v: 34 }, { h: 55, v: 38 }, { h: 52, v: 37 }, { h: 65, v: 42, active: true }
                  ].map((b, i) => (
                    <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#6B778C' }}>{b.v}</span>
                      <div style={{ width: '100%', height: `${b.h}px`, background: b.active ? '#0052CC' : '#DFE1E6', borderRadius: '4px 4px 0 0' }} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#8A94A6' }}>S{i+8}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <h3 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: 0 }}>Upcoming Milestones</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {[
                     { m: 'M1: Core Platform', p: 75, d: 'May 20', c: '#10B981', s: 'In Progress' },
                     { m: 'M2: Payment Integration', p: 40, d: 'May 30', c: '#F59E0B', s: 'At Risk' },
                     { m: 'M3: Beta Release', p: 10, d: 'Jun 10', c: '#8A94A6', s: 'Upcoming' }
                   ].map((m, i) => (
                     <div key={i}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                         <span style={{ color: '#172B4D' }}>{m.m}</span>
                         <span style={{ color: m.c }}>{m.s}</span>
                       </div>
                       <div style={{ width: '100%', height: 4, background: '#EBECF0', borderRadius: 2 }}>
                         <div style={{ width: `${m.p}%`, height: '100%', background: m.c, borderRadius: 2 }} />
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT SIDEBAR (AI ASSISTANT) ── */}
          <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* AI Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="#0052CC" />
                <span style={{ fontSize: 16, fontWeight: 800, color: '#172B4D' }}>AI Project Assistant</span>
              </div>
              <span style={{ fontSize: 11, background: '#E6EFFF', color: '#0052CC', padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}>Stroovo AI</span>
            </div>

            {/* Project At Risk Alert */}
            <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} color="#EF4444" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#BF2600' }}>Project at Risk</span>
                </div>
                <span style={{ fontSize: 10, background: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>High</span>
              </div>
              <p style={{ fontSize: 13, color: '#172B4D', margin: '0 0 16px 0', lineHeight: 1.5, fontWeight: 500 }}>
                This project may miss the deadline by <strong>5 days</strong>.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 4, background: '#EBECF0', borderRadius: 2 }}>
                  <div style={{ width: '78%', height: '100%', background: '#EF4444', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#172B4D' }}>78%</span>
              </div>
              <div style={{ fontSize: 11, color: '#6B778C', marginBottom: 16 }}>78% probability</div>
              
              <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View full analysis →</a>
            </div>

            {/* Top Recommendations */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} color="#0052CC" /> Top Recommendations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  'Reassign 3 tasks from Ali (overloaded)',
                  'Accelerate API Development',
                  'Move 2 tasks to next sprint'
                ].map((rec, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #DFE1E6', padding: '12px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E6EFFF', color: '#0052CC', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>{rec}</span>
                    </div>
                    <ChevronRight size={14} color="#8A94A6" />
                  </div>
                ))}
              </div>
              <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: 16 }}>View all recommendations →</a>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#8B5CF6' }}>
                <Zap size={14} /> Apply All
              </button>
            </div>

            {/* Key Issues */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={14} color="#EF4444" /> Key Issues
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#172B4D', fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} /> 5 tasks are blocked
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#172B4D', fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} /> 2 dependencies are delayed
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#172B4D', fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} /> Ali is overloaded (142%)
                </li>
              </ul>
              <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all issues →</a>
            </div>

            {/* Quick Actions Grid */}
            <div className="p-panel" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 16px 0' }}>Quick Actions</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { l: 'Optimize Project', i: Zap, c: '#8B5CF6' },
                  { l: 'Rebalance Workload', i: Users, c: '#0052CC' },
                  { l: 'Adjust Timeline', i: Calendar, c: '#F59E0B' },
                  { l: 'Auto Plan Tasks', i: Target, c: '#10B981' },
                  { l: 'Add Milestone', i: Plus, c: '#6B778C' },
                  { l: 'Generate Report', i: Activity, c: '#0052CC' },
                ].map(a => (
                  <div key={a.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F4F5F7', color: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} className="hover:bg-gray-200">
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
    </main>
  );
}
