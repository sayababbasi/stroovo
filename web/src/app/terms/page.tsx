import React from "react";
import LegalLayout from "@/components/landing/layouts/LegalLayout";

export default function TermsOfServicePage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="August 15, 2026">
      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Stroovo work management platform ("Service"), provided by <strong>Revotic AI</strong> ("we", "us", or "our"), 
            you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration and Workspace Usage</h2>
          <p className="mb-4">
            You must register for an account to use the Service. You are responsible for safeguarding the password that you use to access the Service 
            and for any activities or actions under your password.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide accurate and complete information upon registration.</li>
            <li>You may not use as a username the name of another person or entity that is not lawfully available for use.</li>
            <li>Workspace administrators are responsible for the actions of their invited team members.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Acceptable Use and Responsibilities</h2>
          <p className="mb-4">You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate any national or international law or regulation.</li>
            <li>Infringe upon the rights of others, including intellectual property rights.</li>
            <li>Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, or otherwise objectionable.</li>
            <li>Attempt to interfere with or compromise the system integrity or security.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive 
            property of Revotic AI and its licensors. Stroovo is a trademark of Revotic AI. Our trademarks and trade dress may not be used in connection 
            with any product or service without the prior written consent of Revotic AI.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Customer Content</h2>
          <p>
            You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for 
            protecting those rights. By posting Content using the Service, you grant us the right and license to use, modify, perform, display, 
            reproduce, and distribute such Content solely for the purpose of providing the Service to you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
          <p>
            In no event shall Revotic AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
            incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
            intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of [Jurisdiction Placeholder], without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
