"use client";

import Link from "next/link";
import { CheckCircle2, Clock, CreditCard, XCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      desc: "Perfect for small teams getting started.",
      price: "$0",
      period: "Free forever",
      btnText: "Get Started Free",
      btnClass: "bg-white text-[#0052CC] border border-blue-200 hover:border-[#0052CC] hover:bg-blue-50",
      features: [
        "Up to 5 users",
        "3 projects",
        "Task & Project Management",
        "Team Collaboration",
        "Basic Reports",
        "Integrations (Limited)"
      ]
    },
    {
      name: "Professional",
      desc: "Ideal for growing teams and businesses.",
      price: "$9",
      period: "per user / month",
      btnText: "Start Free Trial",
      btnClass: "bg-white text-[#0052CC] border border-blue-200 hover:border-[#0052CC] hover:bg-blue-50",
      featuresPrefix: "Everything in Starter, plus:",
      features: [
        "Unlimited projects",
        "Advanced Reports",
        "Goals & OKRs",
        "Calendar & Scheduling",
        "Automations (10 / month)",
        "Integrations (Unlimited)"
      ]
    },
    {
      name: "Business",
      desc: "Best for teams that need more control.",
      price: "$19",
      period: "per user / month",
      popular: true,
      btnText: "Start Free Trial",
      btnClass: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-md",
      featuresPrefix: "Everything in Professional, plus:",
      features: [
        "Custom Roles & Permissions",
        "Advanced Automations",
        "Team Workloads",
        "Priority Support",
        "Audit Logs",
        "Single Sign-On (SSO)"
      ]
    },
    {
      name: "Enterprise",
      desc: "For large organizations with advanced needs.",
      price: "Custom",
      period: "Contact Sales",
      btnText: "Contact Sales",
      btnClass: "bg-white text-[#0052CC] border border-blue-200 hover:border-[#0052CC] hover:bg-blue-50",
      featuresPrefix: "Everything in Business, plus:",
      features: [
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Security",
        "Data Residency Options",
        "Unlimited Automations",
        "SLA & Uptime Guarantee"
      ]
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent border-t border-gray-100">
      <div className="max-w-[1300px] mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Choose the Plan That Fits Your Needs
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Start free and scale as your team grows.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
              className={`bg-white rounded-2xl p-8 flex flex-col border ${plan.popular ? 'border-blue-200 shadow-[0_8px_30px_rgb(0,82,204,0.12)] relative transform lg:-translate-y-2' : 'border-gray-100 shadow-sm hover:shadow-md transition-shadow'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-6 -translate-y-1/2">
                  <div className="bg-[#4C9AFF] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                    Most Popular
                  </div>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-[13px] text-gray-500 mb-6 h-10">{plan.desc}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <div className="text-[13px] text-gray-500 mt-1">{plan.period}</div>
              </div>
              
              <Link 
                href="/signup" 
                className={`w-full py-2.5 rounded-lg text-sm font-bold text-center transition-all mb-8 ${plan.btnClass}`}
              >
                {plan.btnText}
              </Link>
              
              <div className="flex-1 flex flex-col">
                {plan.featuresPrefix && (
                  <div className="text-[11px] font-bold text-gray-900 mb-4">{plan.featuresPrefix}</div>
                )}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[13px] text-gray-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Elements */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-[13px] font-medium">
            <Clock size={16} className="text-blue-500" />
            14-Day Free Trial
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[13px] font-medium">
            <CreditCard size={16} className="text-blue-500" />
            No Credit Card Required
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[13px] font-medium">
            <XCircle size={16} className="text-blue-500" />
            Cancel Anytime
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[13px] font-medium">
            <ShieldCheck size={16} className="text-blue-500" />
            30-Day Money Back Guarantee
          </div>
        </div>

      </div>
    </section>
  );
}

