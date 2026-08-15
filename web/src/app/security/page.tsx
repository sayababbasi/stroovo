import React from "react";
import LegalLayout from "@/components/landing/layouts/LegalLayout";
import { Shield, Lock, Server, Users, Eye } from "lucide-react";

export default function SecurityPage() {
  return (
    <LegalLayout title="Security at Stroovo" lastUpdated="August 15, 2026">
      <div className="space-y-10 text-gray-600 leading-relaxed">
        
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
          <div className="mt-1">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Enterprise-Grade Security by Revotic AI</h3>
            <p className="text-sm">
              Trust is the foundation of Stroovo. We employ rigorous security practices across our infrastructure, 
              applications, and personnel to ensure your organization's data remains safe, private, and available.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Server className="w-6 h-6 text-gray-400" />
            Infrastructure Security
          </h2>
          <p className="mb-4">
            Stroovo is hosted on secure, enterprise-grade cloud providers. Our physical infrastructure is hosted and 
            managed within secure data centers that meet stringent industry standards.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Network Isolation:</strong> Production networks are strictly segregated from testing and development environments.</li>
            <li><strong>DDoS Protection:</strong> Automated mitigation systems protect against distributed denial-of-service attacks.</li>
            <li><strong>Redundancy:</strong> Critical services are replicated across multiple availability zones to ensure high availability.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-gray-400" />
            Data Protection & Encryption
          </h2>
          <p className="mb-4">
            Protecting your data in transit and at rest is a top priority. We use modern encryption standards to secure 
            all customer payloads.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>In Transit:</strong> All communications between your client and our servers are encrypted via industry-standard TLS.</li>
            <li><strong>At Rest:</strong> Customer data and backups are encrypted at rest using AES-256 encryption.</li>
            <li><strong>Key Management:</strong> Encryption keys are managed securely via enterprise key management services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-400" />
            Authentication & Access Control
          </h2>
          <p className="mb-4">
            We provide robust mechanisms to ensure only authorized individuals can access your workspace data.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Role-Based Access Control (RBAC):</strong> Granular permissions allow workspace admins to control exactly what users can see and do.</li>
            <li><strong>Authentication:</strong> Secure JWT-based authentication mechanisms.</li>
            <li><strong>Internal Access:</strong> Revotic AI employee access to production systems is strictly limited, logged, and requires multi-factor authentication.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Eye className="w-6 h-6 text-gray-400" />
            Monitoring & Audit
          </h2>
          <p className="mb-4">
            Continuous monitoring ensures we detect and respond to potential security events rapidly.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Audit Logs:</strong> Comprehensive logging of security events, administrative actions, and access attempts.</li>
            <li><strong>24/7 Monitoring:</strong> Automated alerting systems notify our engineering teams of suspicious activities.</li>
            <li><strong>Incident Response:</strong> Dedicated incident response protocols to handle potential security events safely and transparently.</li>
          </ul>
        </section>
        
        <section className="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-8">
          <h3 className="font-bold text-gray-900 mb-2">Certifications & Compliance</h3>
          <p className="text-sm text-gray-600 mb-4">
            Stroovo operates within the stringent compliance frameworks established by Revotic AI. 
            For specific information regarding SOC 2, ISO 27001, or penetration testing reports, please contact our security team.
          </p>
          <p className="text-sm font-medium">
            Certification status: <a href="mailto:security@revotic.ai" className="text-blue-600 hover:underline">Contact us</a>
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
