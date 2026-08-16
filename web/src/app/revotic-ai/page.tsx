"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, Globe, Sparkles, Building2, Workflow, Shield } from "lucide-react";

export default function RevoticAIPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col pt-[76px]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-6 text-center bg-[#0A0F2C] relative overflow-hidden">
          {/* Neural Network / AI Background Effect */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[150px] mix-blend-screen"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] mix-blend-screen"></div>
            
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 <pattern id="ai-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                 </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ai-grid)" />
            </svg>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 mb-8">
              <Bot size={14} className="text-blue-400 mr-2" />
              <span className="text-blue-400 text-xs font-bold tracking-wide uppercase">The Company Behind Stroovo</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Revotic AI
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              Pioneering the future of intelligent work. We build AI-native platforms that empower human potential and transform how organizations operate.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://revoticai.com/" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-[#0A0F2C] hover:bg-gray-100 font-bold rounded-lg transition-colors shadow-lg flex items-center justify-center">
                Visit Revotic AI <ArrowRight size={18} className="ml-2" />
              </a>
            </div>
          </div>
        </section>

        {/* The Relationship Section */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2 relative">
                <div className="aspect-square bg-gray-50 rounded-3xl border border-gray-100 p-8 relative overflow-hidden shadow-sm flex items-center justify-center">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full blur-2xl"></div>
                  
                  {/* Architecture Visualization */}
                  <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                    {/* Revotic AI (Parent) */}
                    <div className="w-full bg-white border-2 border-blue-600 rounded-2xl p-6 text-center shadow-lg transform -translate-y-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                        <BrainCircuit size={24} className="text-white" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">Revotic AI</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Parent Company & AI Engine</p>
                    </div>
                    
                    {/* Connection Line */}
                    <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-blue-300"></div>
                    
                    {/* Stroovo (Product) */}
                    <div className="w-5/6 bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-md">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                      </div>
                      <h4 className="font-bold text-lg text-gray-900">Stroovo</h4>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Flagship Work Platform</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">One ecosystem, unified vision.</h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    <strong className="text-gray-900">Stroovo is proudly built and operated by Revotic AI.</strong> 
                  </p>
                  <p>
                    We didn't just build another project management tool. Revotic AI engineered Stroovo from the ground up as a native application for the AI era. 
                  </p>
                  <p>
                    By housing Stroovo under the Revotic AI umbrella, our work management platform benefits directly from our core team's cutting-edge research in machine learning, automation, and enterprise intelligence. Every feature in Stroovo is designed with automation-first principles.
                  </p>
                </div>
                
                <div className="mt-10 grid grid-cols-2 gap-6">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <div className="text-3xl font-black text-gray-900 mb-1">HQ</div>
                    <div className="text-sm font-semibold text-gray-500 uppercase">Global Presence</div>
                  </div>
                  <div className="border-l-4 border-indigo-600 pl-4">
                    <div className="text-3xl font-black text-gray-900 mb-1">100%</div>
                    <div className="text-sm font-semibold text-gray-500 uppercase">Privately Held</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars of Revotic AI */}
        <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Revotic AI Advantage</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                How our parent company's expertise translates into a superior platform experience for Stroovo users.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  <BrainCircuit size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Native AI Architecture</h3>
                <p className="text-gray-600 leading-relaxed">
                  Unlike legacy tools that bolt on AI as an afterthought, Revotic built Stroovo on a foundation designed specifically for machine intelligence and data synthesis.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                  <Shield size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  Revotic AI brings enterprise-grade security standards, ensuring that data processing, AI models, and user privacy meet the strictest global compliance requirements.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                  <Workflow size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Continuous Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  As Revotic advances its core AI models, those capabilities are immediately deployed into the Stroovo ecosystem, giving our users a permanent competitive edge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Impact CTA */}
        <section className="py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
              <Globe size={32} className="text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Join the Revotic AI journey
            </h2>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed">
              Experience the platform that represents the culmination of our research and engineering.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/signup" 
                className="px-8 py-4 bg-[#0052CC] hover:bg-[#0047B3] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Try Stroovo Free
              </Link>
              <a 
                href="https://revoticai.com/careers" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-8 py-4 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-bold rounded-lg transition-all"
              >
                Careers at Revotic
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
