import { MessageSquare, Bell, Share2 } from "lucide-react";

export default function CollaborationSection() {
  const benefits = [
    {
      title: "Real-Time Collaboration",
      desc: "Discuss work directly on tasks and projects.",
      icon: <MessageSquare size={20} className="text-[#0052CC]" />
    },
    {
      title: "Context Where Work Happens",
      desc: "Never lose track of important decisions.",
      icon: <Share2 size={20} className="text-[#0052CC]" />
    },
    {
      title: "Everyone Stays Informed",
      desc: "Smart notifications keep your team aligned.",
      icon: <Bell size={20} className="text-[#0052CC]" />
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent border-b border-gray-100 overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6">
        
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Team Workflow</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Keep Everyone Aligned
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Eliminate silos and endless email threads. Bring your team's conversations, files, and updates directly into the context of your work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 text-[#0052CC]">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-500">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Collaboration UI Mockup */}
        <div className="max-w-[1000px] mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100">
            {/* Header */}
            <div className="h-14 border-b border-gray-100 bg-gray-50 flex items-center px-6 gap-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white z-30">AJ</div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white z-20">MS</div>
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white z-10">TK</div>
              </div>
              <div className="text-sm font-bold text-gray-800 border-l border-gray-200 pl-4">Q3 Marketing Campaign</div>
              <div className="ml-auto flex items-center gap-2">
                <div className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-600">Share</div>
              </div>
            </div>
            
            <div className="flex h-[400px]">
              {/* Task Details Side */}
              <div className="w-[60%] p-8 border-r border-gray-100 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">In Progress</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Finalize Campaign Assets</h3>
                <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                  We need to review all the visual assets for the Q3 launch before end of week. Please ensure the banners and social graphics follow the new design system guidelines.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <div className="text-xs text-gray-500 font-medium mb-1">Assignee</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">TK</div>
                      <span className="text-sm font-semibold text-gray-900">Tom Kingsley</span>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <div className="text-xs text-gray-500 font-medium mb-1">Due Date</div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-semibold text-gray-900">Aug 24, 2026</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Comments Side */}
              <div className="w-[40%] bg-white flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  <div className="text-sm font-bold text-gray-900">Activity & Comments</div>
                </div>
                <div className="flex-1 p-4 overflow-hidden flex flex-col gap-6">
                  {/* Comment 1 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">AJ</div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-900">Alice Johnson</span>
                        <span className="text-[10px] text-gray-500">2 hours ago</span>
                      </div>
                      <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        I've uploaded the initial drafts for the social banners. @Tom Kingsley let me know what you think.
                      </div>
                    </div>
                  </div>
                  {/* Comment 2 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">TK</div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-900">Tom Kingsley</span>
                        <span className="text-[10px] text-gray-500">Just now</span>
                      </div>
                      <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm border-l-2 border-l-[#0052CC]">
                        Looking good! Can we adjust the primary blue to match the new hex code?
                      </div>
                    </div>
                  </div>
                </div>
                {/* Input area */}
                <div className="p-4 border-t border-gray-100 bg-white mt-auto">
                  <div className="border border-gray-200 rounded-lg p-2 focus-within:border-[#0052CC] transition-colors">
                    <div className="text-sm text-gray-400 px-2 py-1">Write a comment... (Type @ to mention)</div>
                    <div className="flex justify-between items-center mt-2 px-2">
                      <div className="flex gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      </div>
                      <div className="px-3 py-1 bg-[#0052CC] text-white text-xs font-bold rounded">Comment</div>
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

