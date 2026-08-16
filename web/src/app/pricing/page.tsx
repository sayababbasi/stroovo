"use client";

import React, { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { Check, X, HelpCircle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    description: "For individuals or very small teams getting started with work management.",
    priceMonthly: "$0",
    priceYearly: "$0",
    features: [
      "Up to 3 users",
      "Basic task management",
      "List & Board views",
      "Standard integrations",
      "Community support",
    ],
    cta: "Get Started for Free",
    href: "/signup",
    popular: false,
  },
  {
    name: "Starter",
    description: "For small teams that need to manage projects and track progress.",
    priceMonthly: "$12",
    priceYearly: "$10",
    features: [
      "Up to 15 users",
      "Everything in Free",
      "Timeline & Calendar views",
      "Custom fields",
      "Priority email support",
    ],
    cta: "Start 14-Day Trial",
    href: "/signup",
    popular: true,
  },
  {
    name: "Business",
    description: "For mid-sized companies that need to scale their work across teams.",
    priceMonthly: "$24",
    priceYearly: "$20",
    features: [
      "Unlimited users",
      "Everything in Starter",
      "Goals & OKRs tracking",
      "Workload management",
      "Advanced reporting & AI Assistant",
    ],
    cta: "Start 14-Day Trial",
    href: "/signup",
    popular: false,
  },
];

const ENTERPRISE_PLAN = {
  name: "Enterprise",
  description: "For large organizations needing enterprise-grade security, control, and support.",
  features: [
    "SAML SSO & Advanced provisioning",
    "Custom roles & permissions",
    "Audit logs & Data export",
    "Dedicated Customer Success Manager",
    "24/7 Phone & Priority Support",
    "Custom billing & invoicing",
  ],
};

const COMPARE_FEATURES = [
  {
    category: "Core Features",
    items: [
      { name: "Task Management", free: true, starter: true, business: true, enterprise: true },
      { name: "List & Board Views", free: true, starter: true, business: true, enterprise: true },
      { name: "Timeline & Calendar", free: false, starter: true, business: true, enterprise: true },
      { name: "Custom Fields", free: false, starter: true, business: true, enterprise: true },
      { name: "Goals & OKRs", free: false, starter: false, business: true, enterprise: true },
    ]
  },
  {
    category: "Administration & Security",
    items: [
      { name: "Basic Roles", free: true, starter: true, business: true, enterprise: true },
      { name: "Advanced Permissions", free: false, starter: false, business: true, enterprise: true },
      { name: "SAML SSO", free: false, starter: false, business: false, enterprise: true },
      { name: "Audit Logs", free: false, starter: false, business: false, enterprise: true },
    ]
  },
  {
    category: "Support",
    items: [
      { name: "Community Support", free: true, starter: true, business: true, enterprise: true },
      { name: "Email Support", free: false, starter: "Priority", business: "Priority", enterprise: "24/7 Priority" },
      { name: "Dedicated CSM", free: false, starter: false, business: false, enterprise: true },
    ]
  }
];

const FAQS = [
  {
    question: "Can I switch plans later?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time. Prorated charges or credits will automatically be applied to your account."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards including Visa, Mastercard, and American Express. For Enterprise plans, we also support invoice billing and wire transfers."
  },
  {
    question: "Do you offer discounts for non-profits?",
    answer: "Yes! We offer special pricing for registered non-profit organizations and educational institutions. Please contact our sales team to learn more."
  },
  {
    question: "What happens after the 14-day trial?",
    answer: "If you choose not to upgrade after your trial, your account will automatically be downgraded to our Free plan. You won't lose your data, but you'll lose access to premium features."
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col pt-[76px]">
      <Navbar />
      
      <main className="flex-1">
        {/* Header Section */}
        <section className="pt-20 pb-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-500 mb-10">
              No hidden fees, no surprise charges. Choose the plan that best fits your team's needs.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-14 h-7 rounded-full bg-[#0052CC] transition-colors focus:outline-none"
              >
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly <span className="text-green-600 font-bold ml-1 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full text-xs">Save 20%</span>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {PLANS.map((plan, idx) => (
                <div key={idx} className={`relative rounded-2xl border ${plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200 shadow-sm'} bg-white p-8 flex flex-col`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm h-10 mb-6">{plan.description}</p>
                  
                  <div className="mb-6 flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                      {isYearly ? plan.priceYearly : plan.priceMonthly}
                    </span>
                    <span className="text-gray-500 ml-2 font-medium">/ user / month</span>
                  </div>
                  
                  <Link 
                    href={plan.href}
                    className={`block w-full py-3 px-6 rounded-lg text-center font-semibold transition-all mb-8 ${
                      plan.popular 
                        ? 'bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-md' 
                        : 'bg-white border border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Features included:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start text-sm text-gray-600">
                          <Check size={18} className="text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enterprise Card */}
            <div className="mt-8 rounded-2xl bg-[#0A0F2C] text-white p-8 md:p-12 border border-[#1B2339] shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="md:w-1/2">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{ENTERPRISE_PLAN.name}</h3>
                <p className="text-gray-400 text-lg mb-8">{ENTERPRISE_PLAN.description}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact" className="px-8 py-3.5 bg-white text-[#0A0F2C] font-semibold rounded-lg hover:bg-gray-100 transition-colors text-center shadow-md">
                    Contact Sales
                  </Link>
                  <Link href="/book-demo" className="px-8 py-3.5 bg-transparent border border-gray-600 text-white font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-800/50 transition-colors text-center flex items-center justify-center">
                    Book a Demo <ArrowRight size={18} className="ml-2" />
                  </Link>
                </div>
              </div>
              <div className="md:w-5/12 bg-white/5 p-6 rounded-xl border border-white/10 w-full">
                <p className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Everything in Business, plus:</p>
                <ul className="space-y-3">
                  {ENTERPRISE_PLAN.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-300">
                      <Check size={18} className="text-blue-400 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Compare features in detail</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="w-1/3 py-4 pl-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Features</th>
                    <th className="w-1/6 py-4 text-center text-sm font-bold text-gray-900">Free</th>
                    <th className="w-1/6 py-4 text-center text-sm font-bold text-blue-600">Starter</th>
                    <th className="w-1/6 py-4 text-center text-sm font-bold text-gray-900">Business</th>
                    <th className="w-1/6 py-4 text-center text-sm font-bold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_FEATURES.map((section, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="bg-gray-100/50">
                        <td colSpan={5} className="py-3 pl-4 text-sm font-bold text-gray-900">{section.category}</td>
                      </tr>
                      {section.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-b border-gray-100 hover:bg-white transition-colors">
                          <td className="py-4 pl-4 text-sm text-gray-700 font-medium">{item.name}</td>
                          <td className="py-4 text-center">
                            {typeof item.free === 'boolean' ? (item.free ? <Check size={18} className="text-green-500 mx-auto" /> : <X size={18} className="text-gray-300 mx-auto" />) : <span className="text-sm text-gray-600">{item.free}</span>}
                          </td>
                          <td className="py-4 text-center bg-blue-50/30">
                            {typeof item.starter === 'boolean' ? (item.starter ? <Check size={18} className="text-green-500 mx-auto" /> : <X size={18} className="text-gray-300 mx-auto" />) : <span className="text-sm text-gray-600 font-medium">{item.starter}</span>}
                          </td>
                          <td className="py-4 text-center">
                            {typeof item.business === 'boolean' ? (item.business ? <Check size={18} className="text-green-500 mx-auto" /> : <X size={18} className="text-gray-300 mx-auto" />) : <span className="text-sm text-gray-600 font-medium">{item.business}</span>}
                          </td>
                          <td className="py-4 text-center">
                            {typeof item.enterprise === 'boolean' ? (item.enterprise ? <Check size={18} className="text-green-500 mx-auto" /> : <X size={18} className="text-gray-300 mx-auto" />) : <span className="text-sm text-gray-600 font-medium">{item.enterprise}</span>}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-500 text-lg">Have a question? We're here to help.</p>
            </div>
            
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 bg-white">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
                  >
                    <span className="font-semibold text-gray-900 text-lg pr-4">{faq.question}</span>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === idx ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                      {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out px-6 text-gray-600 leading-relaxed overflow-hidden ${
                      openFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <HelpCircle size={32} className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-6">Our support team is always ready to assist you with any inquiries.</p>
              <Link href="/contact" className="inline-flex font-semibold text-[#0052CC] hover:text-[#0047B3] hover:underline items-center">
                Contact Support <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
