"use client";

import React from "react";
import MarketingLayout from "@/components/landing/layouts/MarketingLayout";
import { ArrowRight, Code, PenTool, BrainCircuit, Briefcase, Search } from "lucide-react";

export default function CareersPage() {
  const departments = [
    { name: "Engineering", icon: <Code className="w-5 h-5" />, desc: "Build the scalable infrastructure powering Stroovo." },
    { name: "Product & Design", icon: <PenTool className="w-5 h-5" />, desc: "Shape the future of work management UX." },
    { name: "AI / ML", icon: <BrainCircuit className="w-5 h-5" />, desc: "Integrate intelligence into daily workflows." },
    { name: "Business & Sales", icon: <Briefcase className="w-5 h-5" />, desc: "Grow our enterprise customer base." }
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="bg-white pt-24 pb-20 px-6 border-b border-gray-100">
        <div className="max-w-[1000px] mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Build the future of work with us.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Join the Revotic AI team and help us build Stroovo, the platform that empowers organizations to achieve their most ambitious goals.
          </p>
          <button onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors">
            View Open Positions
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 px-6 bg-[#FAFBFC]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {dept.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{dept.name}</h3>
                <p className="text-sm text-gray-500">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions (Empty State as requested) */}
      <section id="open-positions" className="py-24 px-6 bg-white">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Open Positions</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No open positions currently</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Our team is currently at capacity, but we're always looking for exceptional talent to join Revotic AI in building Stroovo. 
            </p>
            <a href="mailto:talent@revotic.ai" className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Send Resume General Inquiry
            </a>
          </div>
        </div>
      </section>

    </MarketingLayout>
  );
}
