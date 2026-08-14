import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function WorkManagementSection() {
  const capabilitiesList = [
    "Project & Task Management",
    "Time Tracking & Reporting",
    "Team Collaboration",
    "File Management",
    "Goal Tracking & OKRs",
    "Calendar & Scheduling"
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
          
          {/* Left Column: Content */}
          <div className="w-full lg:w-5/12 flex flex-col items-start">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Everything You Need</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Manage Every Aspect <br className="hidden md:block" /> of Your Work
            </h2>
            
            <p className="text-lg text-gray-500 mb-8 max-w-[480px] leading-relaxed">
              From project planning to task execution, team collaboration to goal tracking—Stroovo has every tool you need to succeed.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-10">
              {capabilitiesList.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-[#0052CC] shrink-0" fill="#E6EFFF" />
                  <span className="text-gray-700 font-medium text-[15px]">{item}</span>
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
          </div>

          {/* Right Column: Dashboard Mockup */}
          <div className="w-full lg:w-7/12 relative mt-8 lg:mt-0">
            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50/50 rounded-full blur-[60px] -z-10"></div>
            
            {/* Dashboard Container */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col">
              
              <div className="flex h-[520px]">
                {/* Mock Sidebar */}
                <div className="w-48 bg-[#172B4D] flex flex-col py-4 border-r border-[#091E42] shrink-0">
                  <div className="px-4 mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center font-bold text-[10px]">S</div>
                    <div className="text-white font-bold text-sm">Stroovo</div>
                  </div>
                  
                  <div className="flex flex-col space-y-1 px-2">
                    {['Overview', 'Users', 'Teams', 'Projects', 'Tasks', 'Goals', 'Calendar'].map((item, i) => (
                      <div key={item} className={`flex items-center gap-3 px-3 py-1.5 rounded text-xs font-medium ${i === 3 ? 'bg-white/10 text-white border-l-2 border-[#4C9AFF]' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-sm ${i === 3 ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Main Area */}
                <div className="flex-1 bg-white flex flex-col min-w-0">
                  {/* Top nav */}
                  <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
                    <div className="w-64 h-8 border border-gray-200 rounded-md bg-gray-50 flex items-center px-3">
                       <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                       <div className="h-2 w-24 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-500 font-medium">Administrator</div>
                      <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 text-xs font-bold">A</div>
                    </div>
                  </div>
                  
                  {/* Content area */}
                  <div className="flex-1 p-6 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                         <h3 className="text-xl font-bold text-gray-900 mb-1">Projects</h3>
                         <p className="text-xs text-gray-500">Manage and track all your projects in one place.</p>
                      </div>
                      <div className="px-4 py-2 bg-[#0052CC] text-white text-[12px] font-bold rounded-lg shadow-sm"> + New Project</div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-gray-200 mb-6">
                       {['All Projects', 'My Projects', 'Team Projects', 'Archived'].map((tab, i) => (
                         <div key={tab} className={`pb-3 text-sm font-medium ${i === 0 ? 'text-[#0052CC] border-b-2 border-[#0052CC]' : 'text-gray-500'}`}>
                           {tab}
                         </div>
                       ))}
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                       <div className="col-span-5">Project</div>
                       <div className="col-span-2">Status</div>
                       <div className="col-span-1">Progress</div>
                       <div className="col-span-2">Due Date</div>
                       <div className="col-span-2">Owner</div>
                    </div>
                    
                    {/* Table Rows */}
                    <div className="flex flex-col gap-1">
                      {[
                        { title: 'Project Alpha', sub: 'Website Redesign', status: 'In Progress', statusColor: 'bg-blue-100 text-blue-700', prog: '75%', date: 'May 30, 2026' },
                        { title: 'Mobile App Redesign', sub: 'Product App Mockups', status: 'At Risk', statusColor: 'bg-amber-100 text-amber-700', prog: '42%', date: 'Jun 15, 2026' },
                        { title: 'Marketing Campaign', sub: 'Q3 Marketing', status: 'On Track', statusColor: 'bg-emerald-100 text-emerald-700', prog: '90%', date: 'May 25, 2026' },
                        { title: 'Data Analytics Dashboard', sub: 'Development', status: 'In Progress', statusColor: 'bg-blue-100 text-blue-700', prog: '64%', date: 'Jun 10, 2026' },
                        { title: 'Security Implementation', sub: 'IT Admin', status: 'At Risk', statusColor: 'bg-red-100 text-red-700', prog: '40%', date: 'May 30, 2026' },
                      ].map((row, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 py-3 border-b border-gray-50 hover:bg-gray-50 rounded-lg px-2 items-center transition-colors">
                          <div className="col-span-5 flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'][i]}`}>
                                {row.title.charAt(0)}
                             </div>
                             <div>
                               <div className="text-sm font-bold text-gray-800">{row.title}</div>
                               <div className="text-[10px] text-gray-500">{row.sub}</div>
                             </div>
                          </div>
                          <div className="col-span-2">
                             <span className={`px-2 py-1 rounded text-[10px] font-bold ${row.statusColor}`}>{row.status}</span>
                          </div>
                          <div className="col-span-1 text-xs font-semibold text-gray-700">{row.prog}</div>
                          <div className="col-span-2 text-xs font-medium text-gray-600">{row.date}</div>
                          <div className="col-span-2 flex items-center">
                             <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white z-20"></div>
                                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white z-10"></div>
                             </div>
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
    </section>
  );
}

