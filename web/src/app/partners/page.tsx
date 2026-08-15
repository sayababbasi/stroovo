"use client";

import React, { useState } from "react";
import MarketingLayout from "@/components/landing/layouts/MarketingLayout";
import { Handshake, Code2, LineChart, Cpu, ArrowRight } from "lucide-react";

export default function PartnersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const partnerTypes = [
    { title: "Technology Partners", icon: <Cpu className="w-6 h-6" />, desc: "Build deep integrations between your product and Stroovo." },
    { title: "Integration Partners", icon: <Code2 className="w-6 h-6" />, desc: "Create public apps and plugins for the Stroovo ecosystem." },
    { title: "Consulting Partners", icon: <LineChart className="w-6 h-6" />, desc: "Help organizations implement and optimize their workflows." },
    { title: "Strategic Partners", icon: <Handshake className="w-6 h-6" />, desc: "Co-marketing, reselling, and large-scale joint ventures." }
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="bg-white pt-24 pb-20 px-6 border-b border-gray-100">
        <div className="max-w-[1000px] mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Build with Stroovo.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Join the Revotic AI partner ecosystem. Together, we can deliver unprecedented value and transform how enterprise teams manage work.
          </p>
          <button onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/20">
            Become a Partner
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section className="py-24 px-6 bg-[#FAFBFC]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partnership Opportunities</h2>
            <p className="text-gray-600">Choose the path that best fits your business model.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerTypes.map((type, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {type.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="partner-form" className="py-24 px-6 bg-white">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Apply to Partner</h2>
            <p className="text-gray-600">Tell us about your organization and how we can grow together.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12">
            {isSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Received!</h3>
                <p className="text-gray-600 text-sm">Our partner team at Revotic AI will review your application and be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Email <span className="text-red-500">*</span></label>
                    <input required type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Interest <span className="text-red-500">*</span></label>
                  <select required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white">
                    <option value="">Select an option...</option>
                    <option value="technology">Technology Partner</option>
                    <option value="integration">Integration Partner</option>
                    <option value="consulting">Consulting Partner</option>
                    <option value="strategic">Strategic Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tell us about your proposal <span className="text-red-500">*</span></label>
                  <textarea required rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </MarketingLayout>
  );
}
