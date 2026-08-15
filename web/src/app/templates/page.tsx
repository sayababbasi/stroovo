"use client";

import React from "react";
import ResourceHubLayout from "@/components/landing/layouts/ResourceHubLayout";
import Link from "next/link";
import { LayoutTemplate, ArrowRight } from "lucide-react";

export default function TemplatesPage() {
  const templates = [
    { title: "Product Roadmap", category: "Product Development", useCase: "Planning", color: "bg-blue-500" },
    { title: "Marketing Campaign", category: "Marketing", useCase: "Execution", color: "bg-pink-500" },
    { title: "Sprint Planning", category: "Engineering", useCase: "Agile", color: "bg-emerald-500" },
    { title: "Employee Onboarding", category: "HR", useCase: "Operations", color: "bg-purple-500" },
    { title: "Sales Pipeline", category: "Sales", useCase: "Tracking", color: "bg-amber-500" },
    { title: "Company OKRs", category: "Enterprise", useCase: "Strategy", color: "bg-gray-800" },
    { title: "Content Calendar", category: "Marketing", useCase: "Planning", color: "bg-rose-500" },
    { title: "Bug Tracking", category: "Engineering", useCase: "Support", color: "bg-red-500" },
    { title: "Event Management", category: "Operations", useCase: "Planning", color: "bg-cyan-500" }
  ];

  return (
    <ResourceHubLayout 
      title="Template Library" 
      subtitle="Don't start from scratch. Use our pre-built templates to hit the ground running."
      placeholder="Search templates (e.g., 'Marketing', 'Sprint')..."
    >
      <div className="flex flex-col lg:flex-row gap-10 mt-8">
        
        {/* Categories Sidebar */}
        <aside className="w-full lg:w-[220px] shrink-0">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</h3>
          <nav className="flex flex-col gap-1">
            {["All Templates", "Project Management", "Product Development", "Marketing", "Engineering", "HR", "Sales", "Enterprise"].map((cat, i) => (
              <button key={i} className={`text-left px-3 py-2 text-sm rounded-md transition-colors ${i === 0 ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Templates Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((tpl, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col">
              <div className={`h-32 w-full ${tpl.color} relative overflow-hidden flex items-center justify-center`}>
                 <div className="absolute inset-0 bg-black/10"></div>
                 <LayoutTemplate className="w-12 h-12 text-white/50" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{tpl.category}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{tpl.title}</h3>
                <p className="text-sm text-gray-500 mb-6">Perfect for {tpl.useCase.toLowerCase()} workflows.</p>
                
                <Link href="/signup" className="mt-auto w-full py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm text-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors flex items-center justify-center gap-2">
                  Use Template
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ResourceHubLayout>
  );
}
