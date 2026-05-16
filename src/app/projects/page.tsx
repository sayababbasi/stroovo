"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Folder, FolderCheck, AlertTriangle, CheckCircle,
  TrendingUp, Search, SlidersHorizontal, ChevronDown,
  Star, MoreVertical, LayoutGrid, List, Clock, ShieldAlert,
  Zap, Calendar, ChevronRight, CheckSquare, Activity, Settings
} from 'lucide-react';

// MOCK DATA GENERATOR FOR REAL-TIME SIMULATION
const initialProjects = [
  { id: '1', name: 'E-Commerce Platform', desc: 'Build next-gen e-commerce solution', owner: 'Ali Raza', ownerAvatar: 'https://i.pravatar.cc/150?u=ali', status: 'Active', progress: 64, health: 'Good', healthColor: '#10B981', endStr: 'May 30, 2026', endSub: 'in 25 days', team: ['https://i.pravatar.cc/150?u=t1', 'https://i.pravatar.cc/150?u=t2', 'https://i.pravatar.cc/150?u=t3'], lastUpdated: '2h ago', starred: true },
  { id: '2', name: 'Mobile Application', desc: 'Cross-platform mobile app', owner: 'Sara Khan', ownerAvatar: 'https://i.pravatar.cc/150?u=sara', status: 'Active', progress: 48, health: 'At Risk', healthColor: '#EF4444', endStr: 'Jun 15, 2026', endSub: 'in 41 days', team: ['https://i.pravatar.cc/150?u=t4', 'https://i.pravatar.cc/150?u=t5', 'https://i.pravatar.cc/150?u=t6'], lastUpdated: '5h ago', starred: true },
  { id: '3', name: 'Internal Dashboard', desc: 'Analytics & reporting dashboard', owner: 'Usman Tariq', ownerAvatar: 'https://i.pravatar.cc/150?u=usman', status: 'Active', progress: 72, health: 'Good', healthColor: '#10B981', endStr: 'Jun 05, 2026', endSub: 'in 31 days', team: ['https://i.pravatar.cc/150?u=t7', 'https://i.pravatar.cc/150?u=t8'], lastUpdated: '1h ago', starred: true },
  { id: '4', name: 'Marketing Website Redesign', desc: 'Revamp corporate website', owner: 'Zainab Fatima', ownerAvatar: 'https://i.pravatar.cc/150?u=zainab', status: 'Planning', progress: 15, health: 'On Track', healthColor: '#3B82F6', endStr: 'Jul 10, 2026', endSub: 'in 66 days', team: ['https://i.pravatar.cc/150?u=t9'], lastUpdated: '1d ago', starred: false },
  { id: '5', name: 'CRM Integration', desc: 'Integrate CRM with existing tools', owner: 'Ahmed Hassan', ownerAvatar: 'https://i.pravatar.cc/150?u=ahmed', status: 'Active', progress: 55, health: 'At Risk', healthColor: '#EF4444', endStr: 'May 25, 2026', endSub: 'in 20 days', team: ['https://i.pravatar.cc/150?u=t10', 'https://i.pravatar.cc/150?u=t11'], lastUpdated: '3h ago', starred: true },
  { id: '6', name: 'AI Chatbot Development', desc: 'AI-powered customer support bot', owner: 'Ayesha Noor', ownerAvatar: 'https://i.pravatar.cc/150?u=ayesha', status: 'Active', progress: 38, health: 'On Track', healthColor: '#3B82F6', endStr: 'Jun 20, 2026', endSub: 'in 46 days', team: ['https://i.pravatar.cc/150?u=t12', 'https://i.pravatar.cc/150?u=t13'], lastUpdated: '6h ago', starred: false },
  { id: '7', name: 'Data Migration Project', desc: 'Migrate legacy data to new system', owner: 'Hamza Ali', ownerAvatar: 'https://i.pravatar.cc/150?u=hamza', status: 'On Hold', progress: 10, health: 'At Risk', healthColor: '#EF4444', endStr: 'Jul 01, 2026', endSub: 'in 57 days', team: ['https://i.pravatar.cc/150?u=t14'], lastUpdated: '2d ago', starred: false },
  { id: '8', name: 'Performance Optimization', desc: 'Improve system performance', owner: 'Bilal Ahmed', ownerAvatar: 'https://i.pravatar.cc/150?u=bilal', status: 'Completed', progress: 100, health: 'Excellent', healthColor: '#8B5CF6', endStr: 'Apr 20, 2026', endSub: 'Completed', team: ['https://i.pravatar.cc/150?u=t15', 'https://i.pravatar.cc/150?u=t16'], lastUpdated: '3d ago', starred: true },
];

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('All Projects');
  const [projects, setProjects] = useState(initialProjects);

  // Simulate Real-time Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProjects(prev => prev.map(p => {
        if (p.status === 'Active' && Math.random() > 0.7) {
          const newProg = Math.min(100, p.progress + Math.floor(Math.random() * 3));
          return { ...p, progress: newProg, lastUpdated: 'Just now' };
        }
        return p;
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Sidebar />
      <style>{`
        .p-stat-card { background: white; border: 1px solid #DFE1E6; border-radius: 12px; padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 3px rgba(9,30,66,0.03); transition: all 0.2s; }
        .p-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(9,30,66,0.08); border-color: #C1C7D0; }
        .p-tab { padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; color: #6B778C; transition: all 0.2s; }
        .p-tab.active { color: #0052CC; border-bottom-color: #0052CC; }
        .p-tab:hover:not(.active) { color: #172B4D; }
        .p-table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
        .p-table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #6B778C; text-transform: uppercase; border-bottom: 1px solid #DFE1E6; background: #FAFBFC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .p-table td { padding: 12px; border-bottom: 1px solid #F4F5F7; vertical-align: middle; background: white; transition: background 0.2s; overflow: hidden; text-overflow: ellipsis; }
        .p-table tr:hover td { background: #FAFBFC; }
        .p-table tr:last-child td { border-bottom: none; }
        .p-table td:first-child { border-radius: 8px 0 0 8px; }
        .p-table td:last-child { border-radius: 0 8px 8px 0; }
        .p-avatar { width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; margin-left: -8px; }
        .p-avatar:first-child { margin-left: 0; }
        .btn-primary { background: #0052CC; color: white; border: none; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; alignItems: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: #0747A6; }
        .btn-secondary { background: white; color: #172B4D; border: 1px solid #DFE1E6; border-radius: 8px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 600; display: inline-flex; alignItems: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
        .btn-secondary:hover { background: #F4F5F7; }
        .status-pill { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; display: inline-block; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #C1C7D0; border-radius: 4px; }
      `}</style>

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* ── HEADER ── */}
        <div style={{ padding: '24px 32px 0 32px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172B4D', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Projects</h1>
              <p style={{ fontSize: 14, color: '#6B778C', margin: 0 }}>Manage all projects and deliver exceptional results.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#8A94A6" style={{ position: 'absolute', left: 12, top: 10 }} />
                <input type="text" placeholder="Search projects..." style={{ height: 36, paddingLeft: 36, paddingRight: 16, borderRadius: 8, border: '1px solid #DFE1E6', fontSize: 13, width: 240, outline: 'none' }} />
                <div style={{ position: 'absolute', right: 8, top: 8, background: '#F4F5F7', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#6B778C' }}>⌘K</div>
              </div>
              <button className="btn-secondary"><SlidersHorizontal size={14} /> Filters</button>
              <button className="btn-secondary">View: Active <ChevronDown size={14} color="#8A94A6" /></button>
              <button className="btn-primary"><Folder size={14} /> Create Project</button>
            </div>
          </div>

          {/* ── KPI CARDS ── */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { title: 'Total Projects', value: '24', sub: '↑ 4 from last month', icon: Folder, color: '#0052CC', bg: '#E6EFFF' },
              { title: 'Active Projects', value: '16', sub: '↑ 3 from last month', icon: FolderCheck, color: '#10B981', bg: '#D1FAE5' },
              { title: 'At Risk Projects', value: '3', sub: '↓ 1 from last month', icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2', subColor: '#EF4444' },
              { title: 'Completed Projects', value: '5', sub: '↑ 2 from last month', icon: CheckCircle, color: '#8B5CF6', bg: '#EDE9FE' },
              { title: 'On Track', value: '13', sub: '54% of total', icon: TrendingUp, color: '#10B981', bg: '#D1FAE5', isGraph: true }
            ].map(k => (
              <div key={k.title} className="p-stat-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <k.icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#6B778C' }}>{k.title}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#172B4D', lineHeight: 1.2, marginTop: 4 }}>{k.value}</div>
                    {!k.isGraph ? (
                      <div style={{ fontSize: 11, fontWeight: 600, color: k.subColor || '#36B37E', marginTop: 4 }}>{k.sub}</div>
                    ) : (
                      <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" style={{ marginTop: 4 }}>
                        <path d="M0,20 L20,15 L40,18 L60,8 L80,12 L100,2" fill="none" stroke="#10B981" strokeWidth="2" />
                        <circle cx="100" cy="2" r="3" fill="#10B981" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── TABS & FILTERS ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DFE1E6' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['All Projects', 'Starred', 'My Projects', 'Shared With Me', 'Archived'].map(t => (
                <div key={t} className={`p-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                Group: <span style={{ color: '#172B4D', background: '#F4F5F7', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>None <ChevronDown size={14} /></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#42526E', fontWeight: 600 }}>
                Sort: <span style={{ color: '#172B4D', background: '#F4F5F7', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>Recently Updated <ChevronDown size={14} /></span>
              </div>
              <button className="btn-secondary" style={{ padding: '0 8px', height: 28 }}><LayoutGrid size={14} /></button>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', gap: 24, minWidth: 0 }}>

          {/* ── MAIN AREA ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

            {/* PROJECT TABLE */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', boxShadow: '0 1px 3px rgba(9,30,66,0.03)', overflow: 'hidden', overflowX: 'auto', minHeight: '50vh' }}>
              <table className="p-table" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th style={{ width: '18%' }}>Project</th>
                    <th style={{ width: '12%' }}>Owner</th>
                    <th style={{ width: '8%' }}>Status</th>
                    <th style={{ width: '14%' }}>Progress</th>
                    <th style={{ width: '9%' }}>Health</th>
                    <th style={{ width: '12%' }}>End Date</th>
                    <th style={{ width: '10%' }}>Team</th>
                    <th style={{ width: '10%' }}>Updated</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} onClick={() => window.location.href = `/projects/${p.id}`} style={{ cursor: 'pointer' }}>
                      <td style={{ textAlign: 'center' }}>
                        <Star size={16} fill={p.starred ? "#F59E0B" : "none"} color={p.starred ? "#F59E0B" : "#C1C7D0"} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#172B4D', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ color: '#6B778C', fontSize: 11, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.desc}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={p.ownerAvatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{p.owner}</span>
                        </div>
                      </td>
                      <td>
                        <span className="status-pill" style={{
                          background: p.status === 'Active' ? '#E6EFFF' : p.status === 'Completed' ? '#EDE9FE' : p.status === 'Planning' ? '#E3FCEF' : '#F4F5F7',
                          color: p.status === 'Active' ? '#0052CC' : p.status === 'Completed' ? '#8B5CF6' : p.status === 'Planning' ? '#006644' : '#42526E'
                        }}>{p.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: '#EBECF0', borderRadius: 3 }}>
                            <div style={{ width: `${p.progress}%`, height: '100%', background: p.status === 'Completed' ? '#8B5CF6' : '#0052CC', borderRadius: 3, transition: 'width 0.5s ease' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#42526E', width: 32 }}>{p.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#172B4D' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.healthColor }} /> {p.health}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{p.endStr}</div>
                        <div style={{ fontSize: 11, color: '#6B778C', marginTop: 2 }}>{p.endSub}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex' }}>
                          {p.team.map((img, i) => (
                            <img key={i} src={img} alt="" className="p-avatar" style={{ zIndex: 10 - i }} />
                          ))}
                          {p.team.length > 3 && (
                            <div className="p-avatar" style={{ background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#42526E', zIndex: 1 }}>+2</div>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: '#6B778C', fontWeight: 500 }}>{p.lastUpdated}</td>
                      <td>
                        <div style={{ padding: 6, borderRadius: 6, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); }} className="hover:bg-gray-100">
                          <MoreVertical size={16} color="#8A94A6" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                <span style={{ fontSize: 12, color: '#6B778C', fontWeight: 600 }}>Showing 1 to 8 of 24 projects</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-secondary" style={{ width: 32, padding: 0, justifyContent: 'center' }}><ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /></button>
                  <button className="btn-primary" style={{ width: 32, padding: 0, justifyContent: 'center' }}>1</button>
                  <button className="btn-secondary" style={{ width: 32, padding: 0, justifyContent: 'center' }}>2</button>
                  <button className="btn-secondary" style={{ width: 32, padding: 0, justifyContent: 'center' }}>3</button>
                  <button className="btn-secondary" style={{ width: 32, padding: 0, justifyContent: 'center' }}><ChevronRight size={14} /></button>
                </div>
              </div>
            </div>

            {/* BOTTOM WIDGETS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

              {/* Recent Activity */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Recent Activity</h3>
                  <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { u: 'Ali Raza', a: 'updated project', p: 'E-Commerce Platform', t: '2h ago', img: 'https://i.pravatar.cc/150?u=ali' },
                    { u: 'Sara Khan', a: 'moved task to In Progress', p: 'Mobile Application', t: '5h ago', img: 'https://i.pravatar.cc/150?u=sara' },
                    { u: 'Usman Tariq', a: 'completed milestone', p: 'Internal Dashboard', t: '6h ago', img: 'https://i.pravatar.cc/150?u=usman' }
                  ].map((act, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <img src={act.img} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontSize: 12, color: '#42526E', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 700, color: '#172B4D' }}>{act.u}</span> {act.a} <br />
                          <span style={{ fontWeight: 600 }}>{act.p}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#8A94A6', marginTop: 4 }}>{act.t}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects Timeline (Gantt Mini) */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Projects Timeline</h3>
                  <button className="btn-secondary" style={{ height: 28, fontSize: 11 }}>This Month <ChevronDown size={12} /></button>
                </div>
                <div style={{ position: 'relative', height: 160, borderLeft: '1px solid #DFE1E6', borderBottom: '1px solid #DFE1E6' }}>
                  {/* Grid Lines */}
                  {[20, 40, 60, 80].map(p => (
                    <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, borderLeft: '1px dashed #EBECF0' }} />
                  ))}
                  {/* Today Line */}
                  <div style={{ position: 'absolute', left: '45%', top: 0, bottom: 0, borderLeft: '2px solid #0052CC', zIndex: 5 }}>
                    <div style={{ position: 'absolute', top: -20, left: -20, background: '#0052CC', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>Today</div>
                  </div>
                  {/* Bars */}
                  {[
                    { n: 'E-Commerce Platform', top: 20, l: 10, w: 40, c: '#0052CC', p: 'Planning' },
                    { n: 'Mobile Application', top: 60, l: 30, w: 50, c: '#F59E0B', p: 'Development' },
                    { n: 'CRM Integration', top: 100, l: 20, w: 30, c: '#EF4444', p: 'Integration' },
                    { n: 'AI Chatbot', top: 140, l: 50, w: 40, c: '#0052CC', p: 'Training' }
                  ].map((b, i) => (
                    <div key={i} style={{ position: 'absolute', top: b.top, left: 0, right: 0, height: 24, display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 120, fontSize: 11, fontWeight: 600, color: '#42526E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{b.n}</div>
                      <div style={{ position: 'relative', flex: 1, height: '100%' }}>
                        <div style={{ position: 'absolute', left: `${b.l}%`, width: `${b.w}%`, height: 24, background: b.c, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px', color: 'white', fontSize: 10, fontWeight: 700 }}>
                          {b.p}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Distribution */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: '0 0 16px 0', alignSelf: 'flex-start' }}>Health Distribution</h3>
                <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 16 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="42 58" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="29 71" strokeDashoffset="-42" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="13 87" strokeDashoffset="-71" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="8 92" strokeDashoffset="-84" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="8 92" strokeDashoffset="-92" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>24</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#6B778C' }}>Total Projects</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', fontSize: 11, color: '#42526E', fontWeight: 600 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />Good</span><span>10 (42%)</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />On Track</span><span>7 (29%)</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />At Risk</span><span>3 (13%)</span></div>
                </div>
              </div>

              {/* Top Performers */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Top Performers</h3>
                  <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { p: 'E-Commerce Platform', s: 86, c: '#0052CC' },
                    { p: 'Internal Dashboard', s: 82, c: '#10B981' },
                    { p: 'Performance Opt...', s: 100, c: '#8B5CF6' }
                  ].map((tp, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#172B4D', marginBottom: 6 }}>
                        <span>{tp.p}</span>
                        <span style={{ color: tp.c }}>{tp.s}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#EBECF0', borderRadius: 3 }}>
                        <div style={{ width: `${tp.s}%`, height: '100%', background: tp.c, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT SIDEBAR (AI ASSISTANT) ── */}
          <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* AI Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="#8B5CF6" />
              <span style={{ fontSize: 16, fontWeight: 800, color: '#172B4D' }}>AI Project Assistant</span>
              <span style={{ fontSize: 10, background: '#EDE9FE', color: '#8B5CF6', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Beta</span>
            </div>

            {/* AI Insights Boxes */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0' }}>AI Insights</h4>

              <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderLeft: '3px solid #EF4444', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <AlertTriangle size={14} color="#EF4444" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#BF2600' }}>3 projects are at risk</span>
                </div>
                <p style={{ fontSize: 12, color: '#42526E', margin: '0 0 12px 0', lineHeight: 1.4 }}>Mobile Application, CRM Integration and Data Migration need attention.</p>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View analysis →</a>
              </div>

              <div style={{ background: '#FFF7E6', border: '1px solid #FFF1C6', borderLeft: '3px solid #F59E0B', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Clock size={14} color="#F59E0B" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#974F0C' }}>2 projects behind schedule</span>
                </div>
                <p style={{ fontSize: 12, color: '#42526E', margin: '0 0 12px 0', lineHeight: 1.4 }}>They may miss the deadline by 4-7 days.</p>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View details →</a>
              </div>

              <div style={{ background: '#E3FCEF', border: '1px solid #D3F9E8', borderLeft: '3px solid #10B981', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <CheckSquare size={14} color="#10B981" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#006644' }}>E-Commerce Platform</span>
                </div>
                <p style={{ fontSize: 12, color: '#42526E', margin: '0 0 12px 0', lineHeight: 1.4 }}>On track to complete ahead of schedule.</p>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View prediction →</a>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #DFE1E6', padding: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0' }}>Quick Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { l: 'Create Project', i: Folder },
                  { l: 'Import Project', i: Calendar },
                  { l: 'Project Templates', i: LayoutGrid },
                  { l: 'AI Auto Plan', i: Zap, c: '#8B5CF6' },
                  { l: 'Project Report', i: Activity }
                ].map(a => (
                  <div key={a.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#FAFBFC', borderRadius: 8, cursor: 'pointer', border: '1px solid transparent', transition: 'border 0.2s' }} className="hover:border-gray-300">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a.i size={16} color={a.c || "#6B778C"} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{a.l}</span>
                    </div>
                    <ChevronRight size={14} color="#C1C7D0" />
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
