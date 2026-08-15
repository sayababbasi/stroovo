"use client";

import React from "react";
import MarketingLayout from "./MarketingLayout";
import { Search } from "lucide-react";

export default function ResourceHubLayout({ 
  children, 
  title, 
  subtitle,
  placeholder = "Search resources..."
}: { 
  children: React.ReactNode, 
  title: string, 
  subtitle: string,
  placeholder?: string
}) {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <div className="bg-[#0A0F2C] pt-24 pb-32 px-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#0052CC] opacity-20 rounded-full blur-[100px] transform -translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">{title}</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-11 pr-4 py-4 rounded-xl border-0 ring-1 ring-white/10 bg-white/5 backdrop-blur-md text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 sm:text-base transition-all" 
              placeholder={placeholder}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area (Pulled up over the hero slightly) */}
      <div className="max-w-[1300px] mx-auto px-6 relative z-20 -mt-16 mb-24 w-full">
        {children}
      </div>
    </MarketingLayout>
  );
}
