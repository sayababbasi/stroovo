"use client";

// Phase 1 Components
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";

// Phase 2 Components
import ProductShowcaseSection from "@/components/landing/ProductShowcaseSection";
import AnalyticsSection from "@/components/landing/AnalyticsSection";
import CollaborationSection from "@/components/landing/CollaborationSection";
import GoalsSection from "@/components/landing/GoalsSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import SecuritySection from "@/components/landing/SecuritySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Global Background Illustration */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden bg-[#FAFBFC]">
         {/* Subtle Topographic/Grid SVG */}
         <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="landing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-grid)" />
         </svg>
      </div>

      <div className="relative z-10">
        <Navbar />
        <main className="relative">
          {/* Scattered Scrollable Background Effects */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[5%] right-[0%] w-[800px] h-[800px] bg-purple-300/20 rounded-full blur-[150px]"></div>
            <div className="absolute top-[15%] left-[-10%] w-[700px] h-[700px] bg-emerald-200/20 rounded-full blur-[150px]"></div>
            
            <div className="absolute top-[28%] right-[-5%] w-[900px] h-[900px] bg-blue-300/15 rounded-full blur-[150px]"></div>
            <div className="absolute top-[35%] left-[5%] w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[150px]"></div>
            
            <div className="absolute top-[48%] right-[10%] w-[800px] h-[800px] bg-fuchsia-300/15 rounded-full blur-[150px]"></div>
            <div className="absolute top-[55%] left-[-5%] w-[700px] h-[700px] bg-teal-200/20 rounded-full blur-[150px]"></div>
            
            <div className="absolute top-[70%] right-[-10%] w-[800px] h-[800px] bg-violet-300/20 rounded-full blur-[150px]"></div>
            <div className="absolute top-[82%] left-[10%] w-[600px] h-[600px] bg-orange-200/15 rounded-full blur-[150px]"></div>
            
            <div className="absolute bottom-[2%] left-[30%] w-[1000px] h-[1000px] bg-blue-300/20 rounded-full blur-[150px]"></div>
          </div>

          <div className="relative z-10">
            {/* Phase 1 Flow */}
        <HeroSection />
        <TrustedBySection />
        
        {/* Phase 2 Flow */}
        <ProductShowcaseSection />
        <AnalyticsSection />
        <CollaborationSection />
        <GoalsSection />
        <IntegrationsSection />
        <SecuritySection />
        <TestimonialsSection />
        <PricingSection />
          <FAQSection />
          <FinalCTASection />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
