"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Send, BrainCircuit, Bot, Zap, Shield, Target, 
    Activity, Clock, CheckCircle2, AlertTriangle, Users, 
    MessageSquare, Layers, Search, Plus, Calendar, Download,
    MoreHorizontal, ChevronRight, Layout, PieChart, BarChart2,
    Settings, Globe, Info, History, Maximize2, Terminal,
    Database, Network, Cpu, Radio, List, ArrowRight,
    Search as SearchIcon, Mic, Paperclip, Slash, Sparkle,
    FileText, Briefcase, TrendingUp, AlertCircle, Share2,
    Eye, MoreVertical, Trash2, Edit3, Check, X, Bell,
    User, ChevronDown, Rocket, Coffee, Code, Terminal as TerminalIcon
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart as RePieChart, Pie, AreaChart, Area
} from 'recharts';
import ReactMarkdown from 'react-markdown';

// --- Types & Interfaces ---

type AIMode = 'Chat' | 'Execute' | 'Analyze' | 'Builder' | 'Developer';

interface AIAgent {
    id: string;
    name: string;
    role: string;
    status: 'idle' | 'busy' | 'online';
    icon: any;
    color: string;
    description: string;
}

interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    mode?: AIMode;
    agentId?: string;
    attachments?: any[];
    actions?: AIAction[];
    data?: any;
    status?: 'sending' | 'sent' | 'executing' | 'complete';
}

interface AIAction {
    id: string;
    label: string;
    type: 'button' | 'link' | 'command';
    payload?: any;
    icon?: any;
}

// --- Mock Data ---

const AI_AGENTS: AIAgent[] = [
    { id: 'proj-intel', name: 'Project Intelligence', role: 'Planning & Delivery', status: 'online', icon: Target, color: 'blue', description: 'Specialized in sprint planning and task orchestration.' },
    { id: 'risk-intel', name: 'Risk Intelligence', role: 'Monitoring & Alerts', status: 'online', icon: Shield, color: 'rose', description: 'Detects bottlenecks and predicts delivery delays.' },
    { id: 'auto-agent', name: 'Automation Agent', role: 'Workflow Optimization', status: 'busy', icon: Zap, color: 'amber', description: 'Builds and manages smart triggers across the platform.' },
    { id: 'analytics-agent', name: 'Analytics Agent', role: 'Insights & Reporting', status: 'online', icon: BarChart2, color: 'indigo', description: 'Generates deep operational insights and summaries.' },
    { id: 'doc-agent', name: 'Documentation Agent', role: 'Knowledge Management', status: 'idle', icon: FileText, color: 'emerald', description: 'Automates documentation and meeting summaries.' },
    { id: 'dev-agent', name: 'Developer Agent', role: 'Technical Orchestration', status: 'online', icon: Code, color: 'cyan', description: 'Handles API logic, SQL generation, and debugging.' },
];

const INITIAL_MESSAGES: AIMessage[] = [
    {
        id: 'm1',
        role: 'assistant',
        content: "Good morning, Sayab! 👋 I've analyzed your current workspace. Sprint 14 is 62% complete, but the Backend team is hitting a bottleneck. Would you like me to generate a mitigation plan for the next sprint?",
        timestamp: '10:21 AM',
        mode: 'Analyze',
        agentId: 'proj-intel',
        actions: [
            { id: 'a1', label: 'Generate Sprint Plan', type: 'command', icon: Sparkles },
            { id: 'a2', label: 'Analyze Risks', type: 'command', icon: Shield },
            { id: 'a3', label: 'Adjust Priorities', type: 'command', icon: Target },
        ]
    }
];

// --- Sub-Components ---

const AgentStatusItem = ({ agent }: { agent: AIAgent }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${agent.color}-50 text-${agent.color}-600 group-hover:scale-110 transition-transform`}>
                <agent.icon size={16} />
            </div>
            <div>
                <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-tighter">{agent.name}</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase">{agent.role}</p>
            </div>
        </div>
        <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : agent.status === 'busy' ? 'bg-amber-500' : 'bg-gray-300'} animate-pulse`} />
        </div>
    </div>
);

const ContextStat = ({ label, value, trend, trendColor = 'emerald' }: { label: string, value: string | number, trend?: string, trendColor?: string }) => (
    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
        <div className="flex items-end justify-between">
            <div className="text-xl font-bold text-gray-900">{value}</div>
            {trend && <div className={`text-[10px] font-bold text-${trendColor}-500 flex items-center gap-0.5`}>
                {trendColor === 'emerald' ? <TrendingUp size={10}/> : <AlertCircle size={10}/>} {trend}
            </div>}
        </div>
    </div>
);

// --- Main Page ---

export default function AiAssistantV3() {
    const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const [activeMode, setActiveMode] = useState<AIMode>('Chat');
    const [activeSection, setActiveSection] = useState('AI Chat');
    const [isThinking, setIsThinking] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleActionExecute = (actionId: string, label: string) => {
        const actionMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Initiating autonomous task: **${label}**. I'm connecting to the core project engine to fulfill this request.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'executing',
            agentId: 'auto-agent'
        };
        setMessages(prev => [...prev, actionMsg]);
        
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === actionMsg.id ? { ...m, content: `Successfully executed: **${label}**. The workspace has been updated.`, status: 'complete' } : m));
        }, 1500);
    };

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages]);

    const clearChat = () => {
        setMessages([INITIAL_MESSAGES[0]]);
    };

    const handleInsightClick = (insight: string) => {
        setInputValue(`Analyze this insight: ${insight}`);
    };

    const handleAgentClick = (agent: AIAgent) => {
        const agentMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Hello! I'm the **${agent.name}**. My current focus is **${agent.role}**. ${agent.description} How can I assist you with your operations today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            agentId: agent.id,
            status: 'complete'
        };
        setMessages(prev => [...prev, agentMsg]);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isThinking) return;
        
        const userMessage: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: activeMode,
            status: 'sent'
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsThinking(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userMessage.content,
                    mode: activeMode,
                    context: {
                        project: "Mobile App Development",
                        sprint: 14,
                        team: "Frontend/Backend",
                        mode: activeMode
                    }
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                const aiResponse: AIMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: result.data.content,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    mode: activeMode,
                    agentId: result.data.agent ? result.data.agent.toLowerCase().replace(' ', '-') : 'proj-intel',
                    status: 'complete',
                    data: result.data.requires_tools ? { type: 'analysis' } : null,
                    actions: result.data.requires_tools ? [
                        { id: 'ex1', label: `Execute ${result.data.intent}`, type: 'button', icon: Zap },
                        { id: 'ex2', label: 'Optimize Plan', type: 'button', icon: Target },
                    ] : [
                        { id: 'refine', label: 'Refine Result', type: 'button', icon: Sparkles }
                    ]
                };
                setMessages(prev => [...prev, aiResponse]);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('AI Request Failed:', error);
            const errorMsg: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting to the Neural Orchestrator. Please ensure Ollama is running with the required models (Llama 3.2, Qwen 2.5).",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'complete'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <main className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-[260px] transition-all duration-300 relative min-w-0 h-screen overflow-hidden">
                {/* 1. TOP NAV / HEADER */}
                <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-[40]">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                                <BrainCircuit className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 tracking-tight">AI Assistant <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded ml-1">V3</span></h1>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Enterprise Neural Network Online</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-[1px] bg-gray-100" />

                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                {(['Chat', 'Execute', 'Analyze', 'Builder', 'Developer'] as AIMode[]).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setActiveMode(mode)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${activeMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                            <button onClick={clearChat} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors" title="Clear Chat">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {AI_AGENTS.slice(0, 4).map(agent => (
                                <div key={agent.id} className={`w-8 h-8 rounded-full border-2 border-white bg-${agent.color}-100 flex items-center justify-center text-${agent.color}-600 shadow-sm overflow-hidden`} title={agent.name}>
                                    <agent.icon size={14} />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-bold">
                                +2
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-gray-100" />
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 group">
                            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                            <span>System Stats</span>
                        </button>
                    </div>
                </header>

                {/* 2. MAIN WORKSPACE GRID */}
                <div className="flex-1 grid grid-cols-[280px_1fr_340px] overflow-hidden">
                    
                    {/* LEFT PANEL: AI NAVIGATION */}
                    <aside className="border-r border-gray-100 bg-white/50 overflow-y-auto no-scrollbar p-6 space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">AI Workspace</h3>
                            <nav className="space-y-1">
                                {[
                                    { icon: MessageSquare, label: 'AI Chat' },
                                    { icon: Users, label: 'AI Agents' },
                                    { icon: Network, label: 'AI Workflows' },
                                    { icon: Clock, label: 'AI Tasks', count: 12 },
                                    { icon: Database, label: 'AI Memory' },
                                    { icon: History, label: 'AI History' },
                                ].map(item => (
                                    <button 
                                        key={item.label} 
                                        onClick={() => setActiveSection(item.label)}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${activeSection === item.label ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={16} />
                                            <span className="text-xs font-bold">{item.label}</span>
                                        </div>
                                        {item.count && <span className="text-[10px] font-black px-1.5 py-0.5 bg-indigo-100 rounded-full">{item.count}</span>}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Operational Intelligence</h3>
                            <nav className="space-y-1">
                                {[
                                    { icon: Sparkles, label: 'Insights', tag: 'New' },
                                    { icon: Zap, label: 'Predictions' },
                                    { icon: AlertTriangle, label: 'Risk Monitor' },
                                    { icon: BrainCircuit, label: 'Analytics Brain' },
                                ].map(item => (
                                    <button key={item.label} className="w-full flex items-center justify-between p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <item.icon size={16} className="group-hover:text-indigo-600 transition-colors" />
                                            <span className="text-xs font-bold">{item.label}</span>
                                        </div>
                                        {item.tag && <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded uppercase">{item.tag}</span>}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Automation</h3>
                            <nav className="space-y-1">
                                {[
                                    { icon: Radio, label: 'Automations' },
                                    { icon: Target, label: 'Smart Triggers' },
                                    { icon: List, label: 'Action Logs' },
                                ].map(item => (
                                    <button key={item.label} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
                                        <item.icon size={16} />
                                        <span className="text-xs font-bold">{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* CENTER PANEL: CONVERSATIONAL WORKSPACE */}
                    <section className="flex flex-col bg-white border-x border-gray-50 relative overflow-hidden">
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8 scroll-smooth">
                            <AnimatePresence>
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-100 border border-gray-200'}`}>
                                            {msg.role === 'user' ? <User className="text-white" size={20} /> : <Bot className="text-indigo-600" size={20} />}
                                        </div>
                                        <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                            <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-gray-800 border-gray-100'}`}>
                                                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:text-inherit prose-strong:text-inherit prose-code:bg-black/5 prose-code:px-1 prose-code:rounded">
                                                    <ReactMarkdown>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                                
                                                {msg.status === 'executing' && (
                                                    <div className="mt-4 flex items-center gap-3 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 animate-pulse">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase">Neural Processing In Progress...</span>
                                                    </div>
                                                )}
                                                
                                                {msg.data && (
                                                    <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                                        {/* Dynamic Charting / Task Lists would go here */}
                                                        <div className="h-32 w-full">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <AreaChart data={Array.from({ length: 12 }, (_, i) => ({ v: 40 + Math.random() * 60 }))}>
                                                                    <Area type="monotone" dataKey="v" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} />
                                                                </AreaChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {msg.actions && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {msg.actions.map(action => (
                                                        <button 
                                                            key={action.id} 
                                                            onClick={() => handleActionExecute(action.id, action.label)}
                                                            className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm transition-all flex items-center gap-2"
                                                        >
                                                            {action.icon && <action.icon size={12}/>}
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="text-[9px] font-bold text-gray-400 uppercase px-2">{msg.timestamp} • {msg.agentId ? AI_AGENTS.find(a => a.id === msg.agentId)?.name : 'Stroovo AI'}</div>
                                        </div>
                                    </motion.div>
                                ))}
                                
                                {isThinking && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center animate-pulse">
                                            <Bot className="text-gray-400" size={20} />
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50/30 px-4 py-2 rounded-full border border-indigo-100/30">
                                            <Sparkle size={12} className="animate-spin" />
                                            Stroovo is thinking...
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 bg-white border-t border-gray-100 relative">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['/generate', '/analyze', '/report', '/automate', '/summarize', '/predict'].map(cmd => (
                                    <button key={cmd} onClick={() => setInputValue(cmd + ' ')} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all">
                                        {cmd}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-indigo-600/5 blur-xl rounded-3xl group-focus-within:bg-indigo-600/10 transition-all pointer-events-none" />
                                <div className="relative bg-white border border-gray-200 rounded-3xl p-4 shadow-xl focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                                    <textarea
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Ask anything... or use /command"
                                        className="w-full bg-transparent border-none focus:outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 resize-none min-h-[44px] max-h-[200px]"
                                        rows={1}
                                    />
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-1.5">
                                            <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"><Paperclip size={18}/></button>
                                            <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"><Mic size={18}/></button>
                                            <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"><Slash size={18}/></button>
                                        </div>
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputValue.trim() || isThinking}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                                        >
                                            <Send size={14} />
                                            <span>Send Command</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Qwen 2.5 Active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-50" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Deepseek Standby</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 opacity-50" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Llama Router Active</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT PANEL: CONTEXTUAL INTELLIGENCE */}
                    <aside className="w-[400px] bg-[#F8FAFC] border-l border-gray-100 p-6 overflow-y-auto no-scrollbar space-y-8 relative flex-shrink-0">
                        {/* Current Context Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Context</h3>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] font-black text-emerald-600 uppercase">On Track</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:rotate-6 transition-transform">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Mobile App Development</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Sprint 14 • Q2 Roadmap</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
                                    <span>Sprint Progress</span>
                                    <span>62%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[62%] bg-indigo-600 rounded-full" />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="text-[9px] font-bold text-gray-400 uppercase">Due: May 12, 2024</div>
                                    <div className="text-[9px] font-black text-rose-500 uppercase">5 Days Left</div>
                                </div>
                            </div>
                        </div>

                        {/* Live Overview Grid */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Live Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <ContextStat label="Total Tasks" value="128" trend="+12" />
                                <ContextStat label="In Progress" value="32" trend="+5" />
                                <ContextStat label="Blocked" value="7" trend="-2" trendColor="rose" />
                                <ContextStat label="Completed" value="89" trend="+14" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ContextStat label="Team Capacity" value="78%" trend="+8%" />
                                <ContextStat label="Velocity (7d)" value="42 pts" trend="+6" />
                            </div>
                        </div>

                        {/* AI Insights Panel */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Insights</h3>
                                <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">View all</button>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: Zap, label: 'Velocity is improving by 14% this week.', color: 'indigo' },
                                    { icon: Shield, label: 'Backend team is overloaded by 22%.', color: 'rose' },
                                    { icon: Sparkles, label: '3 tasks are at risk of delay.', color: 'amber' },
                                    { icon: CheckCircle2, label: 'Good progress on UI/UX tasks.', color: 'emerald' },
                                ].map((insight, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => handleInsightClick(insight.label)}
                                        className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-2xl group cursor-pointer hover:border-indigo-100 transition-all"
                                    >
                                        <div className={`mt-0.5 text-${insight.color}-500 group-hover:scale-110 transition-transform`}>
                                            <insight.icon size={14} />
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-700 leading-tight">{insight.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent AI Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent AI Actions</h3>
                                <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">View all</button>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Created Sprint 15', time: '2 min ago', icon: Plus },
                                    { label: 'Generated risk analysis', time: '5 min ago', icon: Shield },
                                    { label: 'Updated 12 task priorities', time: '12 min ago', icon: Zap },
                                    { label: 'Created automation: Overdue Alert', time: '15 min ago', icon: Radio },
                                ].map((action, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 bg-white/50 border border-transparent hover:border-gray-200 rounded-xl transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                                <Check size={10} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-600">{action.label}</span>
                                        </div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase">{action.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Agents Panel */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Agents</h3>
                                <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Manage</button>
                            </div>
                            <div className="space-y-3">
                                {AI_AGENTS.map(agent => (
                                    <div key={agent.id} onClick={() => handleAgentClick(agent)}>
                                        <AgentStatusItem agent={agent} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PRO TIPS CARD */}
                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <Sparkles className="mb-4 text-indigo-200 group-hover:rotate-12 transition-transform" size={24} />
                                <h4 className="text-xs font-black uppercase tracking-widest mb-2">AI Pro Tip</h4>
                                <p className="text-[11px] font-medium leading-relaxed opacity-90 mb-4">
                                    Ask me in natural language. I can understand complex requests like <span className="italic">"Analyze backend blockers and reschedule affected tasks for next sprint."</span>
                                </p>
                                <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Learn More
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                                <BrainCircuit size={100} />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; filter: blur(10px); }
                    50% { opacity: 0.8; filter: blur(15px); }
                }
            `}</style>
        </main>
    );
}
