"use client";

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Search, Phone, Video, MoreHorizontal, Smile, Paperclip, Mic,
    Send, Bold, Italic, Underline, AlignLeft, AlignCenter,
    List, ListOrdered, Code, AtSign, Hash, Plus, Pin, 
    Download, ExternalLink, Reply, Pencil, Trash2, CheckCheck,
    Check, Users, FileText, Clock, Zap, PanelRight,
    Image as ImageIcon, FileCode, MessageSquare, CornerUpRight,
    CheckCircle2, SlidersHorizontal, Bot, Link, ShieldAlert, Star, Wand2
} from 'lucide-react';

/* ─── Types ─────────────────────────── */
interface Message {
    id: string; 
    sender: string; 
    time: string; 
    content: string;
    type?: 'TEXT' | 'TASK' | 'DECISION' | 'FILE';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    risk?: string;
    reactions?: { emoji: string; count: number }[];
    attachment?: { name: string; size: string; type: 'file' | 'image'; version?: string };
    isOwn?: boolean; 
    threadCount?: number; 
    status?: 'sent' | 'delivered' | 'seen';
    task?: { id: string; title: string; status: string; owner: string; ownerAvatar: string };
    decision?: { id: string; text: string; suggestion: string; applied?: boolean };
}

interface Conversation {
    id: string; 
    name: string; 
    type: 'dm' | 'channel' | 'group';
    lastMsg: string; 
    time: string; 
    unread: number; 
    online?: boolean;
    pinned?: boolean;
    priority?: boolean;
    risk?: 'High' | 'Medium' | 'Low';
    riskLabel?: string;
}

/* ─── Mock Data ─────────────────────── */
const CONVERSATIONS: Conversation[] = [
    { id: 'p1', name: 'Patrick', type: 'dm', lastMsg: "Sounds good, I'll review...", time: '2m', unread: 3, online: true, pinned: true, priority: true, risk: 'Medium', riskLabel: 'Sprint Risk Discussion' },
    { id: 'ds', name: 'Design Systems', type: 'channel', lastMsg: 'New component pushed', time: '7m', unread: 5, risk: 'Low' },
    { id: 'aj', name: 'Alex Johnson', type: 'dm', lastMsg: 'Pinned: 1 minute ago', time: '1h', unread: 0, online: true },
    { id: 'mi', name: 'Michelle', type: 'dm', lastMsg: 'Added a task to track this.', time: '10:14 AM', unread: 1, online: true, priority: true },
    { id: 'bt', name: 'Backend Team', type: 'channel', lastMsg: 'Database migration completed', time: 'Yesterday', unread: 4, risk: 'High', riskLabel: 'Migration Blocker' },
    { id: 'mt', name: 'Marketing Team', type: 'group', lastMsg: 'Campaign is live 🚀', time: 'Yesterday', unread: 2 },
    { id: 'ab', name: 'Adam Brown', type: 'dm', lastMsg: 'Thanks for the update!', time: 'May 22', unread: 0 },
    { id: 'cs', name: 'Corey Stein', type: 'dm', lastMsg: 'Noted 👍', time: 'May 21', unread: 0 },
];

const MESSAGES: Message[] = [
    {
        id: 'm1', sender: 'Michelle', time: '10:02 AM',
        content: "Here's the updated design for the dashboard revamp. Let me know if any adjustments are needed! 😊",
        type: 'FILE',
        attachment: { name: 'Dashboard UI Revamp.fig', size: '12.5 MB', type: 'file', version: 'v2.4' },
        reactions: [{ emoji: '👍', count: 8 }, { emoji: '❤️', count: 2 }], threadCount: 2,
    },
    {
        id: 'm2', sender: 'Patrick', time: '10:04 AM',
        content: "Sounds good, I'll review the latest designs and provide feedback shortly. We should be able to meet the sprint deadline on Friday! 💪",
        reactions: [{ emoji: '👍', count: 78 }, { emoji: '❤️', count: 14 }, { emoji: '🎉', count: 2 }],
        isOwn: true, status: 'seen',
    },
    {
        id: 'm3', sender: 'Michelle', time: '10:14 AM',
        content: "Great! Also, I've linked the design task below 👇",
        type: 'TASK',
        task: { id: 't1', title: 'Dashboard UI Redesign', status: 'In Progress', owner: 'Michelle', ownerAvatar: 'https://i.pravatar.cc/150?u=michelle' },
    },
    {
        id: 'm4', sender: 'Patrick', time: '10:18 AM',
        content: 'On it. Will also run the accessibility checks before EOD.',
        isOwn: true, status: 'delivered',
    },
    {
        id: 'm5', sender: 'Alex Johnson', time: '10:25 AM',
        content: "@Patrick can you share the Figma link when you're done reviewing? Would love to see the changes.",
    },
    {
        id: 'm-decision', sender: 'AI Assistant', time: '10:30 AM',
        content: "I detected a potential delay in the Dashboard UI Redesign due to missing feedback. Should we escalate this to the sprint lead?",
        type: 'DECISION',
        decision: { id: 'd1', text: 'Sprint delay risk detected', suggestion: 'Reassign 2 tasks to Alex to balance workload' },
    }
];

const ANALYTICS = [
    { label: 'Conversation Activity', value: 'Active now', icon: Users, color: '#8B5CF6' },
    { label: 'Response Time', value: 'Avg. 18m', sub: '↑ 12% vs last 7 days', icon: Clock, color: '#10B981' },
    { label: 'Messages Sent', value: '128', sub: '↑ 8% vs last 7 days', icon: Send, color: '#3B82F6' },
    { label: 'Blockers Detected', value: '2', sub: 'View details', icon: ShieldAlert, color: '#EF4444' },
    { label: 'Risk Level', value: 'Medium', sub: 'May impact deadline', icon: Zap, color: '#F59E0B' },
];

const getAvatarColor = (s: string) => {
    const c = ['#0052CC','#36B37E','#FF5630','#FFAB00','#6554C0','#00B8D9','#FF8B00'];
    let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
    return c[Math.abs(h) % c.length];
};
const getInitials = (n: string) => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

/* ─── Conversation Item ──────────────── */
function ConvItem({ conv, active, onClick }: { conv: Conversation; active: boolean; onClick: () => void }) {
    return (
        <div className={`conv-item ${active ? 'active' : ''}`} onClick={onClick}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: getAvatarColor(conv.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                    {getInitials(conv.name)}
                </div>
                {conv.online && <div className="online-dot" style={{ border: '2px solid #141C2F', width: '12px', height: '12px' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{conv.name}</span>
                        {conv.priority && <span style={{ background: 'linear-gradient(135deg, #FF5630 0%, #FF8B00 100%)', color: 'white', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', textTransform: 'uppercase' }}>Priority</span>}
                    </div>
                    <span className="conv-time" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{conv.time}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>{conv.lastMsg}</span>
                    {conv.risk && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ 
                                color: conv.risk === 'High' ? '#FF5630' : conv.risk === 'Medium' ? '#FFAB00' : '#36B37E',
                                fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                                background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px'
                            }}>
                                <ShieldAlert size={10} /> {conv.riskLabel || `${conv.risk} Risk`}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {conv.unread > 0 && (
                <div style={{ background: '#0052CC', color: 'white', fontSize: '10px', fontWeight: 800, borderRadius: '12px', padding: '2px 8px', minWidth: '22px', textAlign: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,82,204,0.4)' }}>{conv.unread}</div>
            )}
        </div>
    );
}

/* ─── Main Page ──────────────────────── */
export default function MessagesPage() {
    const [activeConv, setActiveConv] = useState<Conversation>(CONVERSATIONS[0]);
    const [activeTab, setActiveTab] = useState('All');
    const [message, setMessage] = useState('');
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [rightTab, setRightTab] = useState('Details');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeConv]);

    const filtered = CONVERSATIONS.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeTab === 'All' || (activeTab === 'Direct' && c.type === 'dm') || (activeTab === 'Mentions' && c.id === 'cs'))
    );
    const pinned = filtered.filter(c => c.pinned);
    const rest = filtered.filter(c => !c.pinned);

    return (
        <main style={{ display: 'flex', height: '100vh', background: '#F4F5F7', overflow: 'hidden' }}>
            <Sidebar />
            <style>{`
                .conv-item { display:flex; align-items:center; padding:12px 14px; gap:12px; cursor:pointer; border-radius:12px; transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position:relative; margin: 2px 8px; }
                .conv-item:hover { background:rgba(255,255,255,0.08); transform: translateX(4px); }
                .conv-item.active { background:rgba(0,82,204,0.25); border: 1px solid rgba(0,82,204,0.3); }
                .conv-item.active::before { content:''; position:absolute; left:0; top:12px; bottom:12px; width:4px; background:#0052CC; border-radius:0 4px 4px 0; }
                
                .msg-wrap { display:flex; gap:12px; padding:8px 12px; border-radius:16px; position:relative; transition:all 0.2s ease; margin-bottom: 4px; }
                .msg-wrap:hover { background:rgba(9,30,66,0.03); }
                
                .msg-hover-bar { display:none; position:absolute; right:12px; top:-20px; background:white; border:1px solid #DFE1E6; border-radius:10px; padding:4px; gap:4px; box-shadow:0 8px 24px rgba(9,30,66,0.15); z-index:100; }
                .msg-wrap:hover .msg-hover-bar { display:flex; }
                
                .ha-btn { background:none; border:none; width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6B778C; transition:all 0.15s; }
                .ha-btn:hover { background:#EBECF0; color:#172B4D; }
                
                .tab-btn { padding:6px 14px; border-radius:10px; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:6px; }
                .tab-btn.active { background:#0052CC; color:white; box-shadow: 0 4px 12px rgba(0,82,204,0.3); }
                .tab-btn:not(.active) { background:transparent; color:rgba(255,255,255,0.5); }
                .tab-btn:not(.active):hover { background:rgba(255,255,255,0.1); color:white; }
                
                .rtab-btn { padding:8px 16px; border-radius:12px; font-size:12px; font-weight:700; border:none; cursor:pointer; transition:all 0.2s; position:relative; }
                .rtab-btn.active { background:white; color:#0052CC; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .rtab-btn:not(.active) { background:transparent; color:#6B778C; }
                .rtab-btn:not(.active):hover { background:rgba(0,0,0,0.03); }
                
                .icon-btn { background:none; border:none; width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6B778C; transition:all 0.2s; }
                .icon-btn:hover { background:#EBECF0; color:#172B4D; transform:translateY(-1px); }
                
                .send-btn { background:linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border:none; border-radius:12px; padding:0 20px; height:42px; color:white; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s; box-shadow: 0 4px 12px rgba(0,82,204,0.3); }
                .send-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,82,204,0.4); }
                
                .slabel { font-size:11px; font-weight:800; letter-spacing:0.1em; color:rgba(255,255,255,0.3); padding:16px 20px 8px; text-transform:uppercase; }
                .online-dot { width:12px; height:12px; border-radius:50%; background:#36B37E; position:absolute; bottom:-2px; right:-2px; border:2px solid #1A2744; }
                .online-dot-light { width:10px; height:10px; border-radius:50%; background:#36B37E; border:2px solid white; position:absolute; bottom:0; right:0; }
                
                .enterprise-scrollbar::-webkit-scrollbar { width: 6px; }
                .enterprise-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .enterprise-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
                .enterprise-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
            `}</style>

            {/* ── Conversation Panel (Dark Premium) ── */}
            <div style={{ width: '300px', background: '#141C2F', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', marginLeft: '260px', height: '100vh', flexShrink: 0, zIndex: 10 }}>
                <div style={{ padding: '24px 16px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>Messages</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}><Plus size={20} /></button>
                        </div>
                    </div>
                    
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search messages, people..." style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }} className="enterprise-scrollbar">
                        {['All', 'Priority', 'Direct', 'AI Suggested'].map(t => (
                            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ whiteSpace: 'nowrap' }}>
                                {t}
                                {t === 'Priority' && <span style={{ background: '#FF5630', fontSize: '10px', padding: '1px 5px', borderRadius: '5px' }}>5</span>}
                                {t === 'AI Suggested' && <span style={{ background: '#8B5CF6', fontSize: '10px', padding: '1px 5px', borderRadius: '5px' }}>3</span>}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {['Urgent', 'Projects', 'Blockers'].map(f => (
                            <button key={f} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '5px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }} className="enterprise-scrollbar">
                    {pinned.length > 0 && <>
                        <div className="slabel">PINNED</div>
                        {pinned.map(c => <ConvItem key={c.id} conv={c} active={activeConv.id === c.id} onClick={() => setActiveConv(c)} />)}
                    </>}
                    
                    <div className="slabel">RECENT</div>
                    {rest.map(c => <ConvItem key={c.id} conv={c} active={activeConv.id === c.id} onClick={() => setActiveConv(c)} />)}
                    
                    <div style={{ padding: '20px 16px' }}>
                        <button style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>View Archive</button>
                    </div>
                </div>
            </div>

            {/* ── Main Chat Area (Premium Light) ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#F8FAFF', position: 'relative' }}>
                {/* Header */}
                <div style={{ padding: '0 32px', height: '72px', borderBottom: '1px solid #EBECF0', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', zIndex: 5 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: getAvatarColor(activeConv.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{getInitials(activeConv.name)}</div>
                        {activeConv.online && <div className="online-dot-light" style={{ width: '12px', height: '12px', bottom: '1px', right: '1px' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '17px', fontWeight: 800, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {activeConv.name}
                            {activeConv.online && <span style={{ fontSize: '11px', color: '#36B37E', fontWeight: 700, background: '#E3FCEF', padding: '2px 8px', borderRadius: '6px' }}>Online</span>}
                            <Star size={16} style={{ color: '#FFAB00', cursor: 'pointer', fill: '#FFAB00' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <div style={{ fontSize: '12px', color: '#6B778C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Context: <span style={{ fontWeight: 700, color: '#42526E' }}>Sprint 12 Discussion</span>
                            </div>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#DFE1E6' }} />
                            <div style={{ fontSize: '12px', color: '#6B778C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Project: <span style={{ fontWeight: 700, color: '#0052CC' }}>E-Commerce Platform</span>
                            </div>
                            {activeConv.risk && (
                                <>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#DFE1E6' }} />
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: activeConv.risk === 'High' ? '#FF5630' : '#FFAB00', background: activeConv.risk === 'High' ? '#FFEBE6' : '#FFF4E6', padding: '1px 8px', borderRadius: '4px' }}>{activeConv.risk} Risk Detected</div>
                                </>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[Phone, Video, Users, Search, MoreHorizontal].map((Icon, i) => (
                            <button key={i} className="icon-btn" style={{ width: '40px', height: '40px' }}><Icon size={20} /></button>
                        ))}
                        <button className="icon-btn" onClick={() => setRightPanelOpen(p => !p)} style={{ width: '40px', height: '40px', color: rightPanelOpen ? '#0052CC' : '#6B778C', background: rightPanelOpen ? '#E6EFFF' : 'transparent' }}>
                            <PanelRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="enterprise-scrollbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '12px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #EBECF0)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tuesday, May 24</span>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #EBECF0)' }} />
                    </div>

                    {MESSAGES.map(msg => (
                        <div key={msg.id} className="msg-wrap" style={{ flexDirection: msg.isOwn ? 'row-reverse' : 'row' }}>
                            {!msg.isOwn && (
                                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: getAvatarColor(msg.sender), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0, marginTop: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                    {getInitials(msg.sender)}
                                </div>
                            )}
                            <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: msg.isOwn ? 'flex-end' : 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '0 4px' }}>
                                    {!msg.isOwn && <span style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>{msg.sender}</span>}
                                    <span style={{ fontSize: '11px', color: '#8A94A6', fontWeight: 600 }}>{msg.time}</span>
                                </div>

                                <div style={{ 
                                    background: msg.isOwn ? 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)' : 'white', 
                                    color: msg.isOwn ? 'white' : '#172B4D',
                                    borderRadius: msg.isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    padding: '14px 18px', fontSize: '15px', lineHeight: 1.6,
                                    boxShadow: msg.isOwn ? '0 8px 20px rgba(0,82,204,0.15)' : '0 4px 12px rgba(9,30,66,0.05)',
                                    border: msg.isOwn ? 'none' : '1px solid #EBECF0'
                                }}>
                                    {msg.content}
                                </div>

                                {msg.type === 'FILE' && msg.attachment && (
                                    <div style={{ marginTop: '12px', background: 'white', border: '1px solid #EBECF0', borderRadius: '16px', overflow: 'hidden', width: '340px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
                                        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '56px', height: '56px', background: '#F4F5F7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" alt="Figma" style={{ width: '28px' }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '15px', fontWeight: 800, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.attachment.name}</div>
                                                <div style={{ fontSize: '12px', color: '#6B778C', marginTop: '2px' }}>{msg.attachment.size} • Figma Design • {msg.attachment.version}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', borderTop: '1px solid #EBECF0', background: '#FAFBFC', padding: '4px' }}>
                                            <button style={{ flex: 1, padding: '10px', background: 'none', border: 'none', fontSize: '12px', fontWeight: 700, color: '#42526E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Search size={14} /> Preview</button>
                                            <button style={{ flex: 1, padding: '10px', background: 'none', border: 'none', fontSize: '12px', fontWeight: 800, color: '#0052CC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><ExternalLink size={14} /> Open Figma</button>
                                        </div>
                                    </div>
                                )}

                                {msg.type === 'TASK' && msg.task && (
                                    <div style={{ marginTop: '12px', background: 'white', border: '1px solid rgba(0,82,204,0.15)', borderRadius: '16px', overflow: 'hidden', width: '320px', boxShadow: '0 12px 32px rgba(0,82,204,0.1)' }}>
                                        <div style={{ padding: '10px 16px', background: '#F0F5FF', borderBottom: '1px solid rgba(0,82,204,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Check size={12} color="white" />
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0052CC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Project Task</span>
                                        </div>
                                        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '15px', fontWeight: 800, color: '#172B4D' }}>{msg.task.title}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                                    <span style={{ fontSize: '12px', color: '#36B37E', fontWeight: 700, background: '#E3FCEF', padding: '2px 8px', borderRadius: '6px' }}>{msg.task.status}</span>
                                                    <span style={{ fontSize: '12px', color: '#6B778C' }}>{msg.task.owner}</span>
                                                </div>
                                            </div>
                                            <img src={msg.task.ownerAvatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                        </div>
                                        <button style={{ width: '100%', padding: '12px', background: '#FAFBFC', border: 'none', borderTop: '1px solid #EBECF0', fontSize: '13px', fontWeight: 700, color: '#0052CC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            View Execution Details <CornerUpRight size={14} />
                                        </button>
                                    </div>
                                )}

                                {msg.type === 'DECISION' && msg.decision && (
                                    <div style={{ marginTop: '12px', background: 'white', border: '1px solid #8B5CF6', borderRadius: '18px', overflow: 'hidden', width: '360px', boxShadow: '0 16px 40px rgba(139,92,246,0.15)' }}>
                                        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', borderBottom: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Zap size={14} color="white" fill="white" />
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Risk Resolution</span>
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#172B4D', marginBottom: '8px' }}>{msg.decision.text}</div>
                                            <div style={{ fontSize: '13px', color: '#42526E', lineHeight: 1.6, background: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #EBECF0' }}>
                                                <span style={{ fontWeight: 800, color: '#8B5CF6' }}>Suggestion:</span> {msg.decision.suggestion}
                                            </div>
                                        </div>
                                        <div style={{ padding: '12px 20px 20px', display: 'flex', gap: '12px' }}>
                                            <button style={{ flex: 1, padding: '10px', background: '#8B5CF6', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>Apply Resolution</button>
                                            <button style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #DFE1E6', borderRadius: '10px', color: '#42526E', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Discuss Alternative</button>
                                        </div>
                                    </div>
                                )}

                                {(msg.reactions || msg.threadCount) && (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        {msg.reactions?.map((r, i) => (
                                            <div key={i} className="reaction-chip" style={{ padding: '4px 10px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                                                {r.emoji} <span style={{ fontSize: '12px', fontWeight: 800, color: '#42526E' }}>{r.count}</span>
                                            </div>
                                        ))}
                                        {msg.threadCount && (
                                            <button style={{ fontSize: '12px', color: '#0052CC', background: '#E6EFFF', border: '1px solid rgba(0,82,204,0.1)', borderRadius: '12px', padding: '4px 12px', cursor: 'pointer', fontWeight: 800 }}>
                                                {msg.threadCount} Replies
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="msg-hover-bar">
                                {[Reply, Smile, CheckCircle2, Pin, MoreHorizontal].map((Icon, i) => (
                                    <button key={i} className="ha-btn"><Icon size={16} /></button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <div style={{ padding: '24px 32px', background: 'white', borderTop: '1px solid #EBECF0', boxShadow: '0 -4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ border: '2px solid #EBECF0', borderRadius: '20px', overflow: 'hidden', background: '#F9FAFB', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#0052CC'}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px' }}>
                            <button className="icon-btn" style={{ background: 'white', border: '1px solid #EBECF0' }}><Plus size={22} /></button>
                            <input value={message} onChange={e => setMessage(e.target.value)} 
                                placeholder={`Message ${activeConv.name}...`}
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', color: '#172B4D', background: 'transparent', fontWeight: 500 }} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="icon-btn" style={{ background: 'white', border: '1px solid #EBECF0' }}><Mic size={20} /></button>
                                <button className="send-btn">
                                    <Send size={18} /> Send
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid #EBECF0', gap: '8px', background: 'white' }}>
                            <button className="icon-btn" style={{ width: 'auto', padding: '0 12px', fontSize: '13px', fontWeight: 700, gap: '8px', color: '#42526E' }}>
                                <Plus size={16} /> Task
                            </button>
                            <button className="icon-btn" style={{ width: 'auto', padding: '0 12px', fontSize: '13px', fontWeight: 700, gap: '8px', color: '#42526E' }}>
                                <Paperclip size={16} /> File
                            </button>
                            <button className="icon-btn" style={{ width: 'auto', padding: '0 12px', fontSize: '13px', fontWeight: 800, gap: '8px', background: '#F5F3FF', color: '#8B5CF6' }}>
                                <Bot size={16} /> AI Assistant
                            </button>
                            <div style={{ flex: 1 }} />
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {[Bold, Italic, Code, Link, Smile].map((Icon, i) => (
                                    <button key={i} className="ha-btn"><Icon size={18} /></button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Analytics Row (Stroovo Intelligence) */}
                <div style={{ padding: '16px 32px', background: '#F4F5F7', borderTop: '1px solid #EBECF0', display: 'flex', gap: '16px', overflowX: 'auto' }} className="enterprise-scrollbar">
                    {ANALYTICS.map((item, i) => (
                        <div key={i} style={{ flex: 1, minWidth: '220px', background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #EBECF0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <item.icon size={22} color={item.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', color: '#6B778C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#172B4D' }}>{item.value}</span>
                                    {item.sub && <span style={{ fontSize: '11px', color: item.color === '#EF4444' ? '#EF4444' : '#36B37E', fontWeight: 700 }}>{item.sub}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right Context Panel (Premium Glass) ── */}
            {rightPanelOpen && (
                <div style={{ width: '340px', background: 'white', borderLeft: '1px solid #EBECF0', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
                    <div style={{ padding: '24px 20px 0' }}>
                        <div style={{ background: '#F4F5F7', padding: '4px', borderRadius: '14px', display: 'flex', gap: '4px', marginBottom: '24px' }}>
                            {['Details', 'Tasks', 'Files', 'AI Insights'].map(t => (
                                <button key={t} 
                                    className={`rtab-btn ${rightTab === t ? 'active' : ''}`} 
                                    onClick={() => setRightTab(t)}
                                    style={{ flex: 1 }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }} className="enterprise-scrollbar">
                        {rightTab === 'AI Insights' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(139,92,246,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <Bot size={20} color="#8B5CF6" />
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intelligence Summary</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { t: 'Sprint Blocker', d: 'Figma review is pending for Dashboard UI', icon: ShieldAlert, c: '#FF5630' },
                                            { t: 'Resource Risk', d: 'Alex has 3 concurrent high-priority tasks', icon: Zap, c: '#FFAB00' },
                                            { t: 'Automation', d: 'Auto-syncing design updates to Jira', icon: Wand2, c: '#0052CC' }
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                                <item.icon size={16} color={item.c} style={{ marginTop: '2px', flexShrink: 0 }} />
                                                <div style={{ fontSize: '13px', color: '#42526E', lineHeight: 1.5 }}>
                                                    <strong style={{ color: '#172B4D' }}>{item.t}:</strong> {item.d}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'white', border: '1px solid #8B5CF6', borderRadius: '12px', color: '#8B5CF6', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Bot size={16} /> Deep Analysis Report
                                    </button>
                                </div>
                            </div>
                        )}

                        {rightTab === 'Tasks' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Linked Execution (6)</span>
                                    <button style={{ background: 'none', border: 'none', fontSize: '12px', color: '#0052CC', cursor: 'pointer', fontWeight: 800 }}>+ Add Task</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { title: 'Dashboard UI Redesign', status: 'In Progress', date: 'May 30', owner: 'Michelle', color: '#36B37E' },
                                        { title: 'User Analytics API', status: 'In Progress', date: 'May 28', owner: 'Alex', color: '#36B37E' },
                                        { title: 'Accessibility Audit', status: 'To Do', date: 'May 27', owner: 'Patrick', color: '#6B778C' },
                                    ].map((t, i) => (
                                        <div key={i} style={{ padding: '14px', borderRadius: '16px', border: '1px solid #EBECF0', background: 'white', display: 'flex', gap: '14px', alignItems: 'center', transition: 'all 0.2s' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: '2px solid #EBECF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                                                <div style={{ fontSize: '11px', color: t.color, fontWeight: 700, marginTop: '2px' }}>{t.status}</div>
                                            </div>
                                            <img src={`https://i.pravatar.cc/150?u=${t.owner}`} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #EBECF0' }} />
                                        </div>
                                    ))}
                                    <button style={{ padding: '10px', borderRadius: '12px', background: '#F4F5F7', border: 'none', color: '#6B778C', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>View All Linked Tasks</button>
                                </div>
                            </>
                        )}

                        {rightTab === 'Files' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Shared Context (4)</span>
                                    <button style={{ background: 'none', border: 'none', fontSize: '12px', color: '#0052CC', cursor: 'pointer', fontWeight: 800 }}>Upload</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { name: 'Dashboard UI Revamp.fig', type: 'Figma', size: '12.5 MB', date: 'Today', icon: FileCode, color: '#A259FF' },
                                        { name: 'User Flow Diagram.png', type: 'Image', size: '2.4 MB', date: 'Yesterday', icon: ImageIcon, color: '#00B8D9' },
                                        { name: 'Sprint Requirements.pdf', type: 'PDF', size: '1.2 MB', date: 'May 22', icon: FileText, color: '#FF5630' },
                                    ].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', borderRadius: '12px', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${f.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <f.icon size={20} color={f.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                                                <div style={{ fontSize: '11px', color: '#6B778C' }}>{f.type} • {f.size}</div>
                                            </div>
                                            <span style={{ fontSize: '10px', color: '#8A94A6', fontWeight: 600 }}>{f.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {rightTab === 'Details' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Team Members (4)</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { name: 'Patrick', role: 'Project Lead', online: true },
                                            { name: 'Michelle', role: 'Design Lead', online: true },
                                            { name: 'Alex Johnson', role: 'Fullstack Engineer', online: true },
                                            { name: 'Sara Khan', role: 'QA Engineer', online: false },
                                        ].map((m, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: getAvatarColor(m.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{getInitials(m.name)}</div>
                                                    {m.online && <div className="online-dot-light" style={{ width: '10px', height: '10px', border: '2px solid white' }} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D' }}>{m.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#6B778C' }}>{m.role}</div>
                                                </div>
                                                <button className="ha-btn" style={{ background: '#F4F5F7' }}><MoreHorizontal size={14} /></button>
                                            </div>
                                        ))}
                                        <button style={{ marginTop: '8px', padding: '10px', borderRadius: '12px', border: '2px dashed #EBECF0', background: 'transparent', color: '#6B778C', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>+ Add Team Member</button>
                                    </div>
                                </div>
                                
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Shared Permissions</div>
                                    <div style={{ background: '#F4F5F7', padding: '16px', borderRadius: '16px' }}>
                                        <div style={{ fontSize: '13px', color: '#42526E', lineHeight: 1.5 }}>
                                            Only members of <span style={{ fontWeight: 700, color: '#0052CC' }}>E-Commerce Team</span> can view these discussions and linked tasks.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
