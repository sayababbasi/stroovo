import React from "react";
import LegalLayout from "@/components/landing/layouts/LegalLayout";

export default function GDPRPage() {
  return (
    <LegalLayout title="GDPR Compliance" lastUpdated="August 15, 2026">
      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Commitment to Privacy</h2>
          <p>
            At Stroovo, operated by <strong>Revotic AI</strong>, we are committed to protecting the privacy and security of our users' data. 
            We fully support the principles of the General Data Protection Regulation (GDPR) and ensure that our platform provides you 
            with the tools necessary to meet your compliance obligations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data Controller vs. Data Processor</h2>
          <p className="mb-4">
            Under the GDPR, organizations interact with data in two primary capacities:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Data Controller:</strong> For the personal data of individuals who register directly for our services (e.g., account administrators), Revotic AI acts as the Data Controller.</li>
            <li><strong>Data Processor:</strong> For the data uploaded, managed, and shared within your Stroovo workspace, your organization is the Data Controller, and Revotic AI acts as the Data Processor.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Subject Rights</h2>
          <p className="mb-4">
            If you are a resident of the European Economic Area (EEA), you have the following data protection rights:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right of Access:</strong> You can request access to the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You can request that we correct any inaccurate or incomplete personal data.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request the deletion of your personal data, subject to certain legal exceptions.</li>
            <li><strong>Right to Portability:</strong> You can request a copy of your data in a structured, machine-readable format.</li>
            <li><strong>Right to Restrict or Object:</strong> You can object to our processing of your personal data or request that we restrict it.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. International Data Transfers</h2>
          <p>
            Revotic AI may process data outside of the EEA. When we transfer personal data internationally, we ensure that appropriate 
            safeguards, such as Standard Contractual Clauses (SCCs), are in place to guarantee that your data receives the same level 
            of protection as it would within the EEA.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subprocessors</h2>
          <p>
            To provide the Stroovo platform, Revotic AI engages third-party subprocessors (e.g., cloud hosting providers). We ensure that 
            all subprocessors adhere to strict data processing agreements that comply with GDPR requirements. A full list of our authorized 
            subprocessors is available upon request.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Exercise Your Rights</h2>
          <p>
            To exercise any of your GDPR rights, or if you have questions regarding our data practices, please contact our Data Protection Officer at:
          </p>
          <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
            <p className="font-medium text-gray-900">Email:</p>
            <a href="mailto:privacy@revotic.ai" className="text-blue-600 hover:underline">privacy@revotic.ai</a>
            <p className="font-medium text-gray-900 mt-3">Subject:</p>
            <p>GDPR Data Request</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
