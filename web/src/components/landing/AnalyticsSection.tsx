"use client";

import Link from "next/link";
import { CheckCircle2, TrendingUp, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsSection() {
  return (
    <section className="py-24 bg-transparent overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

          {/* Left Column: Content & Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start pr-4"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Data-Driven Success</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-[1.15] mb-5 tracking-tight">
              Insights That Drive Better Results
            </h2>

            <p className="text-[15px] text-gray-500 mb-10 leading-relaxed max-w-[380px]">
              Track performance, measure progress, and uncover opportunities with powerful analytics and reports.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 w-full">
              <div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">98%</div>
                <div className="text-[10px] text-gray-500 leading-tight">On-time project delivery</div>
              </div>
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <TrendingUp size={16} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">3.5x</div>
                <div className="text-[10px] text-gray-500 leading-tight">Increase in team productivity</div>
              </div>
              <div>
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <BarChart3 size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">50+</div>
                <div className="text-[10px] text-gray-500 leading-tight">Customizable reports</div>
              </div>
            </div>

            <Link
              href="#"
              className="group flex items-center text-[#0052CC] font-bold text-[14px] hover:text-[#0047B3] transition-colors"
            >
              View Analytics Dashboard
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Center Column: Chart Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col h-[400px]"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
              <h3 className="text-[13px] font-bold text-gray-900">Team Productivity</h3>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer">
                This Quarter <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-[11px] font-semibold text-gray-500 mb-1">Overall Productivity</div>
              <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                32% vs last quarter
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex-1 flex items-end gap-4 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] font-medium text-gray-400">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Grid lines */}
              <div className="absolute left-6 right-0 top-1.5 bottom-6 flex flex-col justify-between z-0">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-full border-t border-gray-100"></div>
                ))}
              </div>

              {/* Bars */}
              <div className="flex-1 flex justify-between items-end pl-8 z-10 h-[85%] pb-2">
                {[
                  { height: '40%', label: 'Jan' },
                  { height: '65%', label: 'Feb' },
                  { height: '45%', label: 'Mar' },
                  { height: '80%', label: 'Apr' },
                  { height: '95%', label: 'May' },
                  { height: '70%', label: 'Jun' }
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center w-10">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: bar.height }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: 0.4 + (i * 0.1), ease: "easeOut" }}
                      className="w-6 bg-[#0052CC] rounded-t-sm"
                    ></motion.div>
                    <div className="text-[9px] font-medium text-gray-500 mt-2">{bar.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[#0E1528] rounded-2xl p-8 flex flex-col justify-between h-[400px] relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-[60px] transform translate-x-1/2 -translate-y-1/2"></div>

            <div>
              <div className="text-[#4C9AFF] mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <p className="text-white text-[16px] leading-relaxed font-medium">
                Stroovo has transformed the way our teams collaborate and deliver results. It's intuitive, powerful, and scalable   exactly what we needed to grow.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden border-2 border-gray-700">
                  <img src="https://i.pravatar.cc/100?img=11" alt="James Anderson" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">James Anderson</div>
                  <div className="text-gray-400 text-[10px]">Chief Operations Officer, TechNova</div>
                </div>
              </div>

              {/* Subtle logos */}
              <div className="flex items-center gap-6 opacity-40">
                <div className="text-white text-xs font-bold tracking-tight flex items-center gap-1">
                  <div className="w-3 h-3 bg-white rounded-sm rotate-45"></div> TechNova
                </div>
                <div className="text-white text-xs font-bold tracking-tight">Google</div>
                <div className="text-white text-xs font-bold tracking-tight">Microsoft</div>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

