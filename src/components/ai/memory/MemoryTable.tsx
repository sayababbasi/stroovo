"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Brain, Target, Shield, 
    Workflow, User, Users, Globe,
    ChevronRight, MoreHorizontal, Sparkles,
    Activity, Clock, Box, Database, FileText
} from 'lucide-react';

const memories = [
    {
        id: '1',
        title: 'Sprint Delay Root Cause',
        description: 'Backend dependencies and QA review cycle were primary blockers in Sprint 15.',
        type: 'Operational',
        importance: 'High',
        confidence: 95,
        entities: ['Backend', 'QA', 'Sprint 15'],
        lastUpdated: '2 min ago',
        color: 'rose'
    },
    {
        id: '2',
        title: 'Team Alpha Overtime Pattern',
        description: 'Team works overtime every Thursday and Friday. High burnout risk detected.',
        type: 'User',
        importance: 'Medium',
        confidence: 88,
        entities: ['Team Alpha', 'Schedule', 'Burnout'],
        lastUpdated: '15 min ago',
        color: 'amber'
    },
    {
        id: '3',
        title: 'Automation Effectiveness Increase',
        description: 'AI automations reduced manual work by 24% across projects this quarter.',
        type: 'AI Learning',
        importance: 'High',
        confidence: 97,
        entities: ['Automations', 'Efficiency', 'Metrics'],
        lastUpdated: '1 hr ago',
        color: 'indigo'
    },
    {
        id: '4',
        title: 'Release 2.4.0 Risk Factors',
        description: '3 high risk factors identified that may impact release timeline and stability.',
        type: 'Strategic',
        importance: 'High',
        confidence: 93,
        entities: ['Release 2.4.0', 'Risks', 'Roadmap'],
        lastUpdated: '3 hrs ago',
        color: 'emerald'
    },
    {
        id: '5',
        title: 'QA Review Bottleneck Pattern',
        description: 'QA review is a recurring bottleneck in 68% of sprints over the last 6 months.',
        type: 'Operational',
        importance: 'High',
        confidence: 94,
        entities: ['QA', 'Bottlenecks', 'Efficiency'],
        lastUpdated: '5 hrs ago',
        color: 'rose'
    },
    {
        id: '6',
        title: 'Customer Escalation Insights',
        description: 'Most escalations relate to performance and slow API response times in Europe.',
        type: 'Customer',
        importance: 'Medium',
        confidence: 86,
        entities: ['Customer', 'Performance', 'Europe'],
        lastUpdated: '1 day ago',
        color: 'blue'
    }
];

export const MemoryTable = () => {
    return (
        <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-50">
                        <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Memory</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Importance</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">AI Confidence</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Related Entities</th>
                        <th className="px-3 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Last Updated</th>
                        <th className="px-6 py-5"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {memories.map((memory) => (
                        <tr key={memory.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${
                                        memory.type === 'Operational' ? 'bg-rose-50 text-rose-600' :
                                        memory.type === 'User' ? 'bg-amber-50 text-amber-600' :
                                        memory.type === 'AI Learning' ? 'bg-indigo-50 text-indigo-600' :
                                        memory.type === 'Strategic' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-blue-50 text-blue-600'
                                    }`}>
                                        {memory.type === 'Operational' ? <Workflow size={16} /> :
                                         memory.type === 'User' ? <User size={16} /> :
                                         memory.type === 'AI Learning' ? <Brain size={16} /> :
                                         memory.type === 'Strategic' ? <Target size={16} /> :
                                         <Globe size={16} />}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-900 mb-0.5">{memory.title}</div>
                                        <div className="text-[9px] font-medium text-gray-400 line-clamp-1 max-w-xs">{memory.description}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-5">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                    memory.type === 'Operational' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    memory.type === 'User' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    memory.type === 'AI Learning' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    memory.type === 'Strategic' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {memory.type}
                                </span>
                            </td>
                            <td className="px-3 py-5">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                    memory.importance === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    {memory.importance}
                                </span>
                            </td>
                            <td className="px-3 py-5">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-gray-900">{memory.confidence}%</span>
                                    </div>
                                    <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${memory.confidence}%` }}
                                            className={`h-full ${memory.confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        />
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-5">
                                <div className="flex items-center gap-1.5">
                                    {memory.entities.map((entity, i) => (
                                        <div key={i} className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                            {i === 0 ? <Users size={12} /> : i === 1 ? <Box size={12} /> : <FileText size={12} />}
                                        </div>
                                    ))}
                                    <span className="text-[9px] font-bold text-gray-400">+{Math.floor(Math.random() * 10)}</span>
                                </div>
                            </td>
                            <td className="px-3 py-5">
                                <div className="text-[11px] font-black text-gray-900">{memory.lastUpdated}</div>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                    <MoreHorizontal size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Showing 1 to 6 of 24 memories</span>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((p, i) => (
                        <button key={i} className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                            p === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-white hover:text-gray-900'
                        }`}>
                            {p}
                        </button>
                    ))}
                    <button className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-900 transition-all">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
