"use client";

import Link from "next/link";
import { Play, ArrowRight, Sparkles, Command, User, CheckCircle2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-transparent min-h-screen flex items-center">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top Right Purple Gradient */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-purple-200/50 rounded-full blur-[120px] opacity-70 mix-blend-multiply"></div>
        {/* Bottom Left Green Gradient */}
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-100/60 rounded-full blur-[100px] opacity-80 mix-blend-multiply"></div>
        {/* Center Blue/Purple Gradient */}
        <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-[100px] opacity-60 mix-blend-multiply"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col xl:flex-row items-center gap-12 xl:gap-8">
          
          {/* Left Column: Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full xl:w-5/12 flex flex-col items-start text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFEFFF] mb-8">
              <Sparkles size={14} className="text-[#6B4CFF]" />
              <span className="text-[#6B4CFF] text-[13px] font-bold tracking-wide">The autonomous work platform</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-[80px] font-extrabold text-[#111827] leading-[1.05] mb-8 tracking-tight">
              Work that <br />
              moves <span className="text-[#6B4CFF] font-serif italic font-normal">itself</span> <br />
              forward.
            </h1>
            
            {/* Paragraph */}
            <p className="text-lg md:text-[20px] text-gray-600 mb-10 max-w-[500px] leading-relaxed font-medium">
              Stroovo turns your team's goals into momentum. An AI operations layer that sees the work, makes the right call, and keeps everyone moving.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mb-10">
              <Link 
                href="/signup" 
                className="group flex items-center text-[#111827] font-semibold text-[16px] hover:opacity-70 transition-opacity"
              >
                Build your workspace
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 text-gray-800 font-semibold text-[15px] transition-all"
              >
                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                  <Play size={10} fill="currentColor" className="ml-0.5 text-gray-700" />
                </div>
                Watch the demo
              </button>
            </div>

            {/* Social Proof / Avatars */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-200 flex items-center justify-center text-[10px] font-bold text-purple-700">AJ</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-700">NN</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-700">SL</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">+</div>
              </div>
              <div className="text-[13px] text-gray-500 font-medium">
                Built for ambitious teams who refuse to stand still.
              </div>
            </div>
          </motion.div>

          {/* Right Column: High-Fidelity UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full xl:w-7/12 relative mt-16 xl:mt-0 perspective-1000"
          >
            {/* Dashboard Container */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="relative w-full max-w-[850px] ml-auto rounded-2xl overflow-hidden bg-white shadow-[0_40px_100px_-20px_rgba(50,50,93,0.15)] border border-gray-200/60 flex flex-col transform md:-rotate-y-2 md:rotate-x-2 md:scale-[1.02]"
            >
              <div className="flex h-[540px]">
                {/* Minimal Dark Sidebar */}
                <div className="w-16 bg-[#1A1A24] flex flex-col items-center py-6 border-r border-gray-800 shrink-0">
                  <div className="w-8 h-8 bg-[#6B4CFF] rounded-xl flex items-center justify-center mb-8">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  
                  <div className="flex flex-col gap-6 w-full items-center">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white/80 rounded-sm"></div>
                    </div>
                    <div className="w-8 h-8 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors">
                      <Command size={18} className="text-gray-400" />
                    </div>
                    <div className="w-8 h-8 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors">
                      <User size={18} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="mt-auto w-8 h-8 rounded-full bg-orange-300 border-2 border-[#1A1A24] flex items-center justify-center text-[10px] font-bold text-orange-800">
                    MK
                  </div>
                </div>

                {/* Main Dashboard Area */}
                <div className="flex-1 bg-white p-8 flex flex-col relative">
                  
                  {/* Top Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-gray-400 text-xs font-medium mb-1">Tuesday, 22 October</div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Good morning, Maya
                        <Sparkles size={18} className="text-[#6B4CFF]" />
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 bg-gray-50">
                        <MoreHorizontal size={16} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center text-[10px] font-bold text-orange-800">
                        MK
                      </div>
                    </div>
                  </div>

                  {/* AI Priority Card */}
                  <div className="bg-[#2D2A3A] rounded-2xl p-8 text-white mb-6 relative overflow-hidden shadow-lg">
                    {/* Background decoration in the card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#6B4CFF]/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/4"></div>
                    
                    <div className="relative z-10">
                      <div className="text-[11px] font-bold tracking-wider text-purple-300 mb-4">AI PRIORITY</div>
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Ship an exceptional week.</h3>
                          <p className="text-sm text-gray-400 max-w-[300px]">
                            3 critical paths are on track. Your team has 11 hours to win back.
                          </p>
                        </div>
                        
                        {/* Focus Score Circle */}
                        <div className="relative w-20 h-20 rounded-full border-[6px] border-purple-500/30 flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="transparent" stroke="#6B4CFF" strokeWidth="8" strokeDasharray="289" strokeDashoffset="45" strokeLinecap="round" />
                          </svg>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold">84</span>
                            <span className="text-[8px] text-gray-400 uppercase tracking-widest">focus</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Grid */}
                  <div className="grid grid-cols-5 gap-6">
                    
                    {/* Tasks / Momentum */}
                    <div className="col-span-3">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[13px] font-bold text-gray-900">Today's momentum</h4>
                        <span className="text-[11px] text-gray-400 font-medium">12 tasks</span>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {/* Task 1 */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-gray-300 mt-0.5" />
                            <div>
                              <div className="text-[13px] font-semibold text-gray-800">Launch customer onboarding</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Sparkles size={10} className="text-purple-500" />
                                <span className="text-[10px] text-gray-400">AI confidence 98%</span>
                              </div>
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">Ready</div>
                        </div>
                        
                        {/* Task 2 */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                          <div className="flex items-start gap-3">
                            <div className="w-[18px] h-[18px] rounded-full border border-gray-300 mt-0.5"></div>
                            <div>
                              <div className="text-[13px] font-semibold text-gray-800">Resolve growth experiment</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Sparkles size={10} className="text-purple-500" />
                                <span className="text-[10px] text-gray-400">AI confidence 64%</span>
                              </div>
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-md bg-purple-50 text-purple-600 text-[10px] font-bold">In progress</div>
                        </div>

                        {/* Task 3 */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-gray-800 mt-0.5" />
                            <div>
                              <div className="text-[13px] font-semibold text-gray-500 line-through">Finalize Q3 campaign</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Sparkles size={10} className="text-gray-400" />
                                <span className="text-[10px] text-gray-400">AI confidence 91%</span>
                              </div>
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold">Review</div>
                        </div>
                      </div>
                    </div>

                    {/* Team Signal / Chart */}
                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[13px] font-bold text-gray-900">Team signal</h4>
                        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Live
                        </div>
                      </div>
                      
                      <div className="h-[180px] rounded-xl border border-gray-100 p-4 flex flex-col justify-between relative bg-white/50">
                        <div>
                          <div className="text-3xl font-extrabold text-[#6B4CFF]">+32%</div>
                          <div className="text-[10px] text-gray-400 max-w-[100px] leading-tight mt-1">delivers velocity this week</div>
                        </div>
                        
                        {/* Mini Bar Chart */}
                        <div className="flex items-end gap-1.5 h-16 w-full">
                          {[30, 45, 25, 60, 40, 80, 50].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-sm ${i === 5 ? 'bg-[#6B4CFF]' : 'bg-[#EFEFFF]'}`} style={{ height: `${h}%` }}></div>
                          ))}
                        </div>
                        
                        <div className="absolute bottom-4 left-4 right-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                          <Sparkles size={12} className="text-[#6B4CFF]" />
                          <span className="text-[10px] text-gray-500 font-medium">AI cleared one delivery risk</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Tooltips (Decorations) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute top-[15%] right-[-5%] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-3 border border-gray-100 flex items-start gap-3 z-20"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
              <div>
                <div className="text-[12px] font-bold text-gray-900">Focus score is rising</div>
                <div className="text-[10px] text-gray-500">+12 points this sprint</div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-[25%] left-[-10%] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-3 border border-gray-100 flex items-center gap-3 z-20"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Sparkles size={14} className="text-indigo-500" />
              </div>
              <div className="pr-2">
                <div className="text-[12px] font-bold text-gray-900">Autopilot acted</div>
                <div className="text-[10px] text-gray-500">Rebalanced 4 assignments</div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Floating Action Button (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-50 hidden md:block">
        <button className="w-12 h-12 rounded-full bg-[#3B38A8] shadow-lg flex items-center justify-center hover:bg-[#2A2788] transition-colors cursor-pointer">
          <Sparkles size={20} className="text-white" />
        </button>
      </div>
    </section>
  );
}

