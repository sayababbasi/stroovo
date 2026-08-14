"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Stroovo?",
      answer: "Stroovo is an all-in-one enterprise work management platform designed to help teams plan, collaborate, and execute their work efficiently. It combines projects, tasks, goals, communication, and reporting into a single secure workspace."
    },
    {
      question: "Who is Stroovo for?",
      answer: "Stroovo is built for teams of all sizes, from fast-growing startups to large enterprise organizations. It's especially powerful for cross-functional teams across engineering, product, marketing, and operations."
    },
    {
      question: "Can I start for free?",
      answer: "Yes! Our Starter plan is completely free forever for up to 5 users. It includes essential task and project management features to help your team get organized."
    },
    {
      question: "Can I upgrade my plan later?",
      answer: "Absolutely. You can upgrade from Starter to Professional or Business at any time. We prorate your billing so you only pay for the exact time you spend on the new plan."
    },
    {
      question: "Does Stroovo support roles and permissions?",
      answer: "Yes, our Business and Enterprise plans include advanced custom roles and granular permissions, ensuring that users only have access to the information and controls they need."
    },
    {
      question: "Can Stroovo integrate with other tools?",
      answer: "Stroovo integrates seamlessly with dozens of popular tools including Slack, Microsoft Teams, Google Workspace, GitHub, and Jira, allowing you to centralize your workflow without abandoning your existing stack."
    },
    {
      question: "Is Stroovo suitable for enterprise organizations?",
      answer: "Yes. Our Enterprise tier includes advanced security controls, dedicated support, audit logs, Single Sign-On (SSO), data residency options, and reliable SLAs designed specifically for large organizations."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, there are no long-term commitments for our self-serve plans. You can cancel your subscription at any time from your billing settings."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-transparent border-t border-gray-100">
      <div className="max-w-[800px] mx-auto px-6">
        
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-500">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index} 
                className={`border rounded-xl transition-colors duration-200 ${isOpen ? 'border-[#0052CC] bg-blue-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052CC] focus-visible:ring-offset-2 rounded-xl"
                  aria-expanded={isOpen}
                >
                  <span className={`text-[15px] font-bold ${isOpen ? 'text-[#0052CC]' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  <ChevronDown 
                    size={20} 
                    className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0052CC]' : 'text-gray-400'}`} 
                  />
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-5 pt-0 text-[14px] leading-relaxed text-gray-600">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}

