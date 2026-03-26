"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Search, Filter, Plus, LayoutGrid, Calendar, List, Columns,
    CheckCircle2, Circle, AlertCircle, Clock, ChevronDown, ChevronRight,
    MessageSquare, Paperclip, MoreHorizontal, User, Tag, 
    ArrowUpRight, ArrowDownRight, Zap, Target, PanelRightClose,
    Focus, X, CheckSquare, AlignLeft, Calendar as CalIcon, Send,
    Inbox, Activity
} from 'lucide-react';

/* ─── Mock Data ─────────────────────── */
type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Blocked' | 'Completed';
type Priority = 'Urgent' | 'High' | 'Normal' | 'Low';

interface Subtask { id: string; name: string; done: boolean; }
interface Task {
    id: string; title: string; project: string; status: TaskStatus;
    priority: Priority; progress: number; assignee: string;
    dueDate: string; tags: string[]; health: 'on_track' | 'at_risk' | 'delayed';
    subtasks: Subtask[]; comments: number; files: number;
}

const INIT_TASKS: Task[] = [
    { id: 'T-01', title: 'Implement Authentication OAuth', project: 'Quantum UI', status: 'In Progress', priority: 'Urgent', progress: 65, assignee: 'Patrick', dueDate: 'Today', tags: ['Backend', 'Security'], health: 'at_risk', subtasks: [{id:'s1',name:'Setup Google Provider',done:true},{id:'s2',name:'JWT handling',done:false}], comments: 4, files: 1 },
    { id: 'T-02', title: 'Design System Migration', project: 'Design Systems', status: 'To Do', priority: 'Normal', progress: 0, assignee: 'Michelle', dueDate: 'Apr 12', tags: ['Design', 'UI'], health: 'on_track', subtasks: [], comments: 0, files: 3 },
    { id: 'T-03', title: 'Optimize Database Queries', project: 'Database Migration', status: 'Blocked', priority: 'High', progress: 40, assignee: 'Alex', dueDate: 'Yesterday', tags: ['Backend', 'Performance'], health: 'delayed', subtasks: [{id:'s3',name:'Index User table',done:true}], comments: 8, files: 0 },
    { id: 'T-04', title: 'Mobile App Navigation Fix', project: 'Mobile App v2', status: 'Review', priority: 'Urgent', progress: 90, assignee: 'Sara', dueDate: 'Tomorrow', tags: ['Mobile', 'Bug'], health: 'on_track', subtasks: [], comments: 2, files: 1 },
    { id: 'T-05', title: 'Update Landing Page Copy', project: 'Marketing Website', status: 'Completed', priority: 'Low', progress: 100, assignee: 'Patrick', dueDate: 'Last Week', tags: ['Content'], health: 'on_track', subtasks: [], comments: 1, files: 0 },
];

const COLORS = {
    Urgent: '#FF5630', High: '#FFAB00', Normal: '#0052CC', Low: '#6B778C',
    'To Do': '#DFE1E6', 'In Progress': '#0052CC', Review: '#6554C0', Blocked: '#FF5630', Completed: '#36B37E',
    on_track: '#36B37E', at_risk: '#FFAB00', delayed: '#FF5630'
};

/* ─── Helpers ────────────────────────── */
const getAC = (s: string) => {
    const c = ['#0052CC','#36B37E','#FF5630','#FFAB00','#6554C0','#00B8D9'];
    let h = 0; for(let i=0;i<s.length;i++) h = s.charCodeAt(i) + ((h<<5)-h);
    return c[Math.abs(h)%c.length];
};
const getInit = (n: string) => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();

function Avatar({ name, size=24, outline=false }: { name: string, size?: number, outline?: boolean }) {
    if (!name) return <div style={{width:size,height:size,borderRadius:'50%',background:'#F4F5F7',border:outline?'2px solid white':'none',display:'flex',alignItems:'center',justifyContent:'center'}}><User size={12} color="#8A94A6"/></div>;
    return (
        <div style={{width:size,height:size,borderRadius:'50%',background:getAC(name),color:'white',fontSize:size*0.4,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',border:outline?'2px solid white':'none'}} title={name}>
            {getInit(name)}
        </div>
    );
}

export default function TasksPage() {
    const [tasks, setTasks] = useState(INIT_TASKS);
    const [viewMode, setViewMode] = useState<'Table'|'Kanban'|'Timeline'|'Calendar'>('Table');
    const [quickFilter, setQuickFilter] = useState('All');
    const [focusMode, setFocusMode] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{id:string, field:string} | null>(null);

    // Derived states
    const filteredTasks = tasks.filter(t => {
        if (focusMode && t.assignee !== 'Patrick') return false; // Default logged in user Patrick
        if (searchQ && !t.title.toLowerCase().includes(searchQ.toLowerCase())) return false;
        if (quickFilter === 'Assigned to Me' && t.assignee !== 'Patrick') return false;
        if (quickFilter === 'Due Today' && t.dueDate !== 'Today') return false;
        if (quickFilter === 'Overdue' && (t.dueDate === 'Yesterday' || t.dueDate === 'Last Week')) return false;
        if (quickFilter === 'High Priority' && !['Urgent','High'].includes(t.priority)) return false;
        return true;
    });

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const s = new Set(selectedTasks);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelectedTasks(s);
    };

    const toggleSelectAll = () => {
        if (selectedTasks.size === filteredTasks.length) setSelectedTasks(new Set());
        else setSelectedTasks(new Set(filteredTasks.map(t=>t.id)));
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const s = new Set(expandedRows);
        s.has(id) ? s.delete(id) : s.add(id);
        setExpandedRows(s);
    };

    const handleUpdate = (id: string, field: keyof Task, val: any) => {
        setTasks(ts => ts.map(t => t.id === id ? { ...t, [field]: val } : t));
        setEditingCell(null);
    };

    const stats = [
        { label: 'Total Tasks', val: tasks.length, trend: '+12%', up: true, col: '#0052CC' },
        { label: 'In Progress', val: tasks.filter(t=>t.status==='In Progress').length, trend: '+4%', up: true, col: '#36B37E' },
        { label: 'Blocked', val: tasks.filter(t=>t.status==='Blocked').length, trend: '-2%', up: false, col: '#FF5630' },
        { label: 'Completed', val: tasks.filter(t=>t.status==='Completed').length, trend: '+24%', up: true, col: '#36B37E' },
        { label: 'Overdue', val: tasks.filter(t=>['Yesterday','Last Week'].includes(t.dueDate)).length, trend: '+1%', up: true, col: '#FFAB00' },
    ];

    return (
        <main style={{ display:'flex', minHeight:'100vh', background:'#FAFBFC' }} onClick={() => setEditingCell(null)}>
            <Sidebar />

            <style>{`
                .qf-btn { padding:6px 12px; border-radius:14px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; border:1px solid transparent; color:#42526E; background:transparent;}
                .qf-btn:hover { background:rgba(9,30,66,0.04); }
                .qf-btn.active { background:#F0F5FF; color:#0052CC; }
                
                .stat-card { background:white; border-radius:12px; padding:16px; border:1px solid #DFE1E6; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 4px rgba(9,30,66,0.02); }
                .stat-card:hover { border-color:#B3D4FF; transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,82,204,0.08); }
                
                .vw-btn { padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; border:none; background:transparent; display:flex; gap:6px; alignItems:center; color:#6B778C; border-radius:6px; transition:0.2s;}
                .vw-btn.active { background:white; color:#0052CC; box-shadow:0 1px 3px rgba(9,30,66,0.08); }
                
                .t-row { display:grid; grid-template-columns:40px minmax(250px,2fr) 140px 120px 100px 120px 100px 100px 140px 100px; align-items:center; border-bottom:1px solid rgba(9,30,66,0.04); background:white; position:relative; min-height:48px; transition:all 0.1s; }
                .t-row:hover { background:#F8FAFF; border-bottom-color:#DEEBFF; z-index:1; box-shadow:0 1px 8px rgba(9,30,66,0.06); }
                .t-row.selected { background:#E6EFFF; }
                .t-row .r-actions { display:none; position:absolute; right:12px; top:50%; transform:translateY(-50%); gap:4px; background:linear-gradient(90deg, transparent, #F8FAFF 10%); padding-left:20px; }
                .t-row:hover .r-actions { display:flex; }
                
                .c-cell { padding:0 12px; font-size:13px; color:#172B4D; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:flex; alignItems:center; cursor:text; min-height:30px; border-radius:4px; border:1px solid transparent;}
                .c-cell:hover { border-color:#DFE1E6; background:white; }
                .c-head { font-size:11px; font-weight:700; color:#6B778C; text-transform:uppercase; padding:10px 12px; border-bottom:1px solid #DFE1E6; background:#FAFBFC; position:sticky; top:0; z-index:10; }
                
                .act-btn { width:28px; height:28px; border-radius:6px; display:flex; alignItems:center; justifyContent:center; background:white; border:1px solid #DFE1E6; cursor:pointer; color:#42526E; transition:0.15s;}
                .act-btn:hover { background:#0052CC; color:white; border-color:#0052CC; }

                .editable-select { width:100%; border:1px solid #0052CC; border-radius:4px; padding:2px 4px; font-size:12px; outline:none; background:white; }
                
                .health-dot { width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:6px; box-shadow:0 0 0 2px white; }
            `}</style>
            
            <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, marginLeft:'240px' }}>
                
                {/* ── Header ── */}
                <div style={{ padding:'24px 32px 16px', background:'white', borderBottom:'1px solid #DFE1E6' }}>
                    
                    {/* Top Row: Title, Search, Actions */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                            <div style={{ background:'#E6EFFF', color:'#0052CC', padding:'8px', borderRadius:'10px' }}><Inbox size={20}/></div>
                            <h1 style={{ fontSize:'24px', fontWeight:800, color:'#172B4D', letterSpacing:'-0.02em' }}>All Tasks</h1>
                        </div>
                        
                        <div style={{ flex:1, maxWidth:'420px', margin:'0 24px', position:'relative' }}>
                            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#8A94A6' }}/>
                            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search tasks... (Ctrl+K)" style={{ width:'100%', padding:'9px 12px 9px 34px', borderRadius:'8px', border:'1px solid #DFE1E6', background:'#FAFBFC', fontSize:'13px', outline:'none', transition:'all 0.2s' }} />
                        </div>
                        
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <button style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 12px', border:'1px solid #DFE1E6', background:'white', borderRadius:'8px', fontSize:'13px', fontWeight:600, color:'#42526E', cursor:'pointer' }}>
                                <Filter size={14}/> Filter
                            </button>
                            <button style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 12px', border:'1px solid #DFE1E6', background:'white', borderRadius:'8px', fontSize:'13px', fontWeight:600, color:'#42526E', cursor:'pointer' }}>
                                <Columns size={14}/> Group: Status
                            </button>
                            <div style={{ width:1, height:24, background:'#DFE1E6', margin:'0 4px' }}/>
                            <button style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'#0052CC', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, color:'white', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,82,204,0.2)' }}>
                                <Plus size={16}/> Create Task
                            </button>
                        </div>
                    </div>

                    {/* Quick Filters & Focus Mode */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                            {['All', 'Assigned to Me', 'Due Today', 'Overdue', 'High Priority'].map(f => (
                                <button key={f} className={`qf-btn ${quickFilter===f?'active':''}`} onClick={()=>setQuickFilter(f)}>{f}</button>
                            ))}
                        </div>
                        <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:600, color:focusMode?'#0052CC':'#6B778C', cursor:'pointer', background:focusMode?'#E6EFFF':'transparent', padding:'6px 12px', borderRadius:'14px', transition:'0.2s' }}>
                            <Focus size={14}/> Focus Mode
                            <input type="checkbox" checked={focusMode} onChange={e=>setFocusMode(e.target.checked)} style={{display:'none'}}/>
                        </label>
                    </div>
                </div>

                {/* ── Insights & Stats ── */}
                <div style={{ padding:'20px 32px 0' }}>
                    {/* AI Insight banner */}
                    {tasks.some(t=>['Yesterday','Last Week'].includes(t.dueDate)) && (
                        <div style={{ marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px', padding:'10px 16px', background:'linear-gradient(90deg, #FFF0EB 0%, rgba(255,255,255,0) 100%)', borderLeft:'3px solid #FF5630', borderRadius:'0 8px 8px 0', fontSize:'13px', color:'#172B4D' }}>
                            <Zap size={14} color="#FF5630" />
                            <span style={{ fontWeight:700 }}>Heads up:</span> You have {tasks.filter(t=>['Yesterday','Last Week'].includes(t.dueDate)).length} overdue tasks that need attention.
                        </div>
                    )}
                    
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'16px', marginBottom:'24px' }}>
                        {stats.map((s,i)=>(
                            <div key={i} className="stat-card" onClick={()=>s.label==='Overdue'?setQuickFilter('Overdue'):null}>
                                <div style={{ fontSize:'12px', fontWeight:600, color:'#6B778C', marginBottom:'8px' }}>{s.label}</div>
                                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                                    <span style={{ fontSize:'24px', fontWeight:800, color:'#172B4D', lineHeight:1 }}>{s.val}</span>
                                    <div style={{ display:'flex', alignItems:'center', fontSize:'11px', fontWeight:700, color:s.up?'#36B37E':'#FF5630', background:s.up?'#E3FCEF':'#FFF0EB', padding:'2px 6px', borderRadius:'12px' }}>
                                        {s.up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {s.trend}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* View Switcher Controls */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                        <div style={{ background:'#EBECF0', padding:'4px', borderRadius:'8px', display:'inline-flex' }}>
                            {[{v:'Table',i:List},{v:'Kanban',i:LayoutGrid},{v:'Timeline',i:Columns},{v:'Calendar',i:CalIcon}].map(m=>(
                                <button key={m.v} className={`vw-btn ${viewMode===m.v?'active':''}`} onClick={()=>setViewMode(m.v as any)}>
                                    <m.i size={14}/> {m.v}
                                </button>
                            ))}
                        </div>
                        {selectedTasks.size > 0 && (
                            <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'#172B4D', color:'white', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:600, boxShadow:'0 4px 12px rgba(9,30,66,0.15)', animation:'slideUp 0.2s ease-out' }}>
                                <span>{selectedTasks.size} selected</span>
                                <div style={{ width:1, height:16, background:'rgba(255,255,255,0.2)' }}/>
                                <button style={{ background:'none', border:'none', color:'white', cursor:'pointer' }}>Assign</button>
                                <button style={{ background:'none', border:'none', color:'white', cursor:'pointer' }}>Status</button>
                                <button style={{ background:'none', border:'none', color:'#FF5630', cursor:'pointer' }}>Delete</button>
                                <button style={{ background:'none', border:'none', color:'#8A94A6', cursor:'pointer', display:'flex', alignItems:'center' }} onClick={()=>setSelectedTasks(new Set())}><X size={14}/></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Core Table View ── */}
                <div style={{ flex:1, margin:'0 32px 32px', background:'white', border:'1px solid #DFE1E6', borderRadius:'12px', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 2px 8px rgba(9,30,66,0.04)' }}>
                    <div className="t-row" style={{ minHeight:40, background:'#FAFBFC' }}>
                        <div className="c-head" style={{ textAlign:'center' }}>
                            <input type="checkbox" checked={selectedTasks.size===filteredTasks.length && filteredTasks.length>0} onChange={toggleSelectAll} style={{ accentColor:'#0052CC' }}/>
                        </div>
                        <div className="c-head">Task Name</div>
                        <div className="c-head">Project</div>
                        <div className="c-head">Status</div>
                        <div className="c-head">Priority</div>
                        <div className="c-head">Progress</div>
                        <div className="c-head">Assignee</div>
                        <div className="c-head">Due Date</div>
                        <div className="c-head">Tags</div>
                        <div className="c-head"></div>
                    </div>
                    
                    <div style={{ flex:1, overflowY:'auto' }}>
                        {filteredTasks.length === 0 ? (
                            <div style={{ padding:'64px', textAlign:'center', color:'#8A94A6' }}>
                                <div style={{ width:64, height:64, background:'#F4F5F7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><CheckCircle2 size={32} color="#DFE1E6"/></div>
                                <div style={{ fontSize:'16px', fontWeight:600, color:'#172B4D', marginBottom:'8px' }}>No tasks found</div>
                                <div style={{ fontSize:'13px' }}>Create your first task or try relaxing your filters.</div>
                            </div>
                        ) : (
                            filteredTasks.map(t => {
                                const isExp = expandedRows.has(t.id);
                                return (
                                <React.Fragment key={t.id}>
                                    <div className={`t-row ${selectedTasks.has(t.id)?'selected':''}`} style={{ borderLeft:`3px solid ${COLORS[t.priority]}` }} onClick={() => setActiveTask(t)}>
                                        <div className="c-cell" style={{ justifyContent:'center' }}>
                                            <input type="checkbox" checked={selectedTasks.has(t.id)} readOnly onClick={e=>toggleSelect(t.id, e)} style={{ accentColor:'#0052CC' }}/>
                                        </div>
                                        
                                        <div className="c-cell" style={{ display:'flex', gap:'8px', fontWeight:600 }}>
                                            <button style={{ background:'none', border:'none', padding:2, cursor:'pointer', color:'#8A94A6' }} onClick={e=>toggleExpand(t.id, e)}>
                                                <ChevronRight size={14} style={{ transform: isExp?'rotate(90deg)':'none', transition:'0.2s' }}/>
                                            </button>
                                            <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[t.health], marginTop:6, flexShrink:0 }} title={`Health: ${t.health}`}/>
                                            <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</span>
                                            {(t.comments>0 || t.files>0) && (
                                                <div style={{ display:'flex', gap:'6px', color:'#8A94A6', fontSize:'11px', fontWeight:500, alignItems:'center' }}>
                                                    {t.comments>0 && <span style={{display:'flex',gap:2,alignItems:'center'}}><MessageSquare size={10}/>{t.comments}</span>}
                                                    {t.files>0 && <span style={{display:'flex',gap:2,alignItems:'center'}}><Paperclip size={10}/>{t.files}</span>}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="c-cell" style={{ color:'#42526E' }}>{t.project}</div>
                                        
                                        <div className="c-cell" onClick={e=>{e.stopPropagation();setEditingCell({id:t.id,field:'status'})}}>
                                            {editingCell?.id===t.id && editingCell.field==='status' ? (
                                                <select className="editable-select" value={t.status} onChange={e=>handleUpdate(t.id, 'status', e.target.value)} onBlur={()=>setEditingCell(null)} autoFocus onClick={e=>e.stopPropagation()}>
                                                    {['To Do','In Progress','Review','Blocked','Completed'].map(o=><option key={o}>{o}</option>)}
                                                </select>
                                            ) : (
                                                <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'12px', background:t.status==='Completed'?'#E3FCEF':t.status==='Blocked'?'#FFF0EB':t.status==='In Progress'?'#E6EFFF':'#EBECF0', color:COLORS[t.status] }}>{t.status}</span>
                                            )}
                                        </div>

                                        <div className="c-cell" onClick={e=>{e.stopPropagation();setEditingCell({id:t.id,field:'priority'})}}>
                                            {editingCell?.id===t.id && editingCell.field==='priority' ? (
                                                <select className="editable-select" value={t.priority} onChange={e=>handleUpdate(t.id, 'priority', e.target.value)} onBlur={()=>setEditingCell(null)} autoFocus onClick={e=>e.stopPropagation()}>
                                                    {['Urgent','High','Normal','Low'].map(o=><option key={o}>{o}</option>)}
                                                </select>
                                            ) : (
                                                <span style={{ fontSize:'12px', fontWeight:600, color:COLORS[t.priority] }}><span className="health-dot" style={{background:COLORS[t.priority]}}/>{t.priority}</span>
                                            )}
                                        </div>

                                        <div className="c-cell">
                                            <div style={{ width:'100%', height:'6px', background:'#EBECF0', borderRadius:'3px', overflow:'hidden' }}>
                                                <div style={{ width:`${t.progress}%`, height:'100%', background:t.progress===100?'#36B37E':'#0052CC', borderRadius:'3px', transition:'width 0.3s' }}/>
                                            </div>
                                            <span style={{ fontSize:'10px', color:'#6B778C', marginLeft:'6px', width:'24px', textAlign:'right' }}>{t.progress}%</span>
                                        </div>

                                        <div className="c-cell" onClick={e=>{e.stopPropagation();}}>
                                            <Avatar name={t.assignee}/>
                                            <span style={{ marginLeft:8 }}>{t.assignee}</span>
                                        </div>

                                        <div className="c-cell" style={{ color:['Yesterday','Last Week'].includes(t.dueDate)?'#FF5630':t.dueDate==='Today'?'#0052CC':'#6B778C', fontWeight:['Yesterday','Last Week','Today'].includes(t.dueDate)?600:400 }}>
                                            {t.dueDate}
                                        </div>

                                        <div className="c-cell" style={{ display:'flex', gap:'4px' }}>
                                            {t.tags.slice(0,1).map(tg=><span key={tg} style={{fontSize:'10px',background:'#F4F5F7',color:'#42526E',padding:'2px 6px',borderRadius:'4px',fontWeight:600}}>{tg}</span>)}
                                            {t.tags.length>1 && <span style={{fontSize:'10px',color:'#8A94A6'}}>+{t.tags.length-1}</span>}
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="r-actions" onClick={e=>e.stopPropagation()}>
                                            <button className="act-btn" title="Edit"><AlignLeft size={13}/></button>
                                            <button className="act-btn" title="Assign"><User size={13}/></button>
                                            <button className="act-btn" title="Comment"><MessageSquare size={13}/></button>
                                            <button className="act-btn" title="More"><MoreHorizontal size={13}/></button>
                                        </div>
                                    </div>

                                    {/* Expanded Row Content */}
                                    {isExp && (
                                        <div style={{ background:'#FAFBFC', borderBottom:'1px solid #DFE1E6', padding:'16px 16px 16px 64px', display:'flex', flexDirection:'column', gap:'12px', boxShadow:'inset 0 2px 4px rgba(9,30,66,0.02)' }}>
                                            {t.subtasks.length > 0 && (
                                                <div style={{ width:'400px' }}>
                                                    <div style={{ fontSize:'11px', fontWeight:700, color:'#8A94A6', textTransform:'uppercase', marginBottom:'8px' }}>Subtasks ({t.subtasks.filter(s=>s.done).length}/{t.subtasks.length})</div>
                                                    {t.subtasks.map(st=>(
                                                        <div key={st.id} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:st.done?'#8A94A6':'#172B4D', textDecoration:st.done?'line-through':'none', padding:'4px 0' }}>
                                                            <input type="checkbox" checked={st.done} readOnly style={{ accentColor:'#0052CC' }}/>
                                                            {st.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ display:'flex', gap:'8px' }}>
                                                <input placeholder="Type a comment..." style={{ width:'300px', padding:'6px 12px', border:'1px solid #DFE1E6', borderRadius:'16px', fontSize:'12px', outline:'none' }} onClick={e=>e.stopPropagation()}/>
                                                <button style={{ padding:'6px 16px', background:'#FAFBFC', border:'1px solid #DFE1E6', borderRadius:'16px', fontSize:'12px', fontWeight:600, color:'#42526E', cursor:'pointer' }}>Attach File</button>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ── Quick Preview Panel (Right Side) ── */}
            {activeTask && (
                <div style={{ width:'340px', background:'white', borderLeft:'1px solid #DFE1E6', display:'flex', flexDirection:'column', flexShrink:0, boxShadow:'-4px 0 24px rgba(9,30,66,0.04)', animation:'slideInRight 0.2s ease-out' }}>
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #DFE1E6', display:'flex', alignItems:'flex-start', justifyContent:'space-between', background:'#FAFBFC' }}>
                        <div>
                            <div style={{ fontSize:'11px', fontWeight:700, color:'#6B778C', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:'6px', display:'flex', alignItems:'center', gap:'6px' }}>
                                <span style={{ width:8, height:8, borderRadius:'1px', background:COLORS[activeTask.project==='Quantum UI'?'In Progress':'Review'] }}/> {activeTask.project}
                            </div>
                            <div style={{ fontSize:'16px', fontWeight:700, color:'#172B4D', lineHeight:1.3 }}>{activeTask.title}</div>
                        </div>
                        <div style={{ display:'flex', gap:'4px' }}>
                            <button className="act-btn" style={{border:'none',background:'none'}}><MoreHorizontal size={16}/></button>
                            <button className="act-btn" style={{border:'none',background:'none'}} onClick={()=>setActiveTask(null)}><PanelRightClose size={16}/></button>
                        </div>
                    </div>

                    <div style={{ flex:1, overflowY:'auto', padding:'20px' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:'12px', fontSize:'13px', marginBottom:'24px' }}>
                            <div style={{ color:'#8A94A6' }}>Assignee</div>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#172B4D', fontWeight:500 }}><Avatar name={activeTask.assignee}/> {activeTask.assignee}</div>
                            
                            <div style={{ color:'#8A94A6' }}>Status</div>
                            <div><span style={{ fontSize:'12px', fontWeight:600, padding:'2px 8px', borderRadius:'12px', background:activeTask.status==='Completed'?'#E3FCEF':activeTask.status==='Blocked'?'#FFF0EB':activeTask.status==='In Progress'?'#E6EFFF':'#EBECF0', color:COLORS[activeTask.status], cursor:'pointer' }}>{activeTask.status}</span></div>

                            <div style={{ color:'#8A94A6' }}>Due Date</div>
                            <div style={{ color:['Yesterday','Last Week'].includes(activeTask.dueDate)?'#FF5630':'#172B4D', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}><CalIcon size={14}/> {activeTask.dueDate}</div>
                            
                            <div style={{ color:'#8A94A6' }}>Priority</div>
                            <div><span style={{ fontSize:'12px', fontWeight:600, color:COLORS[activeTask.priority], display:'flex', alignItems:'center', cursor:'pointer' }}><span className="health-dot" style={{background:COLORS[activeTask.priority],marginBottom:0}}/>{activeTask.priority}</span></div>
                        </div>

                        <div style={{ marginBottom:'24px' }}>
                            <div style={{ fontSize:'13px', fontWeight:700, color:'#172B4D', marginBottom:'8px' }}>Description</div>
                            <p style={{ fontSize:'13px', color:'#42526E', lineHeight:1.5 }}>
                                This task involves critical updates to the module. Ensure all related documentation is updated upon completion. See the attached Figma designs for reference.
                            </p>
                        </div>

                        {activeTask.subtasks.length > 0 && (
                            <div style={{ marginBottom:'24px' }}>
                                <div style={{ fontSize:'13px', fontWeight:700, color:'#172B4D', marginBottom:'8px', display:'flex', justifyContent:'space-between' }}>Subtasks <span>{activeTask.subtasks.filter(s=>s.done).length}/{activeTask.subtasks.length}</span></div>
                                <div style={{ height:'4px', background:'#EBECF0', borderRadius:'2px', marginBottom:'12px' }}>
                                    <div style={{ height:'100%', background:'#36B37E', borderRadius:'2px', width:`${(activeTask.subtasks.filter(s=>s.done).length/activeTask.subtasks.length)*100}%` }}/>
                                </div>
                                {activeTask.subtasks.map(st => (
                                    <div key={st.id} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:st.done?'#8A94A6':'#172B4D', padding:'6px 0' }}>
                                        <input type="checkbox" defaultChecked={st.done} style={{ accentColor:'#0052CC', width:16, height:16 }}/>
                                        <span style={{ textDecoration:st.done?'line-through':'none' }}>{st.name}</span>
                                    </div>
                                ))}
                                <button style={{ fontSize:'12px', color:'#8A94A6', background:'none', border:'none', marginTop:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}>+ Add Subtask</button>
                            </div>
                        )}

                        <div>
                            <div style={{ fontSize:'13px', fontWeight:700, color:'#172B4D', marginBottom:'12px' }}>Activity</div>
                            <div style={{ display:'flex', gap:'12px', marginBottom:'16px' }}>
                                <div style={{ width:32, height:32, borderRadius:'50%', background:'#F4F5F7', display:'flex', alignItems:'center', justifyContent:'center' }}><Activity size={14} color="#8A94A6"/></div>
                                <div>
                                    <div style={{ fontSize:'13px' }}><span style={{fontWeight:600}}>Patrick</span> created this task</div>
                                    <div style={{ fontSize:'11px', color:'#8A94A6' }}>2 days ago</div>
                                </div>
                            </div>
                            <div style={{ display:'flex', gap:'12px' }}>
                                <Avatar name="Alex" size={32}/>
                                <div style={{ background:'#FAFBFC', border:'1px solid #DFE1E6', padding:'10px', borderRadius:'0 8px 8px 8px', fontSize:'13px', color:'#172B4D', width:'100%' }}>
                                    I'll take a look at this tomorrow. The backend team needs to set up the new endpoints first.
                                    <div style={{ fontSize:'11px', color:'#8A94A6', marginTop:'6px' }}>Yesterday at 4:30 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding:'16px 20px', borderTop:'1px solid #DFE1E6', background:'white' }}>
                        <div style={{ display:'flex', alignItems:'center', border:'1px solid #DFE1E6', borderRadius:'20px', padding:'4px 4px 4px 16px', background:'#FAFBFC' }}>
                            <input placeholder="Ask a question or post an update..." style={{ flex:1, border:'none', background:'transparent', outline:'none', fontSize:'13px' }}/>
                            <button style={{ width:28, height:28, borderRadius:'50%', background:'#0052CC', color:'white', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Send size={12} style={{marginLeft:-2}} /></button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
                @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
            `}</style>
        </main>
    );
}
