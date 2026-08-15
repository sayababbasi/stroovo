"use client";

import React from "react";
import ResourceHubLayout from "@/components/landing/layouts/ResourceHubLayout";
import { MessageCircle, FileText, LifeBuoy, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HelpCenterPage() {
  const faqs = [
    { q: "How do I invite team members?", a: "Navigate to Workspace Settings > Members and click 'Invite Member'. You can assign roles during the invitation process." },
    { q: "Can I integrate with Slack?", a: "Yes, our Slack integration is available on all plans. Go to Integrations in your workspace settings to connect." },
    { q: "How does billing work?", a: "Stroovo charges per active user. You are billed monthly or annually depending on your subscription." },
    { q: "Is there a limit to projects?", a: "No, all paid enterprise plans include unlimited projects and tasks." },
    { q: "How do I export my data?", a: "Workspace administrators can export all workspace data in CSV or JSON format from the Security settings." },
    { q: "Do you offer SSO?", a: "Yes, SAML SSO is available on our Enterprise plan. Contact sales to enable it." }
  ];

  return (
    <ResourceHubLayout 
      title="How can we help?" 
      subtitle="Search our knowledge base or get in touch with our support team."
      placeholder="Search for articles, guides, or troubleshooting..."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-16">
        <Link href="/docs" className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all text-center group">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Read the Docs</h3>
          <p className="text-sm text-gray-500">Comprehensive guides and API reference for developers.</p>
        </Link>
        <Link href="/contact" className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all text-center group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Contact Support</h3>
          <p className="text-sm text-gray-500">Get in touch with our dedicated support team.</p>
        </Link>
        <Link href="/blog" className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all text-center group">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Community & Blog</h3>
          <p className="text-sm text-gray-500">Read updates, best practices, and release notes.</p>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {faqs.map((faq, i) => (
            <div key={i}>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">{faq.q}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-500 mb-4">Can't find what you're looking for?</p>
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg text-sm transition-colors group">
            Open a Support Ticket
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </ResourceHubLayout>
  );
}
