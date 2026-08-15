import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function MarketingPlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center bg-[#FAFBFC]">
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="placeholder-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#placeholder-grid)" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Enterprise Grade Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
            We are currently building and polishing the {title} experience to ensure it meets the rigorous standards of enterprise teams. 
          </p>
          
          <button className="px-8 py-3.5 rounded-lg bg-[#0052CC] hover:bg-[#0047B3] text-white font-semibold text-[15px] transition-all shadow-[0_8px_20px_rgb(0,82,204,0.3)]">
            Return to Homepage
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
