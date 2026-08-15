"use client";

import Link from "next/link";
import { Zap, Headphones, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function FinalCTASection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0A0F2C] overflow-hidden">
      {/* Background Glows & Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0052CC] opacity-20 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4C9AFF] opacity-10 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-[1300px] mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Left Column: CTA Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full lg:w-5/12 flex flex-col items-start"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Ready to Transform How Your Team Works?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-[480px] leading-relaxed">
              Join thousands of teams already using Stroovo to plan, collaborate, and achieve more together.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#0052CC] hover:bg-[#0047B3] text-white font-semibold text-[15px] transition-all shadow-[0_8px_20px_rgb(0,82,204,0.3)] hover:-translate-y-0.5 text-center"
              >
                Get Started Free
              </Link>
              <Link 
                href="#" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-[15px] transition-all text-center"
              >
                Book a Demo
              </Link>
            </div>
            
            {/* Value Props */}
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                     <Zap size={16} className="text-blue-400" />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-white">Quick Setup</div>
                     <div className="text-[11px] text-gray-400">Get started in minutes</div>
                  </div>
               </div>
               <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                     <Headphones size={16} className="text-blue-400" />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-white">Dedicated Support</div>
                     <div className="text-[11px] text-gray-400">We're here to help</div>
                  </div>
               </div>
               <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                     <Shield size={16} className="text-blue-400" />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-white">Enterprise Security</div>
                     <div className="text-[11px] text-gray-400">Your data is always safe</div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Right Column: Abstract Product Visuals */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-7/12 relative flex justify-center lg:justify-end perspective-1000"
          >
            
            {/* Floating UI Elements */}
            <div className="relative w-full max-w-[600px] h-[450px]">
               {/* Main UI Window */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[320px] bg-white rounded-2xl shadow-2xl border border-white/10 transform rotate-y-[-10deg] rotate-x-[5deg] rotate-z-[2deg] flex flex-col overflow-hidden">
                  <div className="h-4 bg-gray-100 border-b border-gray-200"></div>
                  <div className="flex-1 bg-white p-4 flex gap-4">
                     <div className="w-1/4 h-full bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2 p-2">
                        <div className="w-full h-3 bg-gray-200 rounded"></div>
                        <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
                        <div className="w-5/6 h-3 bg-gray-100 rounded"></div>
                        <div className="w-full h-3 bg-gray-100 rounded mt-4"></div>
                        <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
                     </div>
                     <div className="w-3/4 h-full bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
                        <div className="w-1/3 h-4 bg-blue-100 rounded"></div>
                        <div className="flex gap-2">
                           <div className="w-1/4 h-16 bg-gray-50 rounded border border-gray-100"></div>
                           <div className="w-1/4 h-16 bg-gray-50 rounded border border-gray-100"></div>
                           <div className="w-1/4 h-16 bg-gray-50 rounded border border-gray-100"></div>
                           <div className="w-1/4 h-16 bg-gray-50 rounded border border-gray-100"></div>
                        </div>
                        <div className="w-full flex-1 bg-gray-50 rounded border border-gray-100 mt-2"></div>
                     </div>
                  </div>
               </div>

               {/* Floating Badges */}
               <div className="absolute top-[10%] left-[5%] w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl flex items-center justify-center transform -rotate-12 animate-[float_4s_ease-in-out_infinite]">
                  <div className="w-6 h-6 rounded-md border-2 border-blue-400"></div>
               </div>
               
               <div className="absolute bottom-[20%] left-0 w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl flex items-center justify-center transform rotate-12 animate-[float_5s_ease-in-out_infinite_1s]">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  </div>
               </div>
               
               <div className="absolute top-[20%] right-[5%] w-16 h-16 bg-[#0052CC]/80 backdrop-blur-md rounded-xl border border-blue-400/30 shadow-[0_10px_30px_rgb(0,82,204,0.5)] flex items-center justify-center transform rotate-6 animate-[float_6s_ease-in-out_infinite_0.5s]">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               
               <div className="absolute bottom-[10%] right-[10%] w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl flex items-center justify-center transform -rotate-6 animate-[float_4.5s_ease-in-out_infinite_1.5s]">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
               </div>

            </div>
          </motion.div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-15px) rotate(var(--tw-rotate)); }
          100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
        }
      `}} />
    </section>
  );
}

