import dynamic from 'next/dynamic';

// Phase 1 Components (Above the fold - load immediately)
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import Footer from "@/components/landing/Footer";

// Phase 2 Components (Below the fold - lazy load for speed)
const ProductShowcaseSection = dynamic(() => import("@/components/landing/ProductShowcaseSection"));
const AnalyticsSection = dynamic(() => import("@/components/landing/AnalyticsSection"));
const CollaborationSection = dynamic(() => import("@/components/landing/CollaborationSection"));
const GoalsSection = dynamic(() => import("@/components/landing/GoalsSection"));
const IntegrationsSection = dynamic(() => import("@/components/landing/IntegrationsSection"));
const SecuritySection = dynamic(() => import("@/components/landing/SecuritySection"));
const TestimonialsSection = dynamic(() => import("@/components/landing/TestimonialsSection"));
const PricingSection = dynamic(() => import("@/components/landing/PricingSection"));
const FAQSection = dynamic(() => import("@/components/landing/FAQSection"));
const FinalCTASection = dynamic(() => import("@/components/landing/FinalCTASection"));

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
            
            {/* Phase 2 Flow (Lazy Loaded for Speed) */}
            <ProductShowcaseSection />
            <TestimonialsSection />
            <PricingSection />
            
            <AnalyticsSection />
            <CollaborationSection />
            <GoalsSection />
            <IntegrationsSection />
            <SecuritySection />
            
            <FAQSection />
            <FinalCTASection />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
