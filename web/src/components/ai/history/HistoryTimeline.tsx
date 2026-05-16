"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Brain, Target, Shield, 
    Workflow, User, Users, Globe,
    ChevronRight, AlertTriangle, Cpu,
    CheckCircle2, Clock, Info, ArrowUpRight
} from 'lucide-react';

const events = [
    {
        id: '1',
        time: '10:24 AM',
        title: 'AI Decision: Workforce Rebalancing',
        description: 'AI detected high burnout risk for Team Alpha. Reassigned 12 overdue tasks to reduce failure probability by 28%.',
        type: 'Decision',
        severity: 'Warning',
        category: 'Workforce',
        icon: Brain,
        color: 'indigo',
        reasoning: 'Detected high burnout signals (overtime + low success rate). Target load reduction: 15%.'
    },
    {
        id: '2',
        time: '09:45 AM',
        title: 'Automation Executed: Auto-Escalation',
        description: 'Priority #124 escalated to Senior Level due to 48hr response time violation.',
        type: 'Execution',
        severity: 'Info',
        category: 'Automation',
        icon: Zap,
        color: 'blue',
        reasoning: 'SLA threshold breached (48h). Auto-escalation protocol engaged.'
    },
    {
        id: '3',
        time: '08:12 AM',
        title: 'Anomaly Detected: Abnormal API Latency',
        description: 'Detected 240% increase in API response times for Europe-West-1 cluster.',
        type: 'Anomaly',
        severity: 'Critical',
        category: 'System',
        icon: AlertTriangle,
        color: 'rose',
        reasoning: 'Signal detected: Latency > 2000ms. Probable cause: Database connection pool exhaustion.'
    },
    {
        id: '4',
        time: 'Yesterday',
        title: 'Milestone Reached: 90% Automation Accuracy',
        description: 'Stroovo AI reached 90% accuracy in predictive delay modeling for Q2 projects.',
        type: 'Milestone',
        severity: 'Success',
        category: 'AI Learning',
        icon: Target,
        color: 'emerald',
        reasoning: 'Validated by 1,200 successful project predictions.'
    }
];

export const HistoryTimeline = () => {
    return (
        <div className="space-y-6">
            {events.map((event, index) => (
                <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-10 group"
                >
                    {/* TIMELINE LINE */}
                    {index !== events.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100 group-hover:bg-indigo-100 transition-colors" />
                    )}

                    {/* TIMELINE ICON */}
                    <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 transition-all ${
                        event.severity === 'Critical' ? 'bg-rose-50 text-rose-600 shadow-lg shadow-rose-500/10' :
                        event.severity === 'Warning' ? 'bg-amber-50 text-amber-600 shadow-lg shadow-amber-500/10' :
                        event.severity === 'Success' ? 'bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/10' :
                        'bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/10'
                    } group-hover:scale-110`}>
                        <event.icon size={18} />
                    </div>

                    {/* CONTENT CARD */}
                    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm group-hover:shadow-md transition-all group-hover:border-indigo-100/50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.time}</span>
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                    event.type === 'Decision' ? 'bg-indigo-50 text-indigo-600' :
                                    event.type === 'Execution' ? 'bg-blue-50 text-blue-600' :
                                    event.type === 'Anomaly' ? 'bg-rose-50 text-rose-600' :
                                    'bg-emerald-50 text-emerald-600'
                                }`}>
                                    {event.type}
                                </span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">• {event.category}</span>
                            </div>
                            <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <h3 className="text-sm font-black text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                            {event.description}
                        </p>

                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain size={12} className="text-indigo-600" />
                                <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">AI Reasoning</span>
                            </div>
                            <p className="text-[11px] font-medium text-gray-600 italic">
                                "{event.reasoning}"
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}

            <div className="flex justify-center mt-8">
                <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm flex items-center gap-2">
                    <Clock size={14} />
                    Load Historical Events
                </button>
            </div>
        </div>
    );
};
