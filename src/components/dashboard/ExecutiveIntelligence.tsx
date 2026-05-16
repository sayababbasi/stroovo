"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, Users, Target, Zap, 
    Star, Clock, CheckCircle2, ArrowUpRight,
    BarChart3, PieChart, LayoutGrid, Sparkles,
    Briefcase, Activity, ShieldCheck, Trophy,
    Medal, Crown, Flame, Lightbulb
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Radar, RadarChart, 
    PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    AreaChart, Area
} from 'recharts';

const performanceData = [
    { subject: 'Velocity', A: 120, B: 110, fullMark: 150 },
    { subject: 'Quality', A: 98, B: 130, fullMark: 150 },
    { subject: 'Collaboration', A: 86, B: 130, fullMark: 150 },
    { subject: 'Innovation', A: 99, B: 100, fullMark: 150 },
    { subject: 'Efficiency', A: 85, B: 90, fullMark: 150 },
    { subject: 'Reliability', A: 65, B: 85, fullMark: 150 },
];

const employeeData = [
    { name: 'Sarah J.', role: 'Senior Dev', score: 98, impact: '+12%', image: null },
    { name: 'Michael K.', role: 'Product Lead', score: 94, impact: '+8%', image: null },
    { name: 'Elena R.', role: 'UX Designer', score: 92, impact: '+15%', image: null },
];

const taskData = [
    { name: 'Sprint 15', completed: 85, predicted: 94 },
    { name: 'Quantum UI', completed: 62, predicted: 78 },
    { name: 'Data Lake', completed: 44, predicted: 52 },
    { name: 'API v2', completed: 91, predicted: 98 },
];

const chartData = [
    { name: 'W1', value: 30 },
    { name: 'W2', value: 45 },
    { name: 'W3', value: 35 },
    { name: 'W4', value: 60 },
    { name: 'W5', value: 55 },
    { name: 'W6', value: 80 },
];

export const ExecutiveIntelligence = ({ role }: { role: string }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-12 gap-8">
                {/* GLOBAL PERFORMANCE RADAR (Competitor Crusher) */}
                <div className="col-span-7 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-1">Global Organization Intelligence</h3>
                            <p className="text-[10px] font-bold text-gray-400 italic">How we stack up against industry benchmarks.</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Sparkles size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">AI Benchmark: Elite</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                                <PolarGrid stroke="#F1F5F9" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="Current Org"
                                    dataKey="A"
                                    stroke="#4F46E5"
                                    fill="#4F46E5"
                                    fillOpacity={0.1}
                                />
                                <Radar
                                    name="Industry Top 1%"
                                    dataKey="B"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.05}
                                />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
                        <div className="text-center">
                            <div className="text-xl font-black text-gray-900">94.2</div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Innovation Index</div>
                        </div>
                        <div className="text-center border-x border-gray-50">
                            <div className="text-xl font-black text-emerald-500">+18%</div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">vs Competitors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-black text-indigo-600">Top 3%</div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Ranking</div>
                        </div>
                    </div>
                </div>

                {/* TOP EMPLOYEES / TALENT INTELLIGENCE */}
                <div className="col-span-5 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl">
                                <Trophy size={18} className="text-amber-500" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Talent ROI Leaderboard</h3>
                        </div>
                        <button className="text-[9px] font-black text-indigo-600 uppercase">All Talent</button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {employeeData.map((emp, i) => (
                            <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-amber-100 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 font-bold">
                                            {emp.name.charAt(0)}
                                        </div>
                                        {i === 0 && <Crown size={12} className="absolute -top-1.5 -right-1.5 text-amber-500" />}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-900">{emp.name}</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{emp.role}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-black text-indigo-600">{emp.score} <span className="text-[8px] font-bold text-gray-400">Score</span></div>
                                    <div className="text-[9px] font-black text-emerald-500">{emp.impact} <span className="text-gray-300">Impact</span></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-indigo-600 rounded-3xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-8 -mt-8" />
                        <div className="flex items-center gap-2 mb-2">
                            <Flame size={16} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Retention Alert</span>
                        </div>
                        <p className="text-[11px] font-medium text-indigo-100 leading-relaxed">
                            <span className="font-black text-white">Elena R.</span> has been high-impact for 12 weeks. AI recommends a performance review to ensure retention.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* EXECUTIVE PERSONALIZED: MY STRATEGIC TASKS */}
                <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Briefcase size={18} className="text-indigo-600" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">My Strategic Focus</h3>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[8px] font-black uppercase tracking-widest">3 Priority</span>
                    </div>

                    <div className="space-y-3">
                        {[
                            { title: 'Approve Q3 Budget Reallocation', time: 'Today', status: 'CRITICAL' },
                            { title: 'Review AI Agent Governance', time: 'Tomorrow', status: 'HIGH' },
                            { title: 'Meet with Team Alpha Lead', time: 'Mon, 10am', status: 'MEDIUM' }
                        ].map((task, i) => (
                            <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all group cursor-pointer">
                                <div className="text-[11px] font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{task.title}</div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                        <Clock size={10} />
                                        {task.time}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                                        task.status === 'CRITICAL' ? 'text-rose-500' : 'text-indigo-500'
                                    }`}>{task.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TASK COMPLETION & PREDICTIVE ANALYTICS */}
                <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-xl">
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Predictive Completion</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {taskData.map((task, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{task.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 italic">Predicting {task.predicted}%</span>
                                        <span className="text-[11px] font-black text-indigo-600">{task.completed}%</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden relative">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${task.completed}%` }}
                                        className="absolute inset-y-0 left-0 bg-indigo-600 z-10" 
                                    />
                                    <div className="absolute inset-y-0 left-0 bg-indigo-100 opacity-50 z-0" style={{ width: `${task.predicted}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Velocity Health</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-sm font-black text-gray-900">Strong (1.4x)</span>
                            </div>
                        </div>
                        <ArrowUpRight size={20} className="text-gray-300" />
                    </div>
                </div>

                {/* OVERALL PROJECT PERFORMANCE (High-Density) */}
                <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <Activity size={18} className="text-blue-500" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Project ROI Analysis</h3>
                        </div>
                    </div>

                    <div className="h-40 w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorROI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorROI)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                    <Lightbulb size={14} />
                                </div>
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Resource ROI</span>
                            </div>
                            <span className="text-[11px] font-black text-blue-600">92.4%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                    <CheckCircle2 size={14} />
                                </div>
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">SLA Adherence</span>
                            </div>
                            <span className="text-[11px] font-black text-emerald-600">100%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
