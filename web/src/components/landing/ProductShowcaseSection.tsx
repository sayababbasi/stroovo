"use client";

import Link from "next/link";
import { LayoutList, Users, Target, Zap, LineChart, Blocks, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductShowcaseSection() {
  const capabilities = [
    {
      title: "Projects & Tasks",
      desc: "Plan, organize, and track work with clarity and precision.",
      icon: <LayoutList size={20} className="text-blue-600" />,
      bg: "bg-blue-50"
    },
    {
      title: "Smart Automation",
      desc: "Automate workflows and approvals to save time and reduce errors.",
      icon: <Zap size={20} className="text-blue-600" />,
      bg: "bg-blue-50"
    },
    {
      title: "Team Collaboration",
      desc: "Communicate, share updates, and collaborate in real-time.",
      icon: <Users size={20} className="text-blue-600" />,
      bg: "bg-blue-50"
    },
    {
      title: "Reports & Analytics",
      desc: "Get real-time insights and make smarter, data-driven decisions.",
      icon: <LineChart size={20} className="text-blue-600" />,
      bg: "bg-blue-50"
    },
    {
      title: "Goals & OKRs",
      desc: "Set goals, track progress, and align teams to what matters.",
      icon: <Target size={20} className="text-blue-600" />,
      bg: "bg-blue-50"
    },
    {
      title: "Integrations",
      desc: "Connect your favorite tools and centralize your work.",
      icon: <Blocks size={20} className="text-blue-600" />,
      bg: "bg-blue-50"
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6">
        <div className="flex flex-col xl:flex-row items-center gap-16 xl:gap-12">
          
          {/* Left Column: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full xl:w-5/12 flex flex-col items-start"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Powerful Capabilities</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Everything Your Team Needs to Perform at Its Best
            </h2>
            
            <p className="text-lg text-gray-500 mb-10 max-w-[480px] leading-relaxed">
              Stroovo combines essential work management tools with advanced features to help teams stay organized, aligned, and ahead of every deadline.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6 mb-12">
              {capabilities.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link 
              href="#" 
              className="group flex items-center text-[#0052CC] font-bold text-[15px] hover:text-[#0047B3] transition-colors"
            >
              Explore All Features 
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right Column: Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full xl:w-7/12 relative mt-8 xl:mt-0 perspective-1000"
          >
            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/40 rounded-full blur-[80px] -z-10"></div>
            
            {/* Dashboard Container */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col transform md:-rotate-y-2 md:rotate-x-2 md:scale-[1.02]">
              
              <div className="flex h-[600px]">
                {/* Mock Sidebar */}
                <div className="w-[170px] bg-[#0E1528] flex flex-col py-5 border-r border-[#1B2339] shrink-0">
                  <div className="px-5 mb-8 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center font-bold text-[11px]">S</div>
                    <div className="text-white font-bold text-sm tracking-wide">Stroovo</div>
                  </div>
                  
                  <div className="flex flex-col space-y-1 px-3">
                    {['Overview', 'Users', 'Teams', 'Projects', 'Tasks', 'Goals', 'Calendar', 'Messages', 'Files', 'Reports', 'Settings'].map((item, i) => (
                      <div key={item} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${i === 0 ? 'bg-white/10 text-white' : 'text-[#8A94A6] hover:text-white hover:bg-white/5'}`}>
                        <div className={`w-3.5 h-3.5 rounded-sm ${i === 0 ? 'bg-blue-400' : 'bg-[#42526E]'}`}></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto px-3">
                     <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                           <div className="text-[10px] text-white font-bold uppercase tracking-wider">System Status</div>
                        </div>
                        <div className="text-[9px] text-gray-400">All Systems Healthy</div>
                     </div>
                  </div>
                </div>

                {/* Mock Main Area */}
                <div className="flex-1 bg-white flex flex-col min-w-0">
                  {/* Top nav */}
                  <div className="h-14 border-b border-gray-100 flex items-center justify-between px-8 bg-white shrink-0">
                    <div className="w-64 h-8 border border-gray-200 rounded-lg bg-gray-50 flex items-center px-3">
                       <svg className="w-3.5 h-3.5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                       <div className="text-[11px] text-gray-400">Search anything...</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-700 font-semibold text-right leading-tight">Administrator<br/><span className="text-[9px] text-gray-400 font-normal">System Administrator</span></div>
                      <div className="w-8 h-8 rounded-full bg-[#0052CC] flex items-center justify-center text-white text-xs font-bold shadow-sm">A</div>
                    </div>
                  </div>
                  
                  {/* Content area */}
                  <div className="flex-1 p-8 flex flex-col overflow-hidden bg-white">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                         <h3 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">Good Morning, Administrator <span className="text-xl">👋</span></h3>
                         <p className="text-[13px] text-gray-500">Here's what's happening with your workspace today.</p>
                      </div>
                      <div className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-lg shadow-sm flex items-center gap-2">
                         Apr 29 - May 29, 2026
                         <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    
                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { title: 'Total Projects', val: '128', change: '+ 12% vs last month', color: 'text-emerald-500' },
                        { title: 'Total Tasks', val: '1,156', change: '+ 10% vs last month', color: 'text-emerald-500' },
                        { title: 'Team Members', val: '342', change: '+ 8% vs last month', color: 'text-emerald-500' },
                        { title: 'Completed Tasks', val: '85%', change: '+ 16% vs last month', color: 'text-emerald-500' }
                      ].map(stat => (
                        <div key={stat.title} className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                          <div className="text-[11px] font-semibold text-gray-500 mb-2">{stat.title}</div>
                          <div className="text-2xl font-bold text-gray-900 mb-2">{stat.val}</div>
                          <div className={`text-[9px] font-bold ${stat.color} flex items-center gap-1`}>
                             <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                             {stat.change}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Charts & Lists */}
                    <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                      <div className="flex flex-col gap-4">
                         {/* Project Progress */}
                         <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 flex flex-col h-[200px]">
                            <div className="text-[13px] font-bold text-gray-900 mb-4 flex justify-between">
                               Project Progress
                               <div className="flex items-center gap-3 text-[9px] font-medium text-gray-500">
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> On Track</span>
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> At Risk</span>
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Off Track</span>
                               </div>
                            </div>
                            <div className="flex-1 relative overflow-hidden">
                               {/* Chart Graphic */}
                               <svg className="absolute inset-0 w-full h-[120%]" preserveAspectRatio="none" viewBox="0 0 100 40">
                                 <path d="M0 35 L10 32 L20 34 L30 25 L40 28 L50 18 L60 22 L70 10 L80 15 L90 5 L100 12" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                                 <path d="M0 35 L10 32 L20 34 L30 25 L40 28 L50 18 L60 22 L70 10 L80 15 L90 5 L100 12 L100 40 L0 40 Z" fill="#3b82f6" opacity="0.1" />
                                 <path d="M0 30 L20 28 L40 30 L60 15 L80 18 L100 8" fill="none" stroke="#10b981" strokeWidth="1.5" />
                                 <path d="M0 38 L30 35 L50 36 L70 25 L100 28" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
                               </svg>
                            </div>
                            <div className="flex justify-between mt-2 text-[9px] font-medium text-gray-400 px-2">
                               <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                            </div>
                         </div>
                         {/* Recent Activity */}
                         <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 flex-1 flex flex-col min-h-0">
                            <div className="text-[13px] font-bold text-gray-900 mb-4">Recent Activity</div>
                            <div className="flex-1 overflow-hidden flex flex-col gap-4">
                               {[
                                 { action: 'Design System V2 updated', user: 'Project Alpha', time: '2 min ago' },
                                 { action: 'New task assigned to Sarah Johnson', user: 'Mobile App Redesign', time: '5 min ago' },
                                 { action: 'Marketing Campaign approved', user: 'By James Anderson', time: '1 hr ago' },
                               ].map((act, i) => (
                                 <div key={i} className="flex gap-3 items-center">
                                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-[10px] font-bold shrink-0`}>
                                      US
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="text-[11px] font-bold text-gray-800 truncate">{act.action}</div>
                                       <div className="text-[9px] text-gray-400 truncate">{act.user}</div>
                                    </div>
                                    <div className="text-[9px] font-medium text-rose-500 shrink-0">{act.time}</div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col gap-4">
                         {/* Tasks by Status */}
                         <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 h-[200px] flex items-center">
                            <div className="w-1/2 flex items-center justify-center relative">
                               <div className="w-[100px] h-[100px] rounded-full border-[12px] border-blue-500 border-r-emerald-500 border-b-amber-500 border-l-rose-500"></div>
                               <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-lg font-bold text-gray-900">1,156</span>
                                  <span className="text-[7px] font-bold text-gray-400 uppercase">Total Tasks</span>
                               </div>
                            </div>
                            <div className="w-1/2 flex flex-col gap-3 pl-4">
                               {[
                                 { label: 'Completed', val: '45%', count: '520', color: 'bg-blue-500' },
                                 { label: 'In Progress', val: '25%', count: '289', color: 'bg-emerald-500' },
                                 { label: 'Pending', val: '20%', count: '231', color: 'bg-amber-500' },
                                 { label: 'On Hold', val: '10%', count: '116', color: 'bg-rose-500' }
                               ].map(item => (
                                 <div key={item.label} className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                       <span className={`w-1.5 h-1.5 rounded-full ${item.color}`}></span>
                                       <span className="font-semibold text-gray-700">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <span className="font-bold text-gray-900">{item.val}</span>
                                       <span className="text-gray-400 font-medium">({item.count})</span>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                         {/* Upcoming Deadlines */}
                         <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 flex-1 flex flex-col min-h-0">
                            <div className="text-[13px] font-bold text-gray-900 mb-4">Upcoming Deadlines</div>
                            <div className="flex-1 overflow-hidden flex flex-col gap-0 border border-gray-100 rounded-lg">
                               {[
                                 { name: 'Project Alpha', date: 'Jun 01, 2026', due: '3 days left', urgent: true },
                                 { name: 'Mobile App Launch', date: 'Jun 05, 2026', due: '7 days left', urgent: false },
                                 { name: 'Q3 Marketing Review', date: 'Jun 10, 2026', due: '12 days left', urgent: false },
                                 { name: 'Security Audit', date: 'Jun 15, 2026', due: '17 days left', urgent: false },
                               ].map((dl, i) => (
                                 <div key={i} className="flex justify-between items-center p-2.5 border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50">
                                    <div className="text-[11px] font-bold text-gray-800">{dl.name}</div>
                                    <div className="flex gap-3 items-center">
                                       <div className="text-[9px] text-gray-500 font-medium">{dl.date}</div>
                                       <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${dl.urgent ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-50 text-emerald-500'}`}>{dl.due}</div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      </div>
    </section>
  );
}

