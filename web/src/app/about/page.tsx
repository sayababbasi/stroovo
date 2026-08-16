"use client";

import React from "react";
import MarketingLayout from "@/components/landing/layouts/MarketingLayout";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, Rocket, Shield, Heart,
  ArrowRight, Layout, CheckSquare,
  Target, MessageSquare, Workflow, BrainCircuit,
  ChevronRight
} from "lucide-react";

export default function AboutPage() {
  return (
    <MarketingLayout>

      {/* 1. Hero Section */}
      <section className="pt-24 pb-20 px-6 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] transform translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.03] pointer-events-none"></div>

        <div className="max-w-[1300px] mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">

          {/* Left Content */}
          <div className="w-full lg:w-5/12 flex flex-col items-start text-left">
            <div className="flex items-center text-sm text-gray-500 mb-8 font-medium">
              <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-gray-900">About Us</span>
            </div>

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[13px] font-bold tracking-wide mb-6">
              About Stroovo
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Building the future of work, <span className="text-[#0052CC]">together.</span>
            </h1>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
              Stroovo is an all-in-one work management platform built by Revotic AI to help modern teams plan, collaborate, and achieve more every day.
            </p>

            <div className="flex items-center gap-4">
              <Link href="/signup" className="px-8 py-3.5 bg-[#0052CC] hover:bg-[#0047B3] text-white font-semibold rounded-lg transition-all shadow-[0_8px_20px_rgb(0,82,204,0.2)] flex items-center gap-2 group">
                Explore Stroovo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all">
                Our Mission
              </button>
            </div>
          </div>

          {/* Right Content (CSS Mockup Dashboard) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-7/12 relative"
          >
            <div className="relative w-full aspect-[4/3] max-h-[500px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex">
              {/* Sidebar */}
              <div className="w-[200px] h-full bg-[#0A0F2C] p-6 flex flex-col gap-6 hidden sm:flex shrink-0">
                <div className="w-24 h-6 bg-white/20 rounded"></div>
                <div className="flex flex-col gap-4 mt-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-white/10"></div>
                      <div className="w-20 h-3 rounded bg-white/10"></div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Main Content */}
              <div className="flex-1 bg-[#FAFBFC] p-8 flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900 mb-2">Good morning, Alex! 👋</div>
                    <div className="text-sm text-gray-500">Here's what's happening with your workspace today.</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold">A</div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { l: 'Total Projects', v: '128' },
                    { l: 'Total Tasks', v: '1,156' },
                    { l: 'Team Members', v: '342' },
                    { l: 'Completed Tasks', v: '85%' },
                  ].map((m, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                      <span className="text-xs text-gray-500 font-medium mb-1">{m.l}</span>
                      <span className="text-2xl font-bold text-gray-900">{m.v}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-6 flex-1">
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
                    <div className="w-32 h-4 bg-gray-100 rounded mb-4"></div>
                    <div className="flex-1 border-b border-l border-gray-100 relative">
                      {/* Abstract chart line */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0 80 Q 20 60, 40 70 T 80 40 T 100 20" fill="none" stroke="#0052CC" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-1/3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-center relative">
                    {/* Donut chart abstract */}
                    <div className="w-24 h-24 rounded-full border-8 border-blue-100 border-t-[#0052CC] border-r-[#0052CC] transform -rotate-45"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xl font-bold text-gray-900">1,156</span>
                      <span className="text-[10px] text-gray-500">Total Tasks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Dots Pattern */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[url('/grid-pattern.svg')] opacity-20 z-[-1]"></div>
          </motion.div>
        </div>
      </section>

      {/* 2. Trusted By */}
      <TrustedBySection />

      {/* 3. Our Mission */}
      <section id="mission" className="py-24 px-6 bg-[#FAFBFC]">
        <div className="max-w-[1300px] mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-[#0052CC] font-bold text-sm tracking-wider uppercase mb-4 block">Our Mission</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Empowering teams to do their best work
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe great work happens when teams are connected, aligned, and empowered with the right tools. Stroovo brings everything together in one secure platform so teams can focus on what truly matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Users className="w-6 h-6 text-blue-600" />, title: "Customer First", desc: "We build with empathy and obsess over helping our customers succeed." },
              { icon: <Rocket className="w-6 h-6 text-emerald-600" />, title: "Innovation", desc: "We continuously innovate to solve real-world operational challenges." },
              { icon: <Shield className="w-6 h-6 text-purple-600" />, title: "Trust & Security", desc: "Security, privacy, and reliability are at the core of everything we build." },
              { icon: <Heart className="w-6 h-6 text-rose-600" />, title: "Together", desc: "We believe in the power of teamwork inside our company and with our customers." }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Metrics / Stats Bar */}
      <section className="px-6 py-12 bg-[#FAFBFC]">
        <div className="max-w-[1300px] mx-auto">
          <div className="bg-[#0A0F2C] rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10 text-white text-center md:text-left divide-x-0 md:divide-x divide-white/10">
              <div className="md:px-8">
                <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
                <div className="text-gray-400 text-sm font-medium">Teams trust Stroovo</div>
              </div>
              <div className="md:px-8">
                <div className="text-4xl md:text-5xl font-bold mb-2">1M+</div>
                <div className="text-gray-400 text-sm font-medium">Projects managed</div>
              </div>
              <div className="md:px-8">
                <div className="text-4xl md:text-5xl font-bold mb-2">10M+</div>
                <div className="text-gray-400 text-sm font-medium">Tasks completed</div>
              </div>
              <div className="md:px-8">
                <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
                <div className="text-gray-400 text-sm font-medium">Countries worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Story + Revotic AI Connection */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            <div className="w-full lg:w-1/2">
              <span className="text-[#0052CC] font-bold text-sm tracking-wider uppercase mb-4 block">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How Stroovo came to life</h2>

              <div className="space-y-6 text-gray-600 leading-relaxed text-lg mb-10">
                <p>
                  Stroovo was founded by the team at Revotic AI with a simple vision: to create a modern work management platform that helps teams move faster, stay aligned, and achieve more together.
                </p>
                <p>
                  After years of building products and working with teams across industries, we saw the same challenges everywhere fragmented tools, disconnected teams, and a lack of visibility.
                </p>
                <p>
                  So we built Stroovo. Today, Stroovo helps thousands of teams around the world simplify work, streamline collaboration, and drive results.
                </p>
              </div>
            </div>

            <div className="w-full lg:w-1/2 relative">
              <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Team collaborating"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
              </div>

              {/* Floating Revotic AI Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-8 -left-8 md:-bottom-12 md:-left-12 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 max-w-sm flex flex-col md:flex-row gap-6 items-center w-full"
              >
                <div className="w-16 h-16 bg-[#0A0F2C] rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-white font-bold text-2xl">R</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Parent Company</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Stroovo is a product of Revotic AI</h4>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">We're on a mission to reimagine the future of work through intelligent software.</p>
                  <a href="https://revotic.ai" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#0052CC] hover:underline flex items-center gap-1 group">
                    Learn more about Revotic AI
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Product Vision Ecosystem */}
      <section className="py-24 px-6 bg-[#FAFBFC] border-y border-gray-100">
        <div className="max-w-[1300px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">One connected workspace</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-16">
            We're building an ecosystem where every aspect of your organization's work is seamlessly connected, intelligent, and visible.
          </p>

          <div className="relative max-w-4xl mx-auto">
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 -translate-y-1/2 hidden md:block"></div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative z-10">
              {[
                { icon: <Layout />, label: "Projects" },
                { icon: <CheckSquare />, label: "Tasks" },
                { icon: <Users />, label: "Teams" },
                { icon: <Target />, label: "Goals" },
                { icon: <BrainCircuit />, label: "AI Auto" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-blue-600 mb-4 transform hover:scale-110 transition-transform">
                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-7 h-7" })}
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Our Journey Timeline */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">The milestones that shaped Revotic AI and Stroovo.</p>
          </div>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {[
              { year: "2021", title: "Foundation", desc: "Revotic AI is founded with a mission to build intelligent enterprise tools." },
              { year: "2022", title: "Product Development", desc: "Engineering begins on a centralized workspace to solve internal collaboration challenges." },
              { year: "2023", title: "Stroovo Launch", desc: "Stroovo officially launches to the public, acquiring its first 1,000 beta organizations." },
              { year: "2025", title: "Platform Expansion", desc: "Introduction of Goals (OKRs), advanced Automation, and seamless third-party Integrations." },
              { year: "2026", title: "Enterprise Growth", desc: "Stroovo becomes the work management platform of choice for leading global enterprises." }
            ].map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#0052CC] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                    <span className="text-sm font-bold text-[#0052CC] bg-blue-50 px-3 py-1 rounded-full">{item.year}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Our Principles */}
      <section className="py-24 px-6 bg-[#FAFBFC] border-y border-gray-100">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How we build</h2>
            <p className="text-lg text-gray-600">The principles that guide our engineering and product decisions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              "Simplicity by default. Complexity only when necessary.",
              "Reliability is the most important feature.",
              "Security and privacy are non-negotiable.",
              "Transparency in our processes and pricing.",
              "Continuous, iterative improvement over massive rewrites.",
              "Customer-focused development we build what teams actually need."
            ].map((principle, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <FinalCTASection />

    </MarketingLayout>
  );
}
