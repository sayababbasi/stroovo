"use client";

import React from "react";
import ResourceHubLayout from "@/components/landing/layouts/ResourceHubLayout";
import { BookOpen, Target, Settings, Zap } from "lucide-react";
import Link from "next/link";

export default function GuidesPage() {
  const guides = [
    {
      title: "Getting Started with Stroovo",
      description: "Learn the core concepts of workspaces, projects, and tasks to get your team up and running in minutes.",
      difficulty: "Beginner",
      time: "10 min",
      icon: <Zap className="w-6 h-6 text-yellow-500" />
    },
    {
      title: "Building Your First Team Workspace",
      description: "A comprehensive guide to structuring your workspace for cross-functional collaboration.",
      difficulty: "Beginner",
      time: "15 min",
      icon: <BookOpen className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Managing Projects Efficiently",
      description: "Advanced techniques for using timelines, dependencies, and custom fields to keep projects on track.",
      difficulty: "Intermediate",
      time: "20 min",
      icon: <Target className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "Creating Effective Goals (OKRs)",
      description: "How to map your company OKRs directly to daily tasks using Stroovo's Goal Tracking module.",
      difficulty: "Intermediate",
      time: "25 min",
      icon: <Target className="w-6 h-6 text-purple-500" />
    },
    {
      title: "Enterprise Workspace Setup",
      description: "Architecting a secure, scalable workspace for 1,000+ employees with SSO and RBAC.",
      difficulty: "Advanced",
      time: "30 min",
      icon: <Settings className="w-6 h-6 text-gray-700" />
    },
    {
      title: "Automating Team Workflows",
      description: "Using Stroovo Automations to eliminate repetitive tasks and streamline handoffs.",
      difficulty: "Advanced",
      time: "25 min",
      icon: <Zap className="w-6 h-6 text-rose-500" />
    }
  ];

  return (
    <ResourceHubLayout 
      title="Learning Center" 
      subtitle="Master Stroovo with step-by-step guides designed for your workflow."
      placeholder="Search guides (e.g., 'OKRs', 'Automations')..."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {guides.map((guide, i) => (
          <Link key={i} href="#" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {guide.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{guide.title}</h3>
            <p className="text-gray-600 text-sm mb-6 flex-1">{guide.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-medium">
              <span className={`px-2.5 py-1 rounded-md ${
                guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' : 
                guide.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 
                'bg-purple-100 text-purple-700'
              }`}>
                {guide.difficulty}
              </span>
              <span className="text-gray-500">{guide.time} read</span>
            </div>
          </Link>
        ))}
      </div>
    </ResourceHubLayout>
  );
}
