"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    ChevronLeft, Share2, MoreHorizontal, Sparkles, MessageSquare,
    CheckSquare, History, BrainCircuit, Type, Heading1, Heading2,
    List, ListOrdered, Image as ImageIcon, Link, Table, Code,
    Eye, Download, Trash2, Save, Wand2, Search, Plus, Send, Folder, X as XIcon, Settings
} from 'lucide-react';

export default function DocumentEditor() {
    const [title, setTitle] = useState('Product Strategy & Roadmap 2024');
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');

    return (
        <main className="flex min-h-screen bg-white">
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-[240px] transition-all duration-300">
                {/* Editor Header */}
                <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                            <span>Project Folders</span>
                            <ChevronLeft size={12} className="rotate-180" />
                            <span>E-Commerce Platform</span>
                            <ChevronLeft size={12} className="rotate-180" />
                            <span className="text-gray-900">Document Editor</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button className="px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Draft</button>
                            <button className="px-3 py-1.5 bg-white text-[10px] font-bold text-blue-600 rounded-md shadow-sm flex items-center gap-1.5">
                                <Save size={14} /> Saved
                            </button>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Share2 size={18}/></button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><MoreHorizontal size={18}/></button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                            Publish
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Editor Canvas */}
                    <div className="flex-1 overflow-y-auto p-12 lg:p-20 flex flex-col items-center no-scrollbar">
                        <div className="w-full max-w-3xl space-y-8">
                            {/* Title Section */}
                            <div className="space-y-4 mb-12">
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-5xl font-extrabold text-gray-900 border-none outline-none placeholder:text-gray-200"
                                    placeholder="Untitled Document"
                                />
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white uppercase">SA</div>
                                        ))}
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">+4</div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last edited 2 hours ago by Sayab Ali</span>
                                </div>
                            </div>

                            {/* Toolbar (Floating or Sticky) */}
                            <div className="sticky top-2 z-10 flex items-center justify-center pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1 pointer-events-auto">
                                    {[
                                        { icon: Heading1, label: 'H1' },
                                        { icon: Heading2, label: 'H2' },
                                        { icon: Type, label: 'Text' },
                                        { icon: List, label: 'Bullet' },
                                        { icon: ListOrdered, label: 'Numbered' },
                                        { icon: CheckSquare, label: 'Tasks' },
                                        { icon: Code, label: 'Code' },
                                        { icon: ImageIcon, label: 'Image' },
                                        { icon: Table, label: 'Table' },
                                        { icon: Link, label: 'Link' },
                                    ].map((tool, i) => (
                                        <button key={i} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-blue-600 transition-all group relative">
                                            <tool.icon size={18} />
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest">
                                                {tool.label}
                                            </span>
                                        </button>
                                    ))}
                                    <div className="w-px h-6 bg-gray-100 mx-1" />
                                    <button 
                                        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                            isAiPanelOpen ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                        }`}
                                    >
                                        <Sparkles size={16} />
                                        <span>AI Assistant</span>
                                    </button>
                                </div>
                            </div>

                            {/* Document Content Placeholder */}
                            <div className="prose prose-slate max-w-none space-y-6 text-lg text-gray-800 leading-relaxed min-h-[600px]">
                                <p className="font-medium text-gray-500 italic">Start typing your ideas here, or use the / command for blocks...</p>
                                
                                <h2 className="text-2xl font-bold text-gray-900 pt-8 border-b border-gray-50 pb-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><CheckSquare size={18}/></div>
                                    Executive Summary
                                </h2>
                                <p>This document serves as the primary strategic roadmap for the upcoming e-commerce platform overhaul. Our goal is to increase user retention by 35% and streamline the checkout flow by reducing clicks from 7 to 3.</p>
                                
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 my-8 space-y-4 relative group hover:border-blue-200 transition-all">
                                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400 hover:text-blue-600"><Plus size={14}/></button>
                                        <button className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Core Objectives</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 font-semibold text-gray-700">
                                            <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><CheckSquare size={14}/></div>
                                            Redesign Mobile Experience for high-intent buyers
                                        </li>
                                        <li className="flex items-center gap-3 font-semibold text-gray-700">
                                            <div className="w-5 h-5 rounded bg-gray-100 text-gray-300 flex items-center justify-center"><CheckSquare size={14}/></div>
                                            Integrate Stripe-powered one-click checkout
                                        </li>
                                        <li className="flex items-center gap-3 font-semibold text-gray-700">
                                            <div className="w-5 h-5 rounded bg-gray-100 text-gray-300 flex items-center justify-center"><CheckSquare size={14}/></div>
                                            Launch Beta testing for Top 100 Power Users
                                        </li>
                                    </ul>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 pt-8 border-b border-gray-50 pb-2">User Feedback & Research</h2>
                                <p>Initial research suggests that users find the current navigation "cluttered" and "unintuitive". We need to focus on a minimalist aesthetic that prioritizes product discovery.</p>
                            </div>
                        </div>
                    </div>

                    {/* AI ASSISTANT PANEL */}
                    {isAiPanelOpen && (
                        <aside className="w-[380px] bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300 z-30 shadow-2xl">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/30">
                                <div className="flex items-center gap-2 text-purple-700">
                                    <Sparkles size={20} />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">AI Assistant</h3>
                                </div>
                                <button onClick={() => setIsAiPanelOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <XIcon size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                                {/* AI Quick Actions */}
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Quick Intelligence</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { icon: MessageSquare, label: 'Summarize', desc: 'Get key takeaways' },
                                            { icon: CheckSquare, label: 'Extract Tasks', desc: 'Find action items' },
                                            { icon: Wand2, label: 'Improve', desc: 'Rewrite for clarity' },
                                            { icon: BrainCircuit, label: 'Brainstorm', desc: 'Generate new ideas' },
                                        ].map((action, i) => (
                                            <button key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all text-center group">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                                                    <action.icon size={20} />
                                                </div>
                                                <div className="text-[11px] font-bold text-gray-900">{action.label}</div>
                                                <div className="text-[9px] text-gray-500 leading-tight">{action.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Context Info */}
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3 text-blue-700">
                                        <BrainCircuit size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Content Analysis</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-blue-700 font-bold">Readability</span>
                                            <span className="text-blue-900 font-extrabold bg-blue-100 px-2 py-0.5 rounded">Expert</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-blue-700 font-bold">Tone</span>
                                            <span className="text-blue-900 font-extrabold bg-blue-100 px-2 py-0.5 rounded">Professional</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-blue-700 font-bold">Sentiment</span>
                                            <span className="text-blue-900 font-extrabold bg-blue-100 px-2 py-0.5 rounded">Positive</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Interface */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                                            <Sparkles size={14} />
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-2xl rounded-tl-none">
                                            <p className="text-[11px] text-purple-900 leading-relaxed">
                                                Hello! I've analyzed your document. Would you like me to extract the action items or suggest some improvements for the executive summary?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
                                <div className="relative">
                                    <textarea 
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        placeholder="Ask AI to edit, summarize or expand..." 
                                        className="w-full h-24 p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none shadow-inner"
                                    />
                                    <button className="absolute bottom-4 right-4 p-2 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:bg-purple-700 hover:scale-110 transition-all active:scale-95">
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-3">
                                    <button className="text-[10px] font-bold text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-1.5 uppercase">
                                        <History size={12} /> History
                                    </button>
                                    <div className="h-3 w-px bg-gray-100" />
                                    <button className="text-[10px] font-bold text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-1.5 uppercase">
                                        <Settings size={12} /> Config
                                    </button>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}


