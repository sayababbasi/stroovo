"use client";

import React from "react";
import MarketingLayout from "./MarketingLayout";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LegalLayout({ children, title, lastUpdated }: { children: React.ReactNode, title: string, lastUpdated: string }) {
  const pathname = usePathname();

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "GDPR Compliance", href: "/gdpr" },
  ];

  return (
    <MarketingLayout>
      <div className="bg-[#0A0F2C] py-20 px-6 border-b border-[#1B2339] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div>
        <div className="max-w-[1100px] mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">{title}</h1>
          <p className="text-gray-400 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-16 flex flex-col lg:flex-row gap-16 w-full">
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-[250px] shrink-0">
          <div className="sticky top-32">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Legal Directory</h3>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-12 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Questions?</h4>
              <p className="text-xs text-gray-500 mb-4">Contact our legal team for any inquiries regarding these policies.</p>
              <a href="mailto:legal@revotic.ai" className="text-sm text-blue-600 font-medium hover:underline">legal@revotic.ai</a>
            </div>
          </div>
        </aside>

        {/* Legal Content area */}
        <article className="flex-1 prose prose-blue prose-headings:text-gray-900 prose-a:text-blue-600 prose-p:text-gray-600 prose-li:text-gray-600 max-w-none">
          {children}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 italic">
              Stroovo is a product of Revotic AI. By using Stroovo, you are agreeing to the policies governed by Revotic AI.
            </p>
          </div>
        </article>
      </div>
    </MarketingLayout>
  );
}
