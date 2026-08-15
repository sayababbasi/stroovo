"use client";

import React from "react";
import ResourceHubLayout from "@/components/landing/layouts/ResourceHubLayout";
import { Book, Code, Terminal, Zap, Users, Shield, Layout, Settings } from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  const categories = [
    { title: "Getting Started", icon: <Zap className="w-5 h-5" />, desc: "Quick start guides and basic concepts." },
    { title: "Workspace Management", icon: <Layout className="w-5 h-5" />, desc: "Organize your teams and projects." },
    { title: "Task Management", icon: <Book className="w-5 h-5" />, desc: "Create, assign, and track work." },
    { title: "Collaboration", icon: <Users className="w-5 h-5" />, desc: "Comments, mentions, and sharing." },
    { title: "Integrations", icon: <Code className="w-5 h-5" />, desc: "Connect with your favorite tools." },
    { title: "API Reference", icon: <Terminal className="w-5 h-5" />, desc: "Build custom integrations." },
    { title: "Security", icon: <Shield className="w-5 h-5" />, desc: "Data protection and compliance." },
    { title: "Administration", icon: <Settings className="w-5 h-5" />, desc: "Billing, SSO, and user management." },
  ];

  return (
    <ResourceHubLayout 
      title="Stroovo Documentation" 
      subtitle="Everything you need to know to build, manage, and scale your organization's workflows with Stroovo."
      placeholder="Search documentation (e.g., 'API keys', 'Permissions')..."
    >
      <div className="flex flex-col lg:flex-row gap-12 mt-8">
        
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[280px] shrink-0 hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Table of Contents</h3>
            <nav className="space-y-1">
              {["Introduction", "Quick Start", "Core Concepts", "Best Practices", "Troubleshooting", "Changelog"].map((item, i) => (
                <a key={i} href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-100">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Developers</h3>
               <nav className="space-y-1">
                 <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">REST API</a>
                 <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">Webhooks</a>
               </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore by Category</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <Link key={i} href="#" className="p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{cat.title}</h3>
                  <p className="text-sm text-gray-500">{cat.desc}</p>
                </Link>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gradient-to-br from-gray-900 to-[#0A0F2C] rounded-xl text-white">
              <h3 className="text-xl font-bold mb-2">Developer Documentation</h3>
              <p className="text-gray-300 text-sm mb-6 max-w-lg">
                Automate your workflows and build custom integrations using the Stroovo REST API.
              </p>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-gray-300 border border-white/10 mb-6">
                curl -X GET "https://api.stroovo.com/v1/projects" \<br/>
                &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
              </div>
              <Link href="#" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors">
                View API Reference
              </Link>
            </div>

          </div>
        </main>

      </div>
    </ResourceHubLayout>
  );
}
