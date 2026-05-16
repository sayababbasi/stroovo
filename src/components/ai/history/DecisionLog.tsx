"use client"; // Stroovo AI Module

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Brain, Sparkles, Target, Activity, 
    ArrowUpRight, Shield, Workflow, Database,
    CheckCircle2, AlertTriangle, Cpu, TrendingUp,
    MessageSquare, Search, Filter, Share2
} from 'lucide-react';

const decisions = [
    {
        id: '1',
        title: 'Workforce Rebalancing - Team Alpha',
        action: 'Reassigned 12 tasks',
        reasoning: 'Detected high probability (84%) of sprint failure due to team overload. Optimized workload distribution to maintain delivery commitment.',
        confidence: 96,
        outcome: 'Success',
        impact: '+18% Efficiency',
        signals: ['Overtime', 'Response Time Lag', 'Task Backlog Growth'],
        timestamp: '2 hours ago'
    },
    {
        id: '2',
        title: 'Project Risk Mitigation - Release 2.4.0',
        action: 'Added Buffer + Adjusted Priority',
        reasoning: 'Predicted 4-day delay in Release 2.4.0 based on backend PR review bottlenecks. Implemented preemptive resource allocation.',
        confidence: 92,
        outcome: 'Pending',
        impact: 'Risk Reduction 34%',
        signals: ['PR Review Lag', 'API Stability Issues', 'Dependency Conflicts'],
        timestamp: '5 hours ago'
    }
];

export const DecisionLog = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                {decisions.map((decision) => (
                    <div key={decision.id} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Brain size={12} />
                                AI Decision
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{decision.timestamp}</span>
                        </div>

                        <h3 className="text-lg font-black text-gray-900 mb-2">{decision.title}</h3>
                        <div className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Target size={14} />
                            Action: {decision.action}
                        </div>

                        <div className="p-6 bg-gray-50 rounded-[24px] mb-8">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles size={12} className="text-indigo-600" />
                                AI Reasoning Breakdown
                            </h4>
                            <p className="text-xs font-medium text-gray-700 leading-relaxed italic">
                                "{decision.reasoning}"
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl text-center">
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Confidence</div>
                                <div className="text-sm font-black text-gray-900">{decision.confidence}%</div>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl text-center">
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Outcome</div>
                                <div className={`text-sm font-black ${decision.outcome === 'Success' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {decision.outcome}
                                </div>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl text-center">
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact</div>
                                <div className="text-sm font-black text-indigo-600">{decision.impact}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} />
                                Detected Signals
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {decision.signals.map((signal, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-50 text-[9px] font-black text-gray-600 rounded-xl border border-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all uppercase tracking-wider">
                                        {signal}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-4 mt-8 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 group">
                            Replay Decision Scenario
                            <Share2 size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
