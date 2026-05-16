"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Search, Filter, Plus, ChevronDown, Activity, Clock, Calendar, AlertTriangle,
  Rocket, Smartphone, Users, Megaphone, Shield, Database, ChevronLeft, ChevronRight,
  Target, Zap, CheckCircle, LayoutList, DownloadCloud, Box, TrendingUp, AlertCircle
} from 'lucide-react';

const initiatives = [
  {
    id: 1,
    title: 'Product Platform Upgrade',
    desc: 'Improve core platform performance and reliability',
    owner: { name: 'Ali Raza', avatar: 'https://i.pravatar.cc/150?u=ali' },
    progress: 65,
    color: '#8B5CF6',
    icon: Rocket,
    startW: 18,
    endW: 31,
    milestone: 29
  },
  {
    id: 2,
    title: 'Mobile App Redesign',
    desc: 'Deliver intuitive and modern mobile experience',
    owner: { name: 'Sara Khan', avatar: 'https://i.pravatar.cc/150?u=sara' },
    progress: 40,
    color: '#10B981',
    icon: Smartphone,
    startW: 18,
    endW: 26,
    milestone: null
  },
  {
    id: 3,
    title: 'Customer Portal V2',
    desc: 'Self-service portal with advanced capabilities',
    owner: { name: 'Hamza Ali', avatar: 'https://i.pravatar.cc/150?u=hamza' },
    progress: 80,
    color: '#3B82F6',
    icon: Users,
    startW: 22,
    endW: 33,
    milestone: null
  },
  {
    id: 4,
    title: 'Marketing Expansion',
    desc: 'Expand brand reach and generate more leads',
    owner: { name: 'Zainab Fatima', avatar: 'https://i.pravatar.cc/150?u=zainab' },
    progress: 55,
    color: '#F59E0B',
    icon: Megaphone,
    startW: 22,
    endW: 30,
    milestone: 30
  },
  {
    id: 5,
    title: 'Security Enhancements',
    desc: 'Strengthen security and compliance',
    owner: { name: 'Usman Tariq', avatar: 'https://i.pravatar.cc/150?u=usman' },
    progress: 30,
    color: '#EF4444',
    icon: Shield,
    startW: 22,
    endW: 29,
    milestone: null
  },
  {
    id: 6,
    title: 'Data Analytics Initiative',
    desc: 'Build advanced analytics and reporting',
    owner: { name: 'Ayesha Noor', avatar: 'https://i.pravatar.cc/150?u=ayesha' },
    progress: 20,
    color: '#06B6D4',
    icon: Database,
    startW: 23,
    endW: 33,
    milestone: null
  }
];

const upcomingMilestones = [
  { id: 1, title: 'Beta Release', sub: 'Customer Portal V2', date: 'May 28, 2026', left: '2 days left', color: '#0052CC', icon: Rocket },
  { id: 2, title: 'Mobile UI Complete', sub: 'Mobile App Redesign', date: 'Jun 12, 2026', left: '17 days left', color: '#F59E0B', icon: Smartphone },
  { id: 3, title: 'Performance Audit', sub: 'Product Platform Upgrade', date: 'Jul 03, 2026', left: '38 days left', color: '#06B6D4', icon: Activity },
  { id: 4, title: 'V2.0 Release', sub: 'Customer Portal V2', date: 'Jul 25, 2026', left: '60 days left', color: '#8B5CF6', icon: Box },
];

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState('timeline');

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Sidebar />
      <style>{`
        .r-card { background: white; border: 1px solid #DFE1E6; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(9,30,66,.04); }
        .r-tab { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; display: flex; alignItems: center; gap: 6px; border: 1px solid transparent; }
        .r-tab.active { background: white; border-color: #DFE1E6; color: #0052CC; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .r-tab:not(.active) { color: #6B778C; }
        .r-tab:not(.active):hover { background: rgba(9,30,66,.04); color: #172B4D; }
        
        .g-col { border-right: 1px dashed #EBECF0; position: relative; }
        .g-col:last-child { border-right: none; }
        .g-bar { position: relative; height: 24px; border-radius: 12px; display: flex; align-items: center; padding: 0 10px; font-size: 11px; font-weight: 700; color: white; cursor: pointer; transition: filter 0.2s; }
        .g-bar:hover { filter: brightness(1.05); }
        .g-milestone { position: absolute; top: -6px; width: 12px; height: 12px; background: #EF4444; transform: rotate(45deg); z-index: 10; border: 2px solid white; border-radius: 2px; }
      `}</style>

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        
        {/* ── HEADER ── */}
        <div style={{ padding: '24px 28px', background: 'white', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B4D', letterSpacing: '-0.3px', margin: 0 }}>Roadmap</h1>
            <p style={{ fontSize: 13, color: '#42526E', marginTop: 4, margin: '4px 0 0 0' }}>Visualize our strategy and plan every step to success.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F4F5F7', border: '1px solid #DFE1E6', borderRadius: 8, padding: '7px 12px', width: 280 }}>
              <Search size={14} color="#8A94A6" />
              <input placeholder="Search initiatives, milestones..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, marginLeft: 8, width: '100%', color: '#172B4D' }} />
              <span style={{ fontSize: 10, background: '#EBECF0', padding: '2px 6px', borderRadius: 4, color: '#6B778C', fontWeight: 600 }}>⌘K</span>
            </div>
            <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#42526E', cursor: 'pointer' }}>
              <Filter size={14} />
            </button>
            <button style={{ background: '#0052CC', border: 'none', borderRadius: 8, padding: '0 16px', height: 34, display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,82,204,0.2)' }}>
              <Plus size={14} /> Create <ChevronDown size={14} style={{ opacity: 0.8 }} />
            </button>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', gap: 24 }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* ── KPI CARDS ── */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              {[
                { title: 'Active Initiatives', value: '12', change: '↑ 2 from last month', icon: Target, c: '#0052CC', bg: '#E6EFFF', chC: '#36B37E' },
                { title: 'In Progress', value: '7', change: '↑ 3 from last month', icon: Clock, c: '#F59E0B', bg: '#FEF3C7', chC: '#36B37E' },
                { title: 'Upcoming', value: '3', change: '↓ 1 from last month', icon: Calendar, c: '#8B5CF6', bg: '#EDE9FE', chC: '#EF4444' },
                { title: 'At Risk', value: '2', change: '↑ 1 from last month', icon: AlertTriangle, c: '#EF4444', bg: '#FEE2E2', chC: '#36B37E' },
              ].map(k => (
                <div key={k.title} className="r-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, color: k.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <k.icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#42526E' }}>{k.title}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', lineHeight: 1.2 }}>{k.value}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: k.chC, fontWeight: 600 }}>{k.change}</div>
                </div>
              ))}
              <div className="r-card" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#42526E' }}>Completion Forecast</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#172B4D', lineHeight: 1.2 }}>78%</div>
                    <div style={{ fontSize: 11, color: '#36B37E', fontWeight: 600 }}>On track</div>
                  </div>
                  <svg width="80" height="30" viewBox="0 0 80 30" style={{ overflow: 'visible' }}>
                    <path d="M0,25 L15,20 L30,22 L45,15 L60,18 L75,5" fill="none" stroke="#36B37E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ── TOOLBAR ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', background: '#F4F5F7', padding: 4, borderRadius: 10 }}>
                <div className={`r-tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}><LayoutList size={14} /> Timeline View</div>
                <div className={`r-tab ${activeTab === 'initiative' ? 'active' : ''}`} onClick={() => setActiveTab('initiative')}><Box size={14} /> Initiative View</div>
                <div className={`r-tab ${activeTab === 'milestones' ? 'active' : ''}`} onClick={() => setActiveTab('milestones')}><Target size={14} /> Milestones</div>
                <div className={`r-tab ${activeTab === 'releases' ? 'active' : ''}`} onClick={() => setActiveTab('releases')}><Rocket size={14} /> Releases</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#172B4D', cursor: 'pointer' }}>
                  Quarter <ChevronDown size={14} color="#8A94A6" />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, padding: '0 4px', height: 32 }}>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#6B778C' }}><ChevronLeft size={14} /></button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#172B4D', padding: '0 12px' }}>May – Aug 2026</span>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#6B778C' }}><ChevronRight size={14} /></button>
                </div>
                <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#172B4D', cursor: 'pointer' }}>
                  <Filter size={14} color="#8A94A6" /> Filters
                </button>
              </div>
            </div>

            {/* ── VIEWS ── */}
            {activeTab === 'timeline' && (
              <div className="r-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Header row */}
                <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                  <div style={{ width: 340, padding: '16px 20px', borderRight: '1px solid #DFE1E6', display: 'flex', fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    <span style={{ flex: 1 }}>Initiatives</span>
                    <span style={{ width: 80 }}>Owner</span>
                    <span style={{ width: 60 }}>Progress</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6' }}>
                      {['May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'].map(m => (
                        <div key={m} style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: 11, fontWeight: 600, color: '#42526E', borderRight: '1px dashed #EBECF0' }}>{m}</div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', padding: '8px 0' }}>
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#8A94A6', fontWeight: 600 }}>W{18 + i}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div style={{ position: 'relative', flex: 1, overflowY: 'auto' }}>
                  {/* Today Line */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '340px', width: 'calc(100% - 340px)', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: 'calc(100% * 4.5 / 16)', top: 0, bottom: 0, borderLeft: '1px dashed #0052CC', zIndex: 5 }}>
                      <div style={{ position: 'absolute', top: -1, left: -20, background: '#0052CC', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>Today</div>
                    </div>
                  </div>

                  {/* Rows */}
                  {initiatives.map((init) => (
                    <div key={init.id} style={{ display: 'flex', borderBottom: '1px solid #EBECF0', minHeight: 64 }}>
                      <div style={{ width: 340, padding: '12px 20px', borderRight: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', background: 'white' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${init.color}15`, color: init.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
                          <init.icon size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{init.title}</div>
                          <div style={{ fontSize: 11, color: '#6B778C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{init.desc}</div>
                        </div>
                        <div style={{ width: 80, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                          <img src={init.owner.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#172B4D', marginLeft: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{init.owner.name.split(' ')[0]}</span>
                        </div>
                        <div style={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingLeft: 12 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#172B4D' }}>{init.progress}%</span>
                          <div style={{ width: 30, height: 3, background: '#EBECF0', borderRadius: 2, marginTop: 4 }}>
                            <div style={{ width: `${init.progress}%`, height: '100%', background: init.color, borderRadius: 2 }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', background: 'white', position: 'relative' }}>
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className="g-col" />
                        ))}
                        {/* Timeline Bar */}
                        <div style={{
                          gridColumn: `${Math.max(1, init.startW - 17)} / ${Math.min(17, init.endW - 17)}`,
                          gridRow: 1,
                          alignSelf: 'center',
                          zIndex: 2,
                          margin: '0 4px',
                          position: 'relative'
                        }}>
                          <div style={{ height: 16, background: `${init.color}30`, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: `${init.progress}%`, height: '100%', background: init.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                              {init.progress >= 20 && <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>{init.progress}%</span>}
                            </div>
                          </div>
                          {init.milestone && (
                            <div className="g-milestone" style={{ left: `calc(${((init.milestone - init.startW) / (init.endW - init.startW - 1)) * 100}% - 6px)` }} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Legend */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #DFE1E6', background: 'white', display: 'flex', alignItems: 'center', gap: 24, fontSize: 11, color: '#42526E', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#36B37E' }}/> On Track</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}/> At Risk</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}/> Off Track</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8A94A6' }}/> Not Started</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}><span style={{ width: 12, borderTop: '1px dashed #0052CC' }}/> Today</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, borderTop: '2px solid #8A94A6' }}/> Baseline</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, background: 'white', border: '2px solid #8A94A6', transform: 'rotate(45deg)' }}/> Milestone</span>
                </div>
              </div>
            )}

            {activeTab === 'initiative' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {initiatives.map(init => (
                  <div key={init.id} className="r-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${init.color}15`, color: init.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <init.icon size={16} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: init.progress >= 50 ? '#E3FCEF' : '#FFF0F0', color: init.progress >= 50 ? '#006644' : '#BF2600' }}>{init.progress >= 50 ? 'On Track' : 'At Risk'}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: '0 0 4px 0' }}>{init.title}</h3>
                      <p style={{ fontSize: 12, color: '#6B778C', margin: 0, lineHeight: 1.4 }}>{init.desc}</p>
                    </div>
                    <div style={{ borderTop: '1px solid #DFE1E6', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={init.owner.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#172B4D' }}>{init.owner.name}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: init.color }}>{init.progress}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="r-card" style={{ padding: 0 }}>
                {upcomingMilestones.map((m, i) => (
                  <div key={m.id} style={{ padding: '16px 20px', borderBottom: i < upcomingMilestones.length - 1 ? '1px solid #DFE1E6' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <m.icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#172B4D' }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: '#6B778C' }}>{m.sub}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{m.date}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.left}</div>
                    </div>
                    <button style={{ background: 'white', border: '1px solid #DFE1E6', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#42526E', cursor: 'pointer' }}>View Details</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'releases' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                 <div className="r-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                       <h3 style={{ fontSize: 16, fontWeight: 800, color: '#172B4D', margin: '0 0 4px 0' }}>v2.0 Release</h3>
                       <p style={{ fontSize: 12, color: '#6B778C', margin: 0 }}>Major refresh including Customer Portal V2 and Mobile App.</p>
                     </div>
                     <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12, background: '#E6EFFF', color: '#0052CC' }}>Jul 25, 2026</span>
                   </div>
                   <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                       <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>Readiness</span>
                       <span style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6' }}>60%</span>
                     </div>
                     <div style={{ height: 6, background: '#EBECF0', borderRadius: 3, overflow: 'hidden' }}>
                       <div style={{ width: '60%', height: '100%', background: '#8B5CF6' }} />
                     </div>
                   </div>
                   <div style={{ fontSize: 11, color: '#42526E', display: 'flex', gap: 8 }}>
                     <span style={{ background: '#F4F5F7', padding: '2px 6px', borderRadius: 4 }}>2 Initiatives</span>
                     <span style={{ background: '#F4F5F7', padding: '2px 6px', borderRadius: 4 }}>14 Issues</span>
                   </div>
                 </div>
                 
                 <div className="r-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                       <h3 style={{ fontSize: 16, fontWeight: 800, color: '#172B4D', margin: '0 0 4px 0' }}>v1.2 Update</h3>
                       <p style={{ fontSize: 12, color: '#6B778C', margin: 0 }}>Platform Core Updates and Security Enhancements.</p>
                     </div>
                     <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12, background: '#FFFAE6', color: '#974F0C' }}>Jun 15, 2026</span>
                   </div>
                   <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                       <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>Readiness</span>
                       <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>45%</span>
                     </div>
                     <div style={{ height: 6, background: '#EBECF0', borderRadius: 3, overflow: 'hidden' }}>
                       <div style={{ width: '45%', height: '100%', background: '#10B981' }} />
                     </div>
                   </div>
                   <div style={{ fontSize: 11, color: '#42526E', display: 'flex', gap: 8 }}>
                     <span style={{ background: '#F4F5F7', padding: '2px 6px', borderRadius: 4 }}>3 Initiatives</span>
                     <span style={{ background: '#F4F5F7', padding: '2px 6px', borderRadius: 4 }}>8 Issues</span>
                   </div>
                 </div>
              </div>
            )}

            {/* ── UPCOMING MILESTONES ── */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', margin: 0 }}>Upcoming Milestones</h3>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View all</a>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {upcomingMilestones.map(m => (
                  <div key={m.id} className="r-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <m.icon size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: '#6B778C', marginTop: 2 }}>{m.sub}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid #F4F5F7', paddingTop: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>{m.date}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.left}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 24, flexShrink: 0 }}>
            
            <div className="r-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFBFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="#0052CC" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>AI Roadmap Assistant</span>
              </div>
              <span style={{ background: '#E6EFFF', color: '#0052CC', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>Beta</span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: 0 }}>Strategic Insights</h3>
                <span style={{ background: '#EBECF0', color: '#42526E', fontSize: 10, fontWeight: 700, width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#FFF0F0', border: '1px solid #FFEBEB', borderLeft: '3px solid #EF4444', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <AlertTriangle size={14} color="#EF4444" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#BF2600' }}>2 initiatives are at risk</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#42526E', margin: '0 0 8px 0', lineHeight: 1.4 }}>Marketing Expansion and Security Enhancements may be delayed.</p>
                  <a href="#" style={{ fontSize: 11, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View details →</a>
                </div>
                <div style={{ background: '#FFFAE6', border: '1px solid #FFF0B3', borderLeft: '3px solid #F59E0B', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <AlertCircle size={14} color="#F59E0B" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#974F0C' }}>Customer Portal V2 is behind schedule</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#42526E', margin: '0 0 8px 0', lineHeight: 1.4 }}>Consider reallocating resources to meet the July 25 milestone.</p>
                  <a href="#" style={{ fontSize: 11, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View suggestion →</a>
                </div>
                <div style={{ background: '#E3FCEF', border: '1px solid #D3F9E8', borderLeft: '3px solid #36B37E', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <CheckCircle size={14} color="#36B37E" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#006644' }}>Good progress!</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#42526E', margin: '0 0 8px 0', lineHeight: 1.4 }}>Product Platform Upgrade is ahead of schedule by 5 days.</p>
                  <a href="#" style={{ fontSize: 11, color: '#0052CC', fontWeight: 600, textDecoration: 'none' }}>View details →</a>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Add Initiative', icon: Plus },
                  { label: 'Add Milestone', icon: Plus },
                  { label: 'Create Release', icon: Rocket },
                  { label: 'Import from Goals', icon: DownloadCloud },
                ].map(action => (
                  <button key={action.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'white', border: '1px solid #DFE1E6', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0052CC' }}>
                        <action.icon size={12} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#172B4D' }}>{action.label}</span>
                    </div>
                    <ChevronRight size={14} color="#8A94A6" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', margin: '0 0 12px 0' }}>Roadmap Health</h3>
              <div className="r-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '.05em' }}>Overall Health</div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EBECF0" strokeWidth="4" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#36B37E" strokeWidth="4" strokeDasharray="78, 100" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>78%</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#36B37E' }}>Good</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { l: 'On Track', v: 8, c: '#36B37E' },
                      { l: 'At Risk', v: 2, c: '#F59E0B' },
                      { l: 'Off Track', v: 1, c: '#EF4444' },
                      { l: 'Not Started', v: 1, c: '#8A94A6' }
                    ].map(s => (
                      <div key={s.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />
                          <span style={{ color: '#42526E', fontWeight: 500 }}>{s.l}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#172B4D' }}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <a href="#" style={{ fontSize: 12, color: '#0052CC', fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: 4 }}>View full analytics →</a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
