"use client";

import React, { useState } from "react";
import MarketingLayout from "@/components/landing/layouts/MarketingLayout";
import { Mail, MessageSquare, Phone, Building2 } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <MarketingLayout>
      <div className="bg-[#0A0F2C] py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div>
        <div className="max-w-[1100px] mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Contact Us</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Whether you have a question about features, enterprise pricing, or need technical support, our team is ready to answer all your questions.
          </p>
        </div>
      </div>

      <section className="py-16 px-6 bg-[#FAFBFC]">
        <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-12">
          
          {/* Contact Info Sidebar */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Product Support</h3>
                <p className="text-sm text-gray-500 mb-2">Technical issues or how-to questions.</p>
                <Link href="/help" className="text-sm text-blue-600 font-medium hover:underline">Visit Help Center</Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Enterprise Sales</h3>
                <p className="text-sm text-gray-500 mb-2">Custom pricing and large-scale deployments.</p>
                <a href="mailto:sales@revotic.ai" className="text-sm text-blue-600 font-medium hover:underline">sales@revotic.ai</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">General Inquiries</h3>
                <p className="text-sm text-gray-500 mb-2">Partnerships, press, or other matters.</p>
                <a href="mailto:hello@revotic.ai" className="text-sm text-blue-600 font-medium hover:underline">hello@revotic.ai</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h2>
            
            {isSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-600 text-sm">Thank you for reaching out. A member of our team will get back to you shortly.</p>
                <button onClick={() => setIsSuccess(false)} className="mt-6 text-sm text-blue-600 font-medium hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input required type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Email <span className="text-red-500">*</span></label>
                    <input required type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="jane@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inquiry Type <span className="text-red-500">*</span></label>
                    <select required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white">
                      <option value="">Select an option...</option>
                      <option value="sales">Enterprise Sales</option>
                      <option value="support">Product Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
                  <textarea required rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : "Send Message"}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  By submitting this form, you agree to Revotic AI's Privacy Policy.
                </p>
              </form>
            )}
          </div>

        </div>
      </section>
    </MarketingLayout>
  );
}
