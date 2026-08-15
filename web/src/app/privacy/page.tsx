import React from "react";
import LegalLayout from "@/components/landing/layouts/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="August 15, 2026">
      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p>
            Welcome to Stroovo, an enterprise work management platform operated by <strong>Revotic AI</strong> ("we," "our," or "us"). 
            We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about 
            this privacy notice, or our practices with regards to your personal information, please contact us at <a href="mailto:privacy@revotic.ai" className="text-blue-600 hover:underline">privacy@revotic.ai</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            We collect personal information that you voluntarily provide to us when you register on the Services, 
            express an interest in obtaining information about us or our products and Services, when you participate in activities on the 
            Services, or otherwise when you contact us.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, password, phone number, and company details.</li>
            <li><strong>Workspace Information:</strong> Project data, task details, team structures, and communications within the platform.</li>
            <li><strong>Usage Data:</strong> Log and usage data, device data, and location data collected automatically when you access the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Information</h2>
          <p className="mb-4">We use personal information collected via our Services for a variety of business purposes described below:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To provide and manage the Stroovo platform and related services.</li>
            <li>To respond to user inquiries and offer support.</li>
            <li>To enforce our terms, conditions, and policies for business purposes, to comply with legal and regulatory requirements.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Service Providers</h2>
          <p>
            We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf 
            and require access to such information to do that work. Examples include: payment processing, data analysis, email delivery, hosting services, 
            customer service, and marketing efforts. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
          <p>
            Revotic AI implements appropriate technical and organizational security measures designed to protect the security of any personal information we process. 
            However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology 
            can be guaranteed to be 100% secure.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Information</h2>
          <p>
            If you have questions or comments about this notice, you may email us at <a href="mailto:legal@revotic.ai" className="text-blue-600 hover:underline">legal@revotic.ai</a> or by post to:
          </p>
          <address className="mt-4 not-italic bg-gray-50 p-4 rounded-lg border border-gray-100">
            <strong>Revotic AI</strong><br />
            [Legal Company Address Placeholder]<br />
            [City, State, Zip Code]<br />
            [Country]
          </address>
        </section>
      </div>
    </LegalLayout>
  );
}
