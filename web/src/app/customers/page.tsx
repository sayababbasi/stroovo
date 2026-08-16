"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { ArrowRight, Building, Globe, Zap, Users, Shield, LineChart, Briefcase } from "lucide-react";

const INDUSTRIES = [
  { name: "Software & IT", icon: Globe, description: "Streamline product development, sprints, and release cycles." },
  { name: "Marketing & Agencies", icon: Zap, description: "Coordinate campaigns, track assets, and manage client deliverables." },
  { name: "Operations", icon: Building, description: "Automate workflows and manage cross-functional processes." },
  { name: "Sales & RevOps", icon: LineChart, description: "Align go-to-market teams and track account onboarding." },
  { name: "Human Resources", icon: Users, description: "Manage hiring pipelines, onboarding, and employee engagement." },
  { name: "Finance & Legal", icon: Shield, description: "Securely handle compliance, approvals, and document tracking." }
];

const USE_CASES = [
  { title: "Project Management", description: "Keep initiatives on track from kickoff to launch with timelines and dependencies.", icon: Briefcase },
  { title: "Task Tracking", description: "Organize daily work, assign responsibilities, and monitor progress in real-time.", icon: Users },
  { title: "Goal Alignment", description: "Connect daily tasks to high-level company OKRs so everyone knows their impact.", icon: LineChart },
  { title: "Workflow Automation", description: "Eliminate manual busywork and let Stroovo handle repetitive status updates.", icon: Zap }
];

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col pt-[76px]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-6 text-center bg-[#0A0F2C] relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px]"></div>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 mb-6">
              <span className="text-blue-400 text-xs font-bold tracking-wide uppercase">Customer Stories</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Powering the world's most effective teams
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              From fast-growing startups to global enterprises, discover how teams use Stroovo to orchestrate their work and achieve their goals.
            </p>
          </div>
        </section>

        {/* Placeholder Logos Section */}
        <section className="py-12 border-b border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Trusted by innovative companies</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
              {/* Note: Placeholder logos as per instructions */}
              <div className="flex items-center gap-2 font-bold text-xl text-gray-400"><Building size={24}/> [Acme Corp]</div>
              <div className="flex items-center gap-2 font-bold text-xl text-gray-400"><Globe size={24}/> [GlobalTech]</div>
              <div className="flex items-center gap-2 font-bold text-xl text-gray-400"><Zap size={24}/> [Innovate Inc]</div>
              <div className="flex items-center gap-2 font-bold text-xl text-gray-400"><LineChart size={24}/> [Growth LLC]</div>
              <div className="flex items-center gap-2 font-bold text-xl text-gray-400"><Shield size={24}/> [SecureSys]</div>
            </div>
          </div>
        </section>

        {/* Featured Customer Stories (Placeholders) */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Customer Stories</h2>
              <p className="text-lg text-gray-500">See how industry leaders are transforming the way they work.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Story 1 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-900/10"></div>
                  <span className="text-gray-500 font-medium z-10">[Customer Office / Team Image Placeholder]</span>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Software & IT</span>
                    <span className="text-xs text-gray-500 font-medium">Case Study</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    How [Acme Corp] reduced time-to-market by 30%
                  </h3>
                  <p className="text-gray-600 mb-8 flex-1 leading-relaxed">
                    "[Placeholder Testimonial] By centralizing our engineering sprints and product roadmaps in Stroovo, we eliminated cross-department silos and drastically improved our delivery speed."
                  </p>
                  <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                    <div>
                      <div className="text-2xl font-black text-gray-900">30%</div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Faster Delivery</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-900">4hrs</div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Saved Weekly</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Story 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-900/10"></div>
                  <span className="text-gray-500 font-medium z-10">[Customer Office / Team Image Placeholder]</span>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Marketing</span>
                    <span className="text-xs text-gray-500 font-medium">Case Study</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    [GlobalTech] scales global campaigns seamlessly
                  </h3>
                  <p className="text-gray-600 mb-8 flex-1 leading-relaxed">
                    "[Placeholder Testimonial] Stroovo gives our marketing teams the visibility they need to coordinate massive multi-channel campaigns without missing a single deadline."
                  </p>
                  <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                    <div>
                      <div className="text-2xl font-black text-gray-900">2x</div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Campaign Output</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-900">100%</div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Visibility</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for every workflow</h2>
              <p className="text-lg text-gray-500">Discover how different teams leverage the Stroovo platform.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {USE_CASES.map((uc, idx) => {
                const Icon = uc.icon;
                return (
                  <div key={idx} className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-6 text-blue-600 shadow-sm">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{uc.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{uc.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted across industries</h2>
                <p className="text-lg text-gray-500">Whatever your business does, Stroovo adapts to your unique processes and requirements.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INDUSTRIES.map((industry, idx) => {
                const Icon = industry.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors shadow-sm flex items-start gap-4">
                    <div className="mt-1 shrink-0 p-2 bg-blue-50 text-blue-600 rounded-md">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">{industry.name}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{industry.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Dual CTA Section */}
        <section className="py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Standard CTA */}
            <div className="bg-[#0052CC]/5 border border-blue-100 rounded-2xl p-10 flex flex-col justify-center items-start">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to join them?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Start managing your work more effectively today. Get started for free, no credit card required.
              </p>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-6 py-3 bg-[#0052CC] hover:bg-[#0047B3] text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                Get Started for Free
              </Link>
            </div>

            {/* Enterprise CTA */}
            <div className="bg-[#0A0F2C] border border-[#1B2339] rounded-2xl p-10 flex flex-col justify-center items-start text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Need an enterprise solution?</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Learn how Stroovo can scale securely across your entire organization with advanced controls and dedicated support.
              </p>
              <Link 
                href="/book-demo" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0A0F2C] hover:bg-gray-100 font-semibold rounded-lg transition-colors group"
              >
                Contact Sales <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
