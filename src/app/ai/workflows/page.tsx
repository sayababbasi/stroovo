"use client";

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
    addEdge, 
    Background, 
    Controls, 
    Connection, 
    Edge, 
    Node,
    Handle,
    Position,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
    Panel,
    ReactFlowProvider,
    getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Zap, Shield, Target, Activity, Clock, 
    CheckCircle2, AlertTriangle, Users, MessageSquare,
    Layers, Search, Plus, Calendar, Download,
    MoreHorizontal, ChevronRight, Layout, PieChart as PieIcon,
    BarChart2, Settings, Globe, Info, History, Maximize2,
    Terminal, Database, Network, Cpu, Radio, List, 
    ArrowRight, Mic, Paperclip, Slash, Sparkle,
    FileText, Briefcase, TrendingUp, AlertCircle, Share2,
    Eye, MoreVertical, Trash2, Edit3, Check, X, Bell,
    User, ChevronDown, Rocket, Coffee, Code, Terminal as TerminalIcon,
    PanelRight, Filter, SortAsc, ZapOff, Bot, BrainCircuit,
    ArrowUpRight, ArrowDownRight, CheckCircle, BarChart3,
    Command, Send, Play, RefreshCw, Save, Share
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- Custom Node Components ---

const TriggerNode = ({ data }: any) => (
    <div className="bg-white border-2 border-emerald-400 rounded-2xl p-4 shadow-xl min-w-[200px] group transition-all hover:shadow-emerald-200/50">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Zap size={18} />
            </div>
            <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Trigger</h4>
                <p className="text-sm font-bold text-gray-900">{data.label}</p>
            </div>
        </div>
        <p className="text-[10px] text-gray-500">{data.description}</p>
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-400 border-2 border-white shadow-sm" />
    </div>
);

const AiConditionNode = ({ data }: any) => (
    <div className="bg-white border-2 border-indigo-400 rounded-2xl p-4 shadow-xl min-w-[220px] group transition-all hover:shadow-indigo-200/50">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BrainCircuit size={18} />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">AI Condition</h4>
                    <span className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">AI</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{data.label}</p>
            </div>
        </div>
        <p className="text-[10px] text-gray-500 mb-3">{data.description}</p>
        <div className="flex justify-between px-2 pt-2 border-t border-gray-50">
            <span className="text-[9px] font-black text-emerald-500 uppercase">Success</span>
            <span className="text-[9px] font-black text-rose-500 uppercase">Fail</span>
        </div>
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-400 border-2 border-white shadow-sm" />
        <Handle type="source" position={Position.Bottom} id="a" style={{ left: '25%' }} className="w-3 h-3 bg-emerald-400 border-2 border-white shadow-sm" />
        <Handle type="source" position={Position.Bottom} id="b" style={{ left: '75%' }} className="w-3 h-3 bg-rose-400 border-2 border-white shadow-sm" />
    </div>
);

const ActionNode = ({ data }: any) => (
    <div className="bg-white border-2 border-blue-400 rounded-2xl p-4 shadow-xl min-w-[200px] group transition-all hover:shadow-blue-200/50">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl text-blue-600">
                {React.createElement(data.icon || MessageSquare, { size: 18 })}
            </div>
            <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Action</h4>
                <p className="text-sm font-bold text-gray-900">{data.label}</p>
            </div>
        </div>
        <p className="text-[10px] text-gray-500">{data.description}</p>
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400 border-2 border-white shadow-sm" />
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400 border-2 border-white shadow-sm" />
    </div>
);

const EndNode = ({ data }: any) => (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-xl min-w-[180px] text-center">
        <div className="flex flex-col items-center gap-2">
            <div className="p-2 bg-gray-50 text-gray-400 rounded-full">
                <CheckCircle size={20} />
            </div>
            <p className="text-sm font-bold text-gray-900">{data.label}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Workflow Complete</p>
        </div>
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-200 border-2 border-white shadow-sm" />
    </div>
);

const AddButtonEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
}: any) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path stroke-gray-300"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <foreignObject
                width={24}
                height={24}
                x={labelX - 12}
                y={labelY - 12}
                className="overflow-visible"
                requiredExtensions="http://www.w3.org/1999/xhtml"
            >
                <div className="flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md hover:scale-110 hover:border-indigo-400 transition-all cursor-pointer group">
                    <Plus size={12} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
            </foreignObject>
            {label && (
                <text x={labelX} y={labelY - 20} className="text-[8px] font-black uppercase fill-indigo-500 text-center" textAnchor="middle">
                    {label}
                </text>
            )}
        </>
    );
};

const nodeTypes = {
    trigger: TriggerNode,
    aiCondition: AiConditionNode,
    action: ActionNode,
    end: EndNode,
};

const edgeTypes = {
    addButton: AddButtonEdge,
};

// --- Mock Data ---

const INITIAL_NODES: Node[] = [
    { 
        id: '1', 
        type: 'trigger', 
        position: { x: 250, y: 0 }, 
        data: { label: 'Task Created', description: 'When a new task is created in any project' } 
    },
    { 
        id: '2', 
        type: 'aiCondition', 
        position: { x: 240, y: 150 }, 
        data: { label: 'Analyze Context', description: 'AI analyzes task priority and urgency based on historical data' } 
    },
    { 
        id: '3', 
        type: 'action', 
        position: { x: 50, y: 350 }, 
        data: { label: 'Auto Assign', description: 'Assign to the best available team member', icon: Users } 
    },
    { 
        id: '4', 
        type: 'action', 
        position: { x: 450, y: 350 }, 
        data: { label: 'Create Subtask', description: 'AI generates relevant subtasks based on description', icon: Plus } 
    },
    { 
        id: '5', 
        type: 'end', 
        position: { x: 250, y: 550 }, 
        data: { label: 'End Flow' } 
    },
];

const INITIAL_EDGES: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'addButton', animated: true },
    { id: 'e2-3', source: '2', sourceHandle: 'a', target: '3', type: 'addButton', label: 'High Priority', animated: true },
    { id: 'e2-4', source: '2', sourceHandle: 'b', target: '4', type: 'addButton', label: 'Normal Priority' },
    { id: 'e3-5', source: '3', target: '5', type: 'addButton' },
    { id: 'e4-5', source: '4', target: '5', type: 'addButton' },
];

const PERFORMANCE_DATA = [
    { day: 'May 1', executions: 42, success: 98 },
    { day: 'May 7', executions: 58, success: 97 },
    { day: 'May 14', executions: 89, success: 99 },
    { day: 'May 21', executions: 65, success: 98 },
    { day: 'May 28', executions: 128, success: 98.4 },
];

// --- Main Component ---

export default function AiWorkflowsPage() {
    const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
    const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
    const [isSaving, setIsSaving] = useState(false);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <main className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-[260px] transition-all duration-300 relative min-w-0 h-screen overflow-hidden">
                {/* HEADER */}
                <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Workflows</h1>
                                <div className="p-1 bg-indigo-50 rounded-lg">
                                    <Sparkles className="text-indigo-600" size={16} />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Intelligent workflow automation powered by Stroovo AI.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
                                <Bot size={14} className="text-indigo-600" />
                                <span>AI Builder</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
                                <Layout size={14} />
                                <span>Templates</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                                <Plus size={14} />
                                <span>Create Workflow</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 bg-gray-50/50 text-gray-400 hover:text-gray-900 transition-all rounded-xl border border-transparent hover:border-gray-100"><Bell size={18} /></button>
                            <button className="p-2.5 bg-gray-50/50 text-gray-400 hover:text-gray-900 transition-all rounded-xl border border-transparent hover:border-gray-100"><Info size={18} /></button>
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden p-0.5">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sayab" alt="User" className="w-full h-full object-cover rounded-lg" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* CANVAS AREA */}
                    <div className="flex-1 flex flex-col relative overflow-hidden bg-gray-50/50">
                        {/* Workflow Overview Card */}
                        <div className="p-6 pb-2">
                            <div className="bg-white border border-gray-100 rounded-[28px] p-4 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-indigo-600 text-white rounded-[20px] shadow-lg shadow-indigo-100">
                                        <Radio size={24} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-bold text-gray-900">Sprint Automation Pro</h2>
                                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase border border-emerald-100">Active</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500">Automates sprint creation, task assignment, and notifications.</p>
                                        <div className="flex items-center gap-3 pt-0.5">
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                                                <Calendar size={10} />
                                                <span>May 10, 2024</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                                                <History size={10} />
                                                <span>Updated 2h ago</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 border-l border-gray-100 pl-8">
                                    <div className="text-center">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Executions</div>
                                        <div className="text-lg font-black text-gray-900">128</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Success</div>
                                        <div className="text-lg font-black text-emerald-500">98.4%</div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <button 
                                            onClick={handleSave}
                                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 min-w-[140px]"
                                        >
                                            {isSaving ? <Activity size={12} className="animate-spin" /> : <Save size={12} />}
                                            <span>Save Changes</span>
                                        </button>
                                        <button className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all border border-gray-100 flex items-center justify-center">
                                            <Play size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CANVAS BUILDER */}
                        <div className="flex-1 p-6 pt-2 relative min-h-[600px]">
                            <div className="h-full w-full bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden relative">
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    nodeTypes={nodeTypes}
                                    edgeTypes={edgeTypes}
                                    fitView
                                    className="bg-dot-pattern"
                                    minZoom={0.2}
                                    maxZoom={2}
                                >
                                    <Background color="#f1f5f9" gap={20} />
                                    <Controls className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden" />
                                    <Panel position="top-left" className="bg-white/80 backdrop-blur-md border border-gray-100 p-2 rounded-2xl shadow-sm m-4 flex gap-2">
                                        <button className="p-2 text-indigo-600 bg-indigo-50 rounded-lg"><Layout size={18} /></button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-all"><PieIcon size={18} /></button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-all"><History size={18} /></button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-all"><Settings size={18} /></button>
                                    </Panel>
                                </ReactFlow>
                                
                                {/* Side Step Palette (Floating) */}
                                <div className="absolute left-6 top-6 bottom-6 w-64 bg-white/70 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-xl z-50 p-6 flex flex-col gap-6 group hover:bg-white/95 transition-all duration-500">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-gray-900">Add Step</h3>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><Maximize2 size={12} /></button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input type="text" placeholder="Search steps..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Triggers</h4>
                                            <div className="space-y-2">
                                                {['Task Created', 'Task Updated', 'Due Date Reached', 'Status Changed'].map(t => (
                                                    <div key={t} className="flex items-center gap-3 p-3 bg-white border border-gray-50 rounded-xl cursor-grab hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                                                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform"><Zap size={14} /></div>
                                                        <span className="text-xs font-bold text-gray-700">{t}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">AI Decisions</h4>
                                            <div className="space-y-2">
                                                {['Predict Risk', 'Analyze Workload', 'Classify Task'].map(t => (
                                                    <div key={t} className="flex items-center gap-3 p-3 bg-white border border-gray-50 rounded-xl cursor-grab hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                                                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform"><BrainCircuit size={14} /></div>
                                                        <span className="text-xs font-bold text-gray-700">{t}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Actions</h4>
                                            <div className="space-y-2">
                                                {['Send Notification', 'Update Status', 'Assign User', 'Create Subtask'].map(t => (
                                                    <div key={t} className="flex items-center gap-3 p-3 bg-white border border-gray-50 rounded-xl cursor-grab hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><MessageSquare size={14} /></div>
                                                        <span className="text-xs font-bold text-gray-700">{t}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom AI Optimization Panel */}
                        <div className="px-8 pb-8">
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { title: 'Parallel Execution', desc: 'Run notifications and status updates in parallel to save 2.3s', icon: Zap, color: 'indigo' },
                                    { title: 'Smart Batching', desc: 'Batch similar tasks together to improve overall throughput by 23%', icon: Layers, color: 'emerald' },
                                    { title: 'Condition Optimization', desc: 'Simplify nested AI logic to reduce execution latency by 15%', icon: BrainCircuit, color: 'amber' },
                                ].map((opt, i) => (
                                    <div key={i} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform flex flex-col items-center gap-3">
                                            <opt.icon size={20} />
                                            <button className="px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Apply</button>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-900">{opt.title}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{opt.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR: INTELLIGENCE & ASSISTANT */}
                    <aside className="w-[400px] bg-white border-l border-gray-100 p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar relative z-30">
                        {/* AI Workflow Assistant */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="relative z-10 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bot size={20} />
                                        <h3 className="text-sm font-bold tracking-widest uppercase">AI Assistant</h3>
                                    </div>
                                    <span className="bg-white/20 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Beta</span>
                                </div>
                                <p className="text-xs font-medium text-indigo-50 leading-relaxed">
                                    I can help you build smarter workflows. What would you like to automate today?
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Auto assign tasks', 'Smart alerts', 'Generate subtasks', 'Status logic'].map(btn => (
                                        <button key={btn} className="text-[9px] font-black uppercase p-2.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all text-center">
                                            {btn}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <textarea 
                                        placeholder="When task is overdue, notify manager..." 
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 pr-12 text-xs placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-md resize-none h-24 font-medium"
                                    />
                                    <button className="absolute right-3 bottom-3 p-2 bg-white text-indigo-600 rounded-xl hover:scale-105 transition-transform shadow-lg">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 p-12 opacity-10 pointer-events-none transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Command size={180} />
                            </div>
                        </div>

                        {/* Workflow Intelligence */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Workflow Intelligence</h3>
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">View Details</button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Time Saved', val: '14.6 hrs/wk', trend: '+21%', icon: Clock, color: 'indigo' },
                                    { label: 'Efficiency Gain', val: '+18%', trend: '+3%', icon: Zap, color: 'emerald' },
                                    { label: 'Success Rate', val: '98.4%', trend: '+4.1%', icon: CheckCircle, color: 'blue' },
                                ].map(stat => (
                                    <div key={stat.label} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-[24px]">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl`}><stat.icon size={16} /></div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{stat.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-gray-900">{stat.val}</div>
                                            <div className="text-[9px] font-bold text-emerald-500">{stat.trend}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Overview */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Performance Overview</h3>
                            <div className="h-48 -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={PERFORMANCE_DATA}>
                                        <defs>
                                            <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="executions" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorExec)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Executions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Recent Executions</h3>
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase">View All</button>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { task: 'Implement login API', time: '10:24 AM', status: 'Success' },
                                    { task: 'Fix payment issue', time: '09:16 AM', status: 'Success' },
                                    { task: 'Update user profile', time: '05:42 PM', status: 'Success' },
                                    { task: 'Setup database', time: '03:11 PM', status: 'Failed' },
                                ].map((ex, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-100 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${ex.status === 'Success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-800 line-clamp-1">{ex.task}</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">{ex.time}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${ex.status === 'Success' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{ex.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <style jsx global>{`
                .bg-dot-pattern {
                    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .react-flow__handle {
                    width: 10px !important;
                    height: 10px !important;
                    background: #fff !important;
                    border: 2px solid #4f46e5 !important;
                }
                .react-flow__edge-path {
                    stroke-width: 2.5;
                }
            `}</style>
        </main>
    );
}
