"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Search, Upload, FolderPlus, FilePlus, Grid, List, Star, Clock,
    Users, Share2, Download, MoreHorizontal, ChevronDown, ChevronRight,
    Hash, Folder, FileText, Image, Code, FileArchive, File,
    X, Eye, Pencil, Trash2, Copy, Link, CheckSquare, Flame,
    BarChart2, Activity, MessageSquare, CheckCircle2, RotateCcw,
    Plus, Filter, SlidersHorizontal, PanelRight, Heart, Zap, AlertCircle
} from 'lucide-react';

const FILES = [
    { id:'f1', name:'Design System.fig', type:'fig', tags:['#design','#ui'], size:'12.4 MB', modified:'2 min ago', owner:'Michelle', popular:true, starred:true, tasks:3, chats:0, heat:'hot' },
    { id:'f2', name:'Project Brief.pdf', type:'pdf', tags:['#docs'], size:'2.1 MB', modified:'1 hour ago', owner:'Alex Johnson', popular:false, starred:false, tasks:1, chats:2, heat:'warm' },
    { id:'f3', name:'API Documentation.md', type:'md', tags:['#backend','#api'], size:'45 KB', modified:'3 hours ago', owner:'John Smith', popular:false, starred:false, tasks:0, chats:2, heat:'warm' },
    { id:'f4', name:'Dashboard Mockup.png', type:'img', tags:['#design'], size:'3.2 MB', modified:'Yesterday', owner:'Sara Khan', popular:true, starred:false, tasks:0, chats:0, heat:'hot' },
    { id:'f5', name:'Database Schema.sql', type:'code', tags:['#backend'], size:'7 KB', modified:'2 days ago', owner:'Alex Johnson', popular:false, starred:false, tasks:0, chats:0, heat:'cold' },
    { id:'f6', name:'Mobile Screens.sketch', type:'fig', tags:['#design','#mobile'], size:'18.6 MB', modified:'2 days ago', owner:'Michelle', popular:false, starred:true, tasks:0, chats:0, heat:'cold' },
];

const LINKED_TASKS = [
    { title:'Implement Design System', project:'Quantum UI', status:'In Progress', color:'#0052CC' },
    { title:'Update Component Library', project:'Design Systems', status:'To Do', color:'#FFAB00' },
    { title:'Fix Button Variants', project:'Mobile App v2', status:'Review', color:'#36B37E' },
];

const COMMENTS = [
    { user:'Alex Johnson', time:'2 hours ago', text:'Can you export v2 with the new color tokens?' },
    { user:'Michelle', time:'1 hour ago', text:'@Alex Johnson Sure! Uploading the updated version now.' },
    { user:'Sara', time:'30 min ago', text:'Looks great! Approved ✅' },
];

const VERSIONS = [
    { v:'v2.1', note:'Updated colors', user:'Michelle', time:'2h ago', current:true },
    { v:'v2.0', note:'Added dark mode', user:'Alex Johnson', time:'Yesterday', current:false },
    { v:'v1.5', note:'Component updates', user:'Sara Khan', time:'3 days ago', current:false },
];

const ACTIVITY_LOG = [
    { action:'Viewed by John Smith', time:'5m ago', icon:Eye },
    { action:'Downloaded by Sara Khan', time:'1 hour ago', icon:Download },
    { action:'Edited by Michelle', time:'2 hours ago', icon:Pencil },
    { action:'Viewed by Alex Johnson', time:'3 hours ago', icon:Eye },
];

const SUGGESTIONS = [
    { name:'Q1-Design-System.fig', info:'Related to 3 tasks', tags:['#design','#ui','#active'] },
    { name:'API-Documentation.pdf', info:'Used in Core Development', tags:['#backend','#api'] },
    { name:'Dashboard-Mockup.sketch', info:'Similar to files you work on', tags:['#design','#dashboard'] },
];

const getAC = (s:string) => {
    const c=['#0052CC','#36B37E','#FF5630','#FFAB00','#6554C0','#00B8D9'];
    let h=0; for(let i=0;i<s.length;i++) h=s.charCodeAt(i)+((h<<5)-h);
    return c[Math.abs(h)%c.length];
};
const getInit = (n:string) => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();

const typeIcon = (type:string) => {
    const map: Record<string,{bg:string,color:string,label:string}> = {
        fig:{bg:'#E6EFFF',color:'#0052CC',label:'F'},
        pdf:{bg:'#FFF0EB',color:'#FF5630',label:'P'},
        md:{bg:'#F4F5F7',color:'#42526E',label:'M'},
        img:{bg:'#E3FCEF',color:'#36B37E',label:'I'},
        code:{bg:'#EAE6FF',color:'#6554C0',label:'C'},
        sql:{bg:'#EAE6FF',color:'#6554C0',label:'S'},
    };
    return map[type] || {bg:'#F4F5F7',color:'#42526E',label:'?'};
};

export default function FilesPage() {
    const [view, setView] = useState<'grid'|'list'>('grid');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [activeFile, setActiveFile] = useState(FILES[0]);
    const [rightOpen, setRightOpen] = useState(true);
    const [rightTab, setRightTab] = useState('Details');
    const [ctx, setCtx] = useState<{x:number;y:number;file:typeof FILES[0]}|null>(null);
    const [searchQ, setSearchQ] = useState('');
    const [navSection, setNavSection] = useState('All Files');
    const [insightsOn, setInsightsOn] = useState(true);
    const [commentText, setCommentText] = useState('');

    const toggleSelect = (id:string) => {
        const s = new Set(selected);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelected(s);
    };

    return (
        <main style={{display:'flex',minHeight:'100vh',background:'#F4F5F7'}} onClick={()=>setCtx(null)}>
            <Sidebar />
            <style>{`
                .file-card{background:white;border-radius:12px;border:1px solid rgba(9,30,66,0.08);padding:14px;cursor:pointer;transition:all 0.18s;position:relative;}
                .file-card:hover{border-color:rgba(0,82,204,0.25);transform:translateY(-2px);box-shadow:0 8px 24px rgba(9,30,66,0.08);}
                .file-card.sel{border-color:#0052CC;background:#F8FAFF;}
                .fc-actions{display:none;position:absolute;top:10px;right:10px;gap:4px;}
                .file-card:hover .fc-actions{display:flex;}
                .fc-btn{width:26px;height:26px;border-radius:6px;border:1px solid #DFE1E6;background:white;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6B778C;transition:all 0.15s;}
                .fc-btn:hover{background:#0052CC;color:white;border-color:#0052CC;}
                .nav-item{display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:8px;cursor:pointer;font-size:13px;color:#172B4D;transition:all 0.15s;}
                .nav-item:hover{background:#EBECF0;}
                .nav-item.active{background:#E6EFFF;color:#0052CC;font-weight:600;}
                .filter-pill{padding:5px 10px;border-radius:7px;border:1px solid #DFE1E6;background:white;font-size:12px;font-weight:500;color:#42526E;cursor:pointer;display:flex;align-items:center;gap:5px;white-space:nowrap;}
                .filter-pill:hover{background:#F4F5F7;}
                .rtab{padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;border:none;cursor:pointer;transition:all 0.15s;}
                .rtab.a{background:#E6EFFF;color:#0052CC;}
                .rtab:not(.a){background:transparent;color:#6B778C;}
                .rtab:not(.a):hover{background:#F4F5F7;}
                .ctx-menu{position:fixed;background:white;border:1px solid rgba(9,30,66,0.1);border-radius:10px;padding:4px;box-shadow:0 8px 24px rgba(9,30,66,0.14);z-index:1000;min-width:180px;}
                .ctx-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;color:#172B4D;transition:background 0.1s;}
                .ctx-item:hover{background:#F4F5F7;}
                .ctx-item.danger{color:#FF5630;}
                .ctx-item.danger:hover{background:#FFF0EB;}
                .list-row{display:grid;grid-template-columns:2fr 100px 100px 120px 80px 80px;align-items:center;padding:10px 14px;border-bottom:1px solid rgba(9,30,66,0.06);font-size:13px;transition:background 0.15s;cursor:pointer;}
                .list-row:hover{background:#F8FAFF;}
                .tag-sm{font-size:10px;padding:2px 6px;border-radius:4px;background:#E6EFFF;color:#0052CC;font-weight:600;}
                .heat-hot{color:#FF5630;font-size:10px;font-weight:700;}
                .heat-warm{color:#FFAB00;font-size:10px;font-weight:700;}
                .toggle-sw{width:36px;height:20px;border-radius:10px;border:none;cursor:pointer;position:relative;transition:background 0.2s;}
                .toggle-sw::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:white;transition:transform 0.2s;}
                .toggle-sw.on{background:#0052CC;}
                .toggle-sw.on::after{transform:translateX(16px);}
                .toggle-sw.off{background:#DFE1E6;}
            `}</style>

            {/* ── Left Nav ── */}
            <div style={{width:'220px',background:'white',borderRight:'1px solid #DFE1E6',display:'flex',flexDirection:'column',marginLeft:'240px',minHeight:'100vh',flexShrink:0,overflowY:'auto'}}>
                <div style={{padding:'18px 12px 10px'}}>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#8A94A6',textTransform:'uppercase',letterSpacing:'0.06em'}}>Navigation</span>
                </div>
                {[{label:'All Files',count:342},{label:'Recent'},{label:'Favorites',icon:Star},{label:'Shared with Me',count:8},{label:'My Uploads'},{label:'Trash',count:12}].map(i=>(
                    <div key={i.label} className={`nav-item ${navSection===i.label?'active':''}`} onClick={()=>setNavSection(i.label)}>
                        {i.label==='All Files'&&<FileText size={14}/>}
                        {i.label==='Recent'&&<Clock size={14}/>}
                        {i.label==='Favorites'&&<Star size={14}/>}
                        {i.label==='Shared with Me'&&<Users size={14}/>}
                        {i.label==='My Uploads'&&<Upload size={14}/>}
                        {i.label==='Trash'&&<Trash2 size={14}/>}
                        <span style={{flex:1}}>{i.label}</span>
                        {i.count&&<span style={{fontSize:'11px',fontWeight:700,background:'#EBECF0',borderRadius:'8px',padding:'1px 6px',color:'#42526E'}}>{i.count}</span>}
                    </div>
                ))}

                <div style={{padding:'14px 12px 4px'}}>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#8A94A6',textTransform:'uppercase',letterSpacing:'0.06em'}}>Teams</span>
                </div>
                {['Core Development','Design Systems','Marketing Team'].map(t=>(
                    <div key={t} style={{display:'flex',alignItems:'center',gap:'8px',padding:'7px 12px',cursor:'pointer',fontSize:'12px',color:'#42526E',borderRadius:'8px',transition:'background 0.15s'}}>
                        <Folder size={13} color={getAC(t)} fill={getAC(t)} />{t}
                    </div>
                ))}

                <div style={{padding:'14px 12px 4px'}}>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#8A94A6',textTransform:'uppercase',letterSpacing:'0.06em'}}>Projects</span>
                </div>
                {[{n:'Quantum UI Redesign',c:'#0052CC'},{n:'Database Migration',c:'#FF5630'},{n:'Mobile App v2.0',c:'#36B37E'}].map(p=>(
                    <div key={p.n} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'12px',color:'#42526E',borderRadius:'8px',transition:'background 0.15s'}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:p.c,flexShrink:0}}/>{p.n}
                    </div>
                ))}

                <div style={{padding:'14px 12px 4px'}}>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#8A94A6',textTransform:'uppercase',letterSpacing:'0.06em'}}>Tags</span>
                </div>
                {[{t:'Design',n:24},{t:'Backend',n:18},{t:'Frontend',n:15},{t:'Urgent',n:6}].map(t=>(
                    <div key={t.t} style={{display:'flex',alignItems:'center',gap:'7px',padding:'5px 12px',cursor:'pointer',fontSize:'12px',color:'#42526E',borderRadius:'6px'}}>
                        <Hash size={11} color="#0052CC"/><span style={{flex:1}}>#{t.t}</span>
                        <span style={{fontSize:'10px',color:'#8A94A6',fontWeight:600}}>{t.n}</span>
                    </div>
                ))}
            </div>

            {/* ── Main Area ── */}
            <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden'}}>
                {/* Header */}
                <div style={{padding:'16px 24px 12px',background:'white',borderBottom:'1px solid #DFE1E6',flexShrink:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{background:'#E6EFFF',padding:'8px',borderRadius:'8px',color:'#0052CC'}}><File size={18}/></div>
                            <h1 style={{fontSize:'20px',fontWeight:700,color:'#172B4D'}}>Files Workspace</h1>
                        </div>
                        <div style={{flex:1,position:'relative',maxWidth:'360px',marginLeft:'auto'}}>
                            <Search size={14} style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#8A94A6'}}/>
                            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search files, tags, projects... ⌘K" style={{width:'100%',padding:'8px 12px 8px 34px',borderRadius:'8px',border:'1px solid #DFE1E6',fontSize:'13px',outline:'none',background:'#FAFBFC'}}/>
                        </div>
                        <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                            <button style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 12px',borderRadius:'8px',border:'1px solid #DFE1E6',background:'white',fontSize:'12px',fontWeight:600,color:'#42526E',cursor:'pointer'}}><FolderPlus size={14}/> Create Folder</button>
                            <button style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'8px',border:'none',background:'#0052CC',fontSize:'13px',fontWeight:600,color:'white',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,82,204,0.22)'}}><Upload size={14}/> Upload File</button>
                            <button style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 12px',borderRadius:'8px',border:'1px solid #DFE1E6',background:'white',fontSize:'12px',fontWeight:600,color:'#42526E',cursor:'pointer'}}><FilePlus size={14}/> New Doc</button>
                        </div>
                    </div>
                    {/* Filters */}
                    <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                        {['File Type','Projects','Teams','Tags','Uploaded by'].map(f=>(
                            <button key={f} className="filter-pill">{f} <ChevronDown size={10}/></button>
                        ))}
                        <div style={{marginLeft:'auto',display:'flex',gap:'6px',alignItems:'center'}}>
                            <span style={{fontSize:'12px',color:'#6B778C'}}>Sort:</span>
                            <button className="filter-pill"><Clock size={11}/> Recent <ChevronDown size={10}/></button>
                            <div style={{width:'1px',height:'18px',background:'#DFE1E6',margin:'0 4px'}}/>
                            <button className="fc-btn" style={{width:30,height:30}} onClick={()=>setView('grid')} title="Grid View"><Grid size={14} color={view==='grid'?'#0052CC':'#6B778C'}/></button>
                            <button className="fc-btn" style={{width:30,height:30}} onClick={()=>setView('list')} title="List View"><List size={14} color={view==='list'?'#0052CC':'#6B778C'}/></button>
                            <button className="fc-btn" style={{width:30,height:30,color:rightOpen?'#0052CC':'#6B778C',background:rightOpen?'#E6EFFF':'white',borderColor:rightOpen?'rgba(0,82,204,0.2)':'#DFE1E6'}} onClick={()=>setRightOpen(p=>!p)}><PanelRight size={14}/></button>
                        </div>
                    </div>
                </div>

                <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:'20px'}}>
                    {/* Smart Suggestions */}
                    <div style={{background:'white',borderRadius:'12px',border:'1px solid rgba(9,30,66,0.08)',padding:'16px 20px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                            <Zap size={14} color="#FFAB00"/>
                            <span style={{fontSize:'13px',fontWeight:700,color:'#172B4D'}}>Smart Suggestions</span>
                        </div>
                        <div style={{display:'flex',gap:'12px'}}>
                            {SUGGESTIONS.map((s,i)=>(
                                <div key={i} style={{flex:1,border:'1px solid #DFE1E6',borderRadius:'10px',padding:'12px',cursor:'pointer',transition:'all 0.15s',background:'#FAFBFC'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                                        <div style={{width:32,height:32,borderRadius:'8px',background:typeIcon(i===1?'pdf':'fig').bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:typeIcon(i===1?'pdf':'fig').color}}>{typeIcon(i===1?'pdf':'fig').label}</div>
                                        <div><div style={{fontSize:'12px',fontWeight:600,color:'#172B4D'}}>{s.name}</div><div style={{fontSize:'10px',color:'#6B778C'}}>{s.info}</div></div>
                                    </div>
                                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>{s.tags.map((t,j)=><span key={j} className="tag-sm">{t}</span>)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Usage Insights */}
                    <div style={{background:'white',borderRadius:'12px',border:'1px solid rgba(9,30,66,0.08)',padding:'16px 20px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:insightsOn?'14px':'0'}}>
                            <BarChart2 size={14} color="#0052CC"/>
                            <span style={{fontSize:'13px',fontWeight:700,color:'#172B4D'}}>Usage Insights</span>
                            <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'8px'}}>
                                <span style={{fontSize:'12px',color:'#6B778C'}}>Show usage heatmap</span>
                                <button className={`toggle-sw ${insightsOn?'on':'off'}`} onClick={()=>setInsightsOn(p=>!p)}/>
                            </div>
                        </div>
                        {insightsOn && (
                            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
                                {[
                                    {label:'Most Viewed',name:'Design System.fig',stat:'24 views',color:'#0052CC'},
                                    {label:'Most Edited',name:'API-Schema.ts',stat:'12 edits',color:'#FFAB00'},
                                    {label:'Most Shared',name:'Brand-Guidelines.pdf',stat:'8 shares',color:'#FF5630'},
                                    {label:'Recently Active',name:'Team-Meeting.docx',stat:'Just now',color:'#36B37E'},
                                ].map((ins,i)=>(
                                    <div key={i} style={{padding:'12px',borderRadius:'10px',background:'#FAFBFC',border:'1px solid #DFE1E6'}}>
                                        <div style={{fontSize:'10px',fontWeight:700,color:ins.color,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'6px'}}>{ins.label}</div>
                                        <div style={{fontSize:'12px',fontWeight:600,color:'#172B4D',marginBottom:'4px'}}>{ins.name}</div>
                                        <div style={{height:'4px',background:'#EBECF0',borderRadius:'2px',overflow:'hidden',marginBottom:'4px'}}>
                                            <div style={{height:'100%',background:ins.color,borderRadius:'2px',width:`${[80,65,55,40][i]}%`}}/>
                                        </div>
                                        <div style={{fontSize:'10px',color:'#6B778C'}}>{ins.stat}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Files Section */}
                    <div>
                        <div style={{display:'flex',alignItems:'center',marginBottom:'14px'}}>
                            <span style={{fontSize:'14px',fontWeight:700,color:'#172B4D'}}>Files <span style={{fontSize:'12px',color:'#6B778C',fontWeight:400}}>({FILES.length} items)</span></span>
                            {selected.size>0&&(
                                <div style={{marginLeft:'16px',display:'flex',gap:'6px'}}>
                                    <span style={{fontSize:'12px',color:'#0052CC',fontWeight:600}}>{selected.size} selected</span>
                                    <button style={{fontSize:'11px',color:'#6B778C',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelected(new Set())}>Clear</button>
                                    <button className="fc-btn" style={{width:'auto',padding:'0 8px',fontSize:'11px',fontWeight:600,color:'#FF5630',borderColor:'rgba(255,86,48,0.2)'}}>Delete</button>
                                    <button className="fc-btn" style={{width:'auto',padding:'0 8px',fontSize:'11px',fontWeight:600}}>Move</button>
                                    <button className="fc-btn" style={{width:'auto',padding:'0 8px',fontSize:'11px',fontWeight:600}}>Tag</button>
                                </div>
                            )}
                            <div style={{marginLeft:'auto',fontSize:'12px',color:'#6B778C'}}>Sort by: Recent</div>
                        </div>

                        {/* Drag & Drop Zone */}
                        <div style={{border:'2px dashed #DFE1E6',borderRadius:'12px',padding:'20px',textAlign:'center',marginBottom:'16px',color:'#6B778C',background:'#FAFBFC',cursor:'pointer',transition:'all 0.2s'}}>
                            <Upload size={20} style={{margin:'0 auto 8px',color:'#8A94A6'}}/>
                            <div style={{fontSize:'13px',fontWeight:600,color:'#172B4D',marginBottom:'2px'}}>Drop files here to upload!</div>
                            <div style={{fontSize:'11px'}}>Supports PDF, DOC, Images, ZIP, Code files • Max 100MB per file</div>
                        </div>

                        {view==='grid' ? (
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'14px'}}>
                                {FILES.map(f=>{
                                    const ti = typeIcon(f.type);
                                    return (
                                        <div key={f.id} className={`file-card ${selected.has(f.id)?'sel':''}`}
                                            onClick={()=>{setActiveFile(f);setSelected(new Set());}}
                                            onContextMenu={e=>{e.preventDefault();setCtx({x:e.clientX,y:e.clientY,file:f});}}>
                                            <input type="checkbox" checked={selected.has(f.id)} onChange={()=>toggleSelect(f.id)}
                                                onClick={e=>e.stopPropagation()}
                                                style={{position:'absolute',top:10,left:10,accentColor:'#0052CC'}}/>
                                            {f.starred&&<Star size={12} fill="#FFAB00" color="#FFAB00" style={{position:'absolute',top:10,right:10}}/>}
                                            <div style={{width:'100%',height:'80px',borderRadius:'8px',background:ti.bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'10px',fontSize:'24px',fontWeight:700,color:ti.color}}>{ti.label}</div>
                                            <div style={{fontSize:'13px',fontWeight:600,color:'#172B4D',marginBottom:'6px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                                            <div style={{display:'flex',gap:'3px',flexWrap:'wrap',marginBottom:'8px'}}>
                                                {f.tags.map((t,i)=><span key={i} className="tag-sm">{t}</span>)}
                                            </div>
                                            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                                <div style={{width:20,height:20,borderRadius:'50%',background:getAC(f.owner),color:'white',fontSize:'7px',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{getInit(f.owner)}</div>
                                                <span style={{fontSize:'10px',color:'#6B778C',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.owner}</span>
                                                {f.heat==='hot'&&<span className="heat-hot">🔥 Popular</span>}
                                                {f.heat==='warm'&&f.tasks>0&&<span className="heat-warm">Used in {f.tasks} tasks</span>}
                                                {f.chats>0&&<span style={{fontSize:'10px',color:'#36B37E',fontWeight:700}}>Shared in {f.chats} chats</span>}
                                            </div>
                                            <div style={{fontSize:'10px',color:'#8A94A6',marginTop:'6px'}}>{f.size} • {f.modified}</div>
                                            <div className="fc-actions">
                                                {[Eye,Share2,Download,MoreHorizontal].map((Icon,i)=>(
                                                    <button key={i} className="fc-btn" onClick={e=>e.stopPropagation()}><Icon size={12}/></button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{background:'white',borderRadius:'12px',border:'1px solid rgba(9,30,66,0.08)',overflow:'hidden'}}>
                                <div className="list-row" style={{fontSize:'10px',fontWeight:700,color:'#6B778C',textTransform:'uppercase',background:'#FAFBFC',borderBottom:'1px solid #DFE1E6'}}>
                                    <div>Name</div><div>Tags</div><div>Owner</div><div>Modified</div><div>Size</div><div>Actions</div>
                                </div>
                                {FILES.map(f=>(
                                    <div key={f.id} className="list-row" onClick={()=>setActiveFile(f)} onContextMenu={e=>{e.preventDefault();setCtx({x:e.clientX,y:e.clientY,file:f});}}>
                                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                            <div style={{width:28,height:28,borderRadius:'6px',background:typeIcon(f.type).bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:typeIcon(f.type).color}}>{typeIcon(f.type).label}</div>
                                            <span style={{fontWeight:600,color:'#172B4D'}}>{f.name}</span>
                                            {f.starred&&<Star size={10} fill="#FFAB00" color="#FFAB00"/>}
                                        </div>
                                        <div style={{display:'flex',gap:'3px'}}>{f.tags.slice(0,1).map((t,i)=><span key={i} className="tag-sm">{t}</span>)}</div>
                                        <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                                            <div style={{width:20,height:20,borderRadius:'50%',background:getAC(f.owner),color:'white',fontSize:'7px',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{getInit(f.owner)}</div>
                                            <span style={{fontSize:'12px',color:'#42526E'}}>{f.owner.split(' ')[0]}</span>
                                        </div>
                                        <div style={{fontSize:'12px',color:'#6B778C'}}>{f.modified}</div>
                                        <div style={{fontSize:'12px',color:'#6B778C'}}>{f.size}</div>
                                        <div style={{display:'flex',gap:'3px'}}>
                                            {[Eye,Share2,MoreHorizontal].map((Icon,i)=>(
                                                <button key={i} className="fc-btn" style={{width:24,height:24}} onClick={e=>e.stopPropagation()}><Icon size={11}/></button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Shortcuts bar */}
                <div style={{padding:'8px 24px',background:'white',borderTop:'1px solid #DFE1E6',display:'flex',gap:'20px',fontSize:'11px',color:'#8A94A6'}}>
                    <span>⌘K Quick actions</span>
                    <span>Drag to move</span>
                    <span>Right-click for menu</span>
                    <span>Space to preview</span>
                </div>
            </div>

            {/* ── Right Panel ── */}
            {rightOpen && activeFile && (
                <div style={{width:'268px',background:'white',borderLeft:'1px solid #DFE1E6',display:'flex',flexDirection:'column',flexShrink:0,overflowY:'auto'}}>
                    {/* File header */}
                    <div style={{padding:'14px 16px',borderBottom:'1px solid #DFE1E6'}}>
                        <div style={{display:'flex',gap:'4px',marginBottom:'12px',flexWrap:'wrap'}}>
                            {['Details','Activity','Versions'].map(t=>(
                                <button key={t} className={`rtab ${rightTab===t?'a':''}`} onClick={()=>setRightTab(t)}>{t}</button>
                            ))}
                        </div>
                        <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'8px'}}>
                            <div style={{width:40,height:40,borderRadius:'10px',background:typeIcon(activeFile.type).bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:700,color:typeIcon(activeFile.type).color}}>{typeIcon(activeFile.type).label}</div>
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#172B4D',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeFile.name}</div>
                                <div style={{fontSize:'10px',color:'#6B778C'}}>{activeFile.size}</div>
                            </div>
                        </div>
                        <div style={{display:'flex',gap:'5px'}}>
                            {activeFile.starred&&<span style={{fontSize:'10px',fontWeight:700,background:'#FFF7E6',color:'#FFAB00',padding:'2px 6px',borderRadius:'4px',display:'flex',alignItems:'center',gap:'3px'}}><Star size={9} fill="#FFAB00" color="#FFAB00"/> Starred</span>}
                            {activeFile.tags.map((t,i)=><span key={i} className="tag-sm">{t}</span>)}
                        </div>
                    </div>

                    <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:'20px'}}>
                        {/* Action buttons */}
                        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                            <button style={{padding:'8px',borderRadius:'8px',border:'none',background:'#0052CC',color:'white',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><CheckSquare size={13}/> Create Task from File</button>
                            <button style={{padding:'8px',borderRadius:'8px',border:'1px solid #DFE1E6',background:'white',color:'#42526E',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><Link size={13}/> Attach to Existing Task</button>
                        </div>

                        {rightTab==='Details' && <>
                            {/* File Details */}
                            <div>
                                <div style={{fontSize:'11px',fontWeight:700,color:'#6B778C',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px'}}>File Details</div>
                                {[
                                    {label:'Uploaded by', val:activeFile.owner},
                                    {label:'Date', val:'Mar 24, 2024 10:30 AM'},
                                    {label:'Location', val:'Design Assets'},
                                    {label:'Size', val:activeFile.size},
                                ].map((d,i)=>(
                                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(9,30,66,0.05)',fontSize:'12px'}}>
                                        <span style={{color:'#6B778C'}}>{d.label}</span>
                                        <span style={{color:'#172B4D',fontWeight:500,textAlign:'right',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Linked Tasks */}
                            <div>
                                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                                    <span style={{fontSize:'11px',fontWeight:700,color:'#6B778C',textTransform:'uppercase',letterSpacing:'0.05em'}}>Linked Tasks (3)</span>
                                    <button style={{background:'none',border:'none',fontSize:'11px',color:'#0052CC',cursor:'pointer',fontWeight:600}}>+ Attach</button>
                                </div>
                                {LINKED_TASKS.map((t,i)=>(
                                    <div key={i} style={{display:'flex',gap:'8px',padding:'8px',borderRadius:'8px',border:'1px solid #DFE1E6',marginBottom:'6px',cursor:'pointer',transition:'background 0.15s'}}>
                                        <div style={{width:6,height:6,borderRadius:'50%',background:t.color,marginTop:'5px',flexShrink:0}}/>
                                        <div style={{flex:1}}>
                                            <div style={{fontSize:'12px',fontWeight:600,color:'#172B4D'}}>{t.title}</div>
                                            <div style={{fontSize:'10px',color:'#6B778C'}}>{t.project} • <span style={{color:t.color,fontWeight:600}}>{t.status}</span></div>
                                        </div>
                                    </div>
                                ))}
                                <button style={{width:'100%',fontSize:'11px',color:'#0052CC',background:'none',border:'none',cursor:'pointer',fontWeight:600,textAlign:'left',padding:'4px 0'}}>View All Tasks →</button>
                            </div>

                            {/* Comments */}
                            <div>
                                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                                    <span style={{fontSize:'11px',fontWeight:700,color:'#6B778C',textTransform:'uppercase',letterSpacing:'0.05em'}}>Comments ({COMMENTS.length})</span>
                                    <button style={{background:'none',border:'none',fontSize:'11px',color:'#0052CC',cursor:'pointer',fontWeight:600}}>+ Add</button>
                                </div>
                                {COMMENTS.map((c,i)=>(
                                    <div key={i} style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
                                        <div style={{width:24,height:24,borderRadius:'50%',background:getAC(c.user),color:'white',fontSize:'8px',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{getInit(c.user)}</div>
                                        <div>
                                            <div style={{fontSize:'11px',fontWeight:700,color:'#172B4D'}}>{c.user} <span style={{fontWeight:400,color:'#8A94A6'}}>{c.time}</span></div>
                                            <div style={{fontSize:'12px',color:'#42526E',lineHeight:1.5}}>{c.text}</div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{display:'flex',gap:'6px'}}>
                                    <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." style={{flex:1,padding:'6px 10px',borderRadius:'6px',border:'1px solid #DFE1E6',fontSize:'12px',outline:'none'}}/>
                                    <button style={{padding:'6px 10px',borderRadius:'6px',border:'none',background:'#0052CC',color:'white',fontSize:'12px',cursor:'pointer',fontWeight:600}}>Send</button>
                                </div>
                            </div>
                        </>}

                        {rightTab==='Versions' && (
                            <div>
                                <div style={{fontSize:'11px',fontWeight:700,color:'#6B778C',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px'}}>Version History</div>
                                {VERSIONS.map((v,i)=>(
                                    <div key={i} style={{display:'flex',gap:'10px',padding:'10px',borderRadius:'8px',border:'1px solid #DFE1E6',marginBottom:'6px',background:v.current?'#F8FAFF':'white'}}>
                                        <div>
                                            <div style={{fontSize:'12px',fontWeight:700,color:'#172B4D',display:'flex',gap:'6px',alignItems:'center'}}>
                                                {v.v}
                                                {v.current&&<span style={{fontSize:'10px',background:'#36B37E',color:'white',padding:'1px 5px',borderRadius:'4px',fontWeight:600}}>Current</span>}
                                            </div>
                                            <div style={{fontSize:'11px',color:'#6B778C'}}>{v.note}</div>
                                            <div style={{fontSize:'10px',color:'#8A94A6'}}>{v.user} • {v.time}</div>
                                        </div>
                                        {!v.current&&<button style={{marginLeft:'auto',background:'none',border:'1px solid #DFE1E6',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',cursor:'pointer',color:'#0052CC',fontWeight:600,alignSelf:'center',flexShrink:0}}>Restore</button>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {rightTab==='Activity' && (
                            <div>
                                <div style={{fontSize:'11px',fontWeight:700,color:'#6B778C',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px'}}>Activity Timeline</div>
                                {ACTIVITY_LOG.map((a,i)=>(
                                    <div key={i} style={{display:'flex',gap:'8px',alignItems:'center',padding:'7px 0',borderBottom:i<ACTIVITY_LOG.length-1?'1px solid rgba(9,30,66,0.06)':'none'}}>
                                        <a.icon size={12} color="#6B778C"/>
                                        <span style={{fontSize:'12px',color:'#42526E',flex:1}}>{a.action}</span>
                                        <span style={{fontSize:'10px',color:'#8A94A6',flexShrink:0}}>{a.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Context Menu ── */}
            {ctx && (
                <div className="ctx-menu" style={{top:ctx.y,left:ctx.x}} onClick={e=>e.stopPropagation()}>
                    <div style={{padding:'6px 12px 4px',fontSize:'11px',fontWeight:700,color:'#6B778C'}}>{ctx.file.name}</div>
                    {[
                        {icon:Eye,label:'Open'},
                        {icon:Eye,label:'Preview'},
                        {icon:Pencil,label:'Rename'},
                        {icon:Folder,label:'Move'},
                        {icon:Share2,label:'Share'},
                        {icon:CheckSquare,label:'Create Task'},
                        {icon:Link,label:'Copy Link'},
                    ].map((item,i)=>(
                        <div key={i} className="ctx-item" onClick={()=>setCtx(null)}>
                            <item.icon size={13} color="#6B778C"/>{item.label}
                        </div>
                    ))}
                    <div style={{height:'1px',background:'#DFE1E6',margin:'4px 0'}}/>
                    <div className="ctx-item danger" onClick={()=>setCtx(null)}><Trash2 size={13}/> Delete</div>
                </div>
            )}
        </main>
    );
}
