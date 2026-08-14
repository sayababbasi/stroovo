import Link from "next/link";
import { ArrowRight, Target, Flag, TrendingUp, BarChart } from "lucide-react";

export default function GoalsSection() {
  const goalFeatures = [
    { title: "Set Milestones", icon: <Flag size={18} className="text-[#0052CC]" /> },
    { title: "Track Progress", icon: <TrendingUp size={18} className="text-[#0052CC]" /> },
    { title: "Connect to Work", icon: <Target size={18} className="text-[#0052CC]" /> },
    { title: "Measure Performance", icon: <BarChart size={18} className="text-[#0052CC]" /> }
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-12">
          
          {/* Right Column: Content */}
          <div className="w-full lg:w-5/12 flex flex-col items-start lg:pl-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Company Alignment</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Turn Goals <br className="hidden md:block" /> Into Results
            </h2>
            
            <p className="text-lg text-gray-500 mb-8 max-w-[480px] leading-relaxed">
              Connect your daily work to high-level company objectives. Set OKRs, track milestones, and ensure every team member understands their impact.
            </p>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10 w-full">
              {goalFeatures.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-gray-700 font-medium text-[15px]">{item.title}</span>
                </div>
              ))}
            </div>
            
            <Link 
              href="#" 
              className="group flex items-center text-[#0052CC] font-bold text-[15px] hover:text-[#0047B3] transition-colors"
            >
              Learn about OKRs 
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Left Column: Dashboard Mockup */}
          <div className="w-full lg:w-7/12 relative mt-8 lg:mt-0">
            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-emerald-50/50 rounded-full blur-[60px] -z-10"></div>
            
            {/* Dashboard Container */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col transform md:rotate-y-2 md:-rotate-x-2 md:scale-[1.02] perspective-1000">
              
              <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white">
                <div className="font-bold text-gray-900 text-lg">Company OKRs - Q3</div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">Quarter 3</div>
                  <div className="px-3 py-1.5 bg-[#0052CC] text-white rounded-lg text-xs font-bold">New Goal</div>
                </div>
              </div>
              
              <div className="p-8 bg-white flex flex-col gap-4">
                
                {/* Goal Card 1 */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wide">Company Goal</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wide">On Track</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Increase Enterprise Revenue by 30%</h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 text-xs font-bold">SM</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                      <span>Progress</span>
                      <span>68%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <div className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Key Results</div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded border border-emerald-500 bg-emerald-50 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div className="text-xs text-gray-700 font-medium flex-1">Close 15 new enterprise deals</div>
                        <div className="text-xs font-bold text-gray-900">12 / 15</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded border border-gray-300"></div>
                        <div className="text-xs text-gray-700 font-medium flex-1">Increase average deal size to $50k</div>
                        <div className="text-xs font-bold text-gray-900">$42k / $50k</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goal Card 2 */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm opacity-80">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide">Team Goal</span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wide">At Risk</span>
                      </div>
                      <h4 className="text-[15px] font-bold text-gray-900">Launch Version 2.0 of Mobile App</h4>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-700 mb-1.5">
                      <span>Progress</span>
                      <span>42%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }}></div>
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

