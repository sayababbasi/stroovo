"use client";

import React from "react";
import ResourceHubLayout from "@/components/landing/layouts/ResourceHubLayout";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <ResourceHubLayout
      title="Our Story"
      description="Learn about our journey to build the ultimate work management platform."
    >
      <div className="max-w-4xl mx-auto py-20 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            We are currently building this page. Check back soon for exciting updates and detailed information about Our Story.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="px-6 py-3 bg-[#0052CC] hover:bg-[#0047B3] text-white font-medium rounded-lg transition-colors">
              Back to Home
            </Link>
            <Link href="/contact" className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </ResourceHubLayout>
  );
}
