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
    CheckCircle2
} from 'lucide-react';

/* ─── Types ─────────────────────────── */
interface Message {
    id: string; sender: string; time: string; content: string;
    reactions?: { emoji: string; count: number }[];
    attachment?: { name: string; size: string; type: 'file' | 'image' };
    isOwn?: boolean; threadCount?: number; status?: 'sent' | 'delivered' | 'seen';
    task?: { title: string; status: string };
}
interface Conversation {
    id: string; name: string; type: 'dm' | 'channel' | 'group';
    lastMsg: string; time: string; unread: number; online?: boolean;
    pinned?: boolean;
}

/* ─── Mock Data ─────────────────────── */
const CONVERSATIONS: Conversation[] = [
    { id: 'p1', name: 'Patrick', type: 'dm', lastMsg: "Sounds good, I'll review...", time: '2m', unread: 3, online: true, pinned: true },
    { id: 'ds', name: 'Design Systems', type: 'channel', lastMsg: 'New component pushed', time: '7m', unread: 5 },
    { id: 'aj', name: 'Alex Johnson', type: 'dm', lastMsg: 'Pinned: 1 minute ago', time: '1h', unread: 0, online: true },
    { id: 'ab', name: 'Adam Brown', type: 'dm', lastMsg: 'Pinned: 3 messages', time: '3h', unread: 0, online: false },
    { id: 'mt', name: 'Marketing Team', type: 'group', lastMsg: 'Campaign is live 🚀', time: '1d', unread: 12 },
    { id: 'cs', name: 'Corey Stein', type: 'dm', lastMsg: '← Mentioned you 👍', time: '2d', unread: 1, online: false },
    { id: 'aw', name: 'Anna Williams', type: 'dm', lastMsg: 'Let me check the specs', time: '2d', unread: 0 },
    { id: 'js', name: 'John Smith', type: 'dm', lastMsg: 'Will do. Thanks!', time: '3d', unread: 0 },
];
const CHANNELS = ['Core Dev', 'Design Systems', 'Marketing Team'];

const MESSAGES: Message[] = [
    {
        id: 'm1', sender: 'Michelle', time: '10:02 AM',
        content: "Here's the updated design for the dashboard revamp. Let me know if any adjustments are needed! 😊",
        attachment: { name: 'Dashboard UI Revamp.fig', size: '12.5 MB', type: 'file' },
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
        task: { title: 'Dashboard UI Redesign', status: 'In Progress' },
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
        id: 'm6', sender: 'Patrick', time: '10:30 AM',
        content: 'Sure @Alex, will drop it here by 3 PM.',
        isOwn: true, status: 'seen',
    },
];

const RIGHT_MEMBERS = [
    { name: 'Michelle', role: 'Designer', online: true },
    { name: 'Alex Johnson', role: 'Frontend Dev', online: true },
    { name: 'Sara Khan', role: 'QA Engineer', online: false },
];
const PINNED_MSGS = [
    'Dashboard UI Revamp.fig — shared by Michelle',
    'Sprint deadline confirmed: Friday EOD',
];
const SHARED_FILES = [
    { Icon: FileCode, color: '#0052CC', name: 'dashboard_schema.sql', time: '2d ago' },
    { Icon: ImageIcon, color: '#36B37E', name: 'ui_revamp_v3.png', time: '3d ago' },
    { Icon: FileText, color: '#6554C0', name: 'spec_review.docx', time: '4d ago' },
];
const LINKED_TASKS = [
    { title: 'Dashboard UI Redesign', status: 'In Progress', color: '#0052CC' },
    { title: 'Accessibility Audit', status: 'To Do', color: '#FFAB00' },
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
                {conv.type !== 'dm'
                    ? <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: getAvatarColor(conv.name), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {conv.type === 'channel' ? <Hash size={14} color="white" /> : <Users size={14} color="white" />}
                    </div>
                    : <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: getAvatarColor(conv.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{getInitials(conv.name)}</div>
                }
                {conv.online && <div className="online-dot" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: conv.unread > 0 ? 700 : 500, color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{conv.name}</span>
                    <span className="conv-time" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginLeft: '6px' }}>{conv.time}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>{conv.lastMsg}</span>
            </div>
            {conv.unread > 0 && (
                <div style={{ background: '#0052CC', color: 'white', fontSize: '10px', fontWeight: 700, borderRadius: '10px', padding: '1px 6px', minWidth: '18px', textAlign: 'center', flexShrink: 0 }}>{conv.unread}</div>
            )}
            <div className="conv-actions">
                <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }} onClick={e => e.stopPropagation()}><MoreHorizontal size={12} /></button>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────── */
export default function MessagesPage() {
    const [activeConv, setActiveConv] = useState<Conversation>(CONVERSATIONS[0]);
    const [activeTab, setActiveTab] = useState('All');
    const [message, setMessage] = useState('');
    const [isTyping] = useState(true);
    const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [rightTab, setRightTab] = useState('Members');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);

    const filtered = CONVERSATIONS.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeTab === 'All' || (activeTab === 'Direct' && c.type === 'dm') || (activeTab === 'Mentions' && c.id === 'cs'))
    );
    const pinned = filtered.filter(c => c.pinned);
    const rest = filtered.filter(c => !c.pinned);

    return (
        <main style={{ display: 'flex', minHeight: '100vh', background: '#F4F5F7' }}>
            <Sidebar />
            <style>{`
                .conv-item { display:flex; align-items:center; padding:9px 10px; gap:10px; cursor:pointer; border-radius:8px; transition:all 0.15s; position:relative; }
                .conv-item:hover { background:rgba(255,255,255,0.06); }
                .conv-item.active { background:rgba(0,82,204,0.18); }
                .conv-actions { display:none; position:absolute; right:8px; top:50%; transform:translateY(-50%); }
                .conv-item:hover .conv-actions { display:flex; }
                .conv-item:hover .conv-time { display:none; }
                .msg-wrap { display:flex; gap:10px; padding:5px 8px; border-radius:8px; position:relative; transition:background 0.15s; }
                .msg-hover-bar { display:none; position:absolute; right:8px; top:-18px; background:white; border:1px solid rgba(9,30,66,0.1); border-radius:8px; padding:3px; gap:2px; box-shadow:0 4px 12px rgba(9,30,66,0.12); z-index:10; }
                .msg-wrap:hover .msg-hover-bar { display:flex; }
                .msg-wrap:hover { background:rgba(9,30,66,0.02); }
                .ha-btn { background:none; border:none; width:26px; height:26px; border-radius:5px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6B778C; transition:all 0.15s; }
                .ha-btn:hover { background:#F4F5F7; color:#172B4D; }
                .tab-btn { padding:5px 12px; border-radius:6px; font-size:12px; font-weight:600; border:none; cursor:pointer; transition:all 0.15s; }
                .tab-btn.active { background:#0052CC; color:white; }
                .tab-btn:not(.active) { background:transparent; color:rgba(255,255,255,0.55); }
                .tab-btn:not(.active):hover { background:rgba(255,255,255,0.08); color:white; }
                .rtab-btn { padding:5px 10px; border-radius:6px; font-size:11px; font-weight:600; border:none; cursor:pointer; transition:all 0.15s; }
                .rtab-btn.active { background:#E6EFFF; color:#0052CC; }
                .rtab-btn:not(.active) { background:transparent; color:#6B778C; }
                .rtab-btn:not(.active):hover { background:#F4F5F7; }
                .fmt-btn { background:none; border:none; width:26px; height:26px; border-radius:4px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6B778C; transition:all 0.15s; }
                .fmt-btn:hover { background:#F4F5F7; color:#172B4D; }
                .reaction-chip { display:inline-flex; align-items:center; gap:3px; padding:3px 8px; border-radius:12px; background:#F4F5F7; border:1px solid #DFE1E6; font-size:12px; cursor:pointer; transition:all 0.15s; }
                .reaction-chip:hover { background:#E6EFFF; border-color:rgba(0,82,204,0.2); }
                .online-dot { width:8px; height:8px; border-radius:50%; background:#36B37E; border:2px solid #1E2A45; position:absolute; bottom:-1px; right:-1px; }
                .online-dot-light { width:8px; height:8px; border-radius:50%; background:#36B37E; border:1.5px solid white; position:absolute; bottom:-1px; right:-1px; }
                .slabel { font-size:10px; font-weight:700; letter-spacing:0.06em; color:rgba(255,255,255,0.35); padding:10px 10px 4px; text-transform:uppercase; }
                .icon-btn { background:none; border:none; width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6B778C; transition:all 0.15s; }
                .icon-btn:hover { background:#F4F5F7; color:#172B4D; }
                .send-btn { background:#0052CC; border:none; border-radius:8px; padding:0 16px; height:34px; color:white; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:background 0.2s; white-space:nowrap; }
                .send-btn:hover { background:#0065FF; }
                @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }
            `}</style>

            {/* ── Conversation Panel ── */}
            <div style={{ width: '260px', background: '#1A2744', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', marginLeft: '240px', minHeight: '100vh', flexShrink: 0 }}>
                <div style={{ padding: '18px 12px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Messages</h2>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px' }}><Plus size={16} /></button>
                    </div>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." style={{ width: '100%', padding: '7px 12px 7px 30px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '12px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                        {['All', 'Mentions', 'Direct'].map(t => (
                            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 12px' }}>
                    {pinned.length > 0 && <>
                        <div className="slabel">MY MESSAGES</div>
                        {pinned.map(c => <ConvItem key={c.id} conv={c} active={activeConv.id === c.id} onClick={() => setActiveConv(c)} />)}
                    </>}
                    {rest.filter(c => c.type === 'dm').map(c => <ConvItem key={c.id} conv={c} active={activeConv.id === c.id} onClick={() => setActiveConv(c)} />)}
                    {rest.filter(c => c.type !== 'dm').length > 0 && <>
                        <div className="slabel">TEAM CHANNELS</div>
                        {CHANNELS.map(ch => (
                            <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '13px', borderRadius: '6px', transition: 'all 0.15s' }}>
                                <Hash size={13} />{ch}
                            </div>
                        ))}
                    </>}
                </div>

                <div style={{ padding: '10px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        <Plus size={13} /> New Message
                    </button>
                </div>
            </div>

            {/* ── Main Chat ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'white' }}>
                {/* Header */}
                <div style={{ padding: '0 20px', height: '56px', borderBottom: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: getAvatarColor(activeConv.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{getInitials(activeConv.name)}</div>
                        {activeConv.online && <div className="online-dot-light" style={{ border: '1.5px solid white' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#172B4D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {activeConv.name}
                            {activeConv.online && <span style={{ fontSize: '10px', fontWeight: 600, color: '#36B37E', display: 'flex', alignItems: 'center', gap: '3px' }}>● Online</span>}
                        </div>
                        {isTyping && <div style={{ fontSize: '11px', color: '#6B778C' }}><span style={{ color: '#0052CC', fontWeight: 600 }}>Patrick</span> is typing...</div>}
                    </div>
                    <button className="icon-btn" title="Call"><Phone size={16} /></button>
                    <button className="icon-btn" title="Video"><Video size={16} /></button>
                    <button className="icon-btn" title="Search"><Search size={16} /></button>
                    <button className="icon-btn" title="Context Panel" onClick={() => setRightPanelOpen(p => !p)} style={{ color: rightPanelOpen ? '#0052CC' : '#6B778C', background: rightPanelOpen ? '#E6EFFF' : 'transparent' }}>
                        <PanelRight size={16} />
                    </button>
                    <button className="icon-btn"><MoreHorizontal size={16} /></button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 16px', color: '#6B778C' }}>
                        <div style={{ flex: 1, height: '1px', background: '#DFE1E6' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>Today</span>
                        <div style={{ flex: 1, height: '1px', background: '#DFE1E6' }} />
                    </div>

                    {MESSAGES.map(msg => (
                        <div key={msg.id} className="msg-wrap" style={{ flexDirection: msg.isOwn ? 'row-reverse' : 'row', marginBottom: '2px' }}
                            onMouseEnter={() => setHoveredMsg(msg.id)} onMouseLeave={() => setHoveredMsg(null)}>
                            {!msg.isOwn && (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: getAvatarColor(msg.sender), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-start', marginTop: '2px' }}>
                                    {getInitials(msg.sender)}
                                </div>
                            )}
                            <div style={{ maxWidth: '62%' }}>
                                {!msg.isOwn && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#172B4D' }}>{msg.sender}</span>
                                        <span style={{ fontSize: '10px', color: '#8A94A6' }}>{msg.time}</span>
                                    </div>
                                )}
                                {msg.isOwn && <div style={{ fontSize: '10px', color: '#8A94A6', textAlign: 'right', marginBottom: '3px' }}>{msg.time}</div>}
                                <div style={{ background: msg.isOwn ? '#E6EFFF' : '#F4F5F7', borderRadius: msg.isOwn ? '12px 12px 4px 12px' : '12px 12px 12px 4px', padding: '10px 14px', fontSize: '13px', color: '#172B4D', lineHeight: 1.55, border: msg.isOwn ? '1px solid rgba(0,82,204,0.12)' : 'none' }}>
                                    {msg.content}
                                </div>
                                {msg.attachment && (
                                    <div style={{ marginTop: '8px', border: '1px solid #DFE1E6', borderRadius: '10px', overflow: 'hidden', maxWidth: '300px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'white' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#E6EFFF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FileCode size={18} color="#0052CC" />
                                            </div>
                                            <div><div style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{msg.attachment.name}</div><div style={{ fontSize: '11px', color: '#6B778C' }}>{msg.attachment.size}</div></div>
                                        </div>
                                        <div style={{ display: 'flex', borderTop: '1px solid #DFE1E6' }}>
                                            <button style={{ flex: 1, padding: '8px', background: 'none', border: 'none', fontSize: '12px', fontWeight: 600, color: '#42526E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Download size={12} /> Download</button>
                                            <div style={{ width: '1px', background: '#DFE1E6' }} />
                                            <button style={{ flex: 1, padding: '8px', background: 'none', border: 'none', fontSize: '12px', fontWeight: 600, color: '#0052CC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><ExternalLink size={12} /> Open in Figma</button>
                                        </div>
                                    </div>
                                )}
                                {msg.task && (
                                    <div style={{ marginTop: '8px', border: '1px solid rgba(0,82,204,0.18)', borderRadius: '8px', padding: '8px 12px', background: '#F8FAFF', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '280px', cursor: 'pointer' }}>
                                        <CheckCircle2 size={14} color="#0052CC" />
                                        <div style={{ flex: 1 }}><div style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{msg.task.title}</div><div style={{ fontSize: '10px', color: '#0052CC' }}>{msg.task.status}</div></div>
                                        <CornerUpRight size={12} color="#6B778C" />
                                    </div>
                                )}
                                {(msg.reactions || msg.threadCount) && (
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '6px', flexWrap: 'wrap', justifyContent: msg.isOwn ? 'flex-end' : 'flex-start' }}>
                                        {msg.reactions?.map((r, i) => <span key={i} className="reaction-chip">{r.emoji} {r.count}</span>)}
                                        {msg.threadCount && <button style={{ fontSize: '11px', color: '#0052CC', background: 'none', border: '1px solid rgba(0,82,204,0.2)', borderRadius: '10px', padding: '2px 8px', cursor: 'pointer', fontWeight: 600 }}>{msg.threadCount} replies</button>}
                                    </div>
                                )}
                                {msg.isOwn && msg.status && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3px' }}>
                                        {msg.status === 'seen' && <CheckCheck size={12} color="#0052CC" />}
                                        {msg.status === 'delivered' && <CheckCheck size={12} color="#8A94A6" />}
                                        {msg.status === 'sent' && <Check size={12} color="#8A94A6" />}
                                    </div>
                                )}
                            </div>
                            <div className="msg-hover-bar">
                                {[Reply, Smile, CheckCircle2, Pencil, MoreHorizontal].map((Icon, i) => (
                                    <button key={i} className="ha-btn"><Icon size={13} /></button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div style={{ display: 'flex', gap: '10px', padding: '6px 8px', alignItems: 'center' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getAvatarColor('Patrick'), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>PA</div>
                            <div style={{ background: '#F4F5F7', borderRadius: '12px', padding: '10px 14px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8A94A6', animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #DFE1E6' }}>
                    <div style={{ border: '1.5px solid #DFE1E6', borderRadius: '12px', overflow: 'hidden', background: 'white', transition: 'border-color 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '9px 12px', gap: '8px' }}>
                            <button className="icon-btn"><Smile size={17} /></button>
                            <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setMessage(''); }}
                                placeholder={`Message ${activeConv.type === 'channel' ? '#' : '@'}${activeConv.name}...`}
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#172B4D', background: 'transparent' }} />
                            <button className="icon-btn"><AtSign size={16} /></button>
                            <button className="icon-btn"><Paperclip size={16} /></button>
                            <button className="icon-btn"><Mic size={16} /></button>
                            <button className="send-btn"><Send size={13} /> Send</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1px', padding: '2px 10px 6px', borderTop: '1px solid #F4F5F7' }}>
                            <button className="fmt-btn"><Bold size={13} /></button>
                            <button className="fmt-btn"><Italic size={13} /></button>
                            <button className="fmt-btn"><Underline size={13} /></button>
                            <div style={{ width: '1px', height: '14px', background: '#DFE1E6', margin: '0 3px' }} />
                            <button className="fmt-btn"><AlignLeft size={13} /></button>
                            <button className="fmt-btn"><AlignCenter size={13} /></button>
                            <div style={{ width: '1px', height: '14px', background: '#DFE1E6', margin: '0 3px' }} />
                            <button className="fmt-btn"><List size={13} /></button>
                            <button className="fmt-btn"><ListOrdered size={13} /></button>
                            <div style={{ width: '1px', height: '14px', background: '#DFE1E6', margin: '0 3px' }} />
                            <button className="fmt-btn"><Code size={13} /></button>
                            <button className="fmt-btn" style={{ fontStyle: 'italic', fontWeight: 800, fontSize: '14px', color: '#6B778C' }}>"</button>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: '10px', color: '#B0B8C4' }}>/ commands · Enter to send</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Context Panel ── */}
            {rightPanelOpen && (
                <div style={{ width: '248px', background: 'white', borderLeft: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid #DFE1E6' }}>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                            {['Members', 'Files', 'Pinned', 'Tasks'].map(t => (
                                <button key={t} className={`rtab-btn ${rightTab === t ? 'active' : ''}`} onClick={() => setRightTab(t)}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                        {rightTab === 'Members' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members</span>
                                    <button style={{ background: 'none', border: 'none', fontSize: '11px', color: '#0052CC', cursor: 'pointer', fontWeight: 600 }}>+ Invite</button>
                                </div>
                                {RIGHT_MEMBERS.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: i < RIGHT_MEMBERS.length - 1 ? '1px solid rgba(9,30,66,0.06)' : 'none' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getAvatarColor(m.name), color: 'white', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getInitials(m.name)}</div>
                                            {m.online && <div className="online-dot-light" style={{ border: '1.5px solid white', bottom: 0, right: 0 }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{m.name}</div>
                                            <div style={{ fontSize: '10px', color: '#6B778C' }}>{m.role}</div>
                                        </div>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A94A6' }}><MessageSquare size={12} /></button>
                                    </div>
                                ))}
                            </>
                        )}
                        {rightTab === 'Files' && (
                            <>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Shared Files</div>
                                {SHARED_FILES.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < SHARED_FILES.length - 1 ? '1px solid rgba(9,30,66,0.06)' : 'none' }}>
                                        <f.Icon size={14} color={f.color} />
                                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '12px', fontWeight: 500, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div><div style={{ fontSize: '10px', color: '#6B778C' }}>{f.time}</div></div>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A94A6' }}><Download size={12} /></button>
                                    </div>
                                ))}
                            </>
                        )}
                        {rightTab === 'Pinned' && (
                            <>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Pinned Messages</div>
                                {PINNED_MSGS.map((m, i) => (
                                    <div key={i} style={{ padding: '10px', borderRadius: '8px', background: '#F8FAFF', border: '1px solid rgba(0,82,204,0.1)', marginBottom: '8px', fontSize: '12px', color: '#42526E', display: 'flex', gap: '8px' }}>
                                        <Pin size={12} color="#0052CC" style={{ flexShrink: 0, marginTop: '2px' }} />{m}
                                    </div>
                                ))}
                            </>
                        )}
                        {rightTab === 'Tasks' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Tasks</span>
                                    <button style={{ background: 'none', border: 'none', fontSize: '11px', color: '#0052CC', cursor: 'pointer', fontWeight: 600 }}>+ Add</button>
                                </div>
                                {LINKED_TASKS.map((t, i) => (
                                    <div key={i} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #DFE1E6', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start', cursor: 'pointer' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.color, marginTop: '5px', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}><div style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{t.title}</div><span style={{ fontSize: '10px', color: t.color, fontWeight: 600 }}>{t.status}</span></div>
                                        <CornerUpRight size={12} color="#6B778C" />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Activity footer */}
                    <div style={{ padding: '12px 14px', borderTop: '1px solid #DFE1E6', background: '#FAFBFC' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Activity</div>
                        {[
                            { text: 'Patrick added a pin', time: '5m', color: '#0052CC' },
                            { text: 'Michelle shared a file', time: '10m', color: '#36B37E' },
                            { text: 'Task linked by Alex', time: '1h', color: '#FFAB00' },
                        ].map((a, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '3px 0', fontSize: '11px', color: '#42526E' }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{a.text}</span>
                                <span style={{ color: '#8A94A6', fontSize: '10px' }}>{a.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
