"use client";

import React from "react";
import ResourceHubLayout from "@/components/landing/layouts/ResourceHubLayout";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function BlogPage() {
  const articles = [
    {
      title: "The Future of Asynchronous Collaboration in Enterprise",
      category: "Productivity",
      excerpt: "How top engineering and product teams are moving away from endless meetings and adopting asynchronous workflows.",
      author: "Sarah Jenkins",
      date: "Aug 12, 2026",
      readTime: "5 min read",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Stroovo 2.0: Introducing AI-Powered Goal Tracking",
      category: "Product",
      excerpt: "We're thrilled to announce the next generation of Stroovo. See how our new AI features help your team hit their OKRs faster.",
      author: "Revotic AI Team",
      date: "Aug 05, 2026",
      readTime: "8 min read",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Best Practices for Managing Remote Engineering Teams",
      category: "Leadership",
      excerpt: "Building culture, maintaining velocity, and preventing burnout when your team is distributed across five timezones.",
      author: "David Chen",
      date: "Jul 28, 2026",
      readTime: "6 min read",
      color: "bg-emerald-100 text-emerald-700"
    },
    {
      title: "How to run effective Sprint Planning with Stroovo",
      category: "Guides",
      excerpt: "A step-by-step guide to setting up your workspace for agile methodologies and sprint tracking.",
      author: "Elena Rodriguez",
      date: "Jul 15, 2026",
      readTime: "10 min read",
      color: "bg-amber-100 text-amber-700"
    },
    {
      title: "Security First: Our Approach to Enterprise Data",
      category: "Company",
      excerpt: "An inside look at how the Revotic AI infrastructure team protects millions of daily tasks and communications.",
      author: "Marcus Thorne",
      date: "Jul 02, 2026",
      readTime: "7 min read",
      color: "bg-gray-200 text-gray-800"
    },
    {
      title: "10 Templates to Jumpstart Your Marketing Campaigns",
      category: "Productivity",
      excerpt: "Stop starting from scratch. Grab these pre-built Stroovo templates and launch your next campaign flawlessly.",
      author: "Sarah Jenkins",
      date: "Jun 20, 2026",
      readTime: "4 min read",
      color: "bg-blue-100 text-blue-700"
    }
  ];

  return (
    <ResourceHubLayout 
      title="Stroovo Blog" 
      subtitle="Insights, updates, and best practices for building the future of work."
      placeholder="Search articles..."
    >
      <div className="mt-8">
        
        {/* Featured Article */}
        <Link href="#" className="block group mb-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-gray-100 h-64 md:h-auto relative overflow-hidden">
               {/* Placeholder for featured image */}
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 group-hover:scale-105 transition-transform duration-700"></div>
               <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
               </div>
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 w-max">Featured</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Why Your Company Needs a Centralized Truth for Work</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Information silos destroy productivity. Discover how consolidating your tools into a single platform like Stroovo can save your enterprise thousands of hours per year.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-medium text-gray-900">Revotic AI Team</span>
                <span>•</span>
                <span>Aug 14, 2026</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <Link key={i} href="#" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-max ${article.color}`}>
                {article.category}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{article.title}</h3>
              <p className="text-gray-600 text-sm mb-6 flex-1">{article.excerpt}</p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 mt-auto">
                <span className="font-medium text-gray-900">{article.author}</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
            Load More Articles
          </button>
        </div>

      </div>
    </ResourceHubLayout>
  );
}
