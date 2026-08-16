import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Github, Youtube, Heart } from "lucide-react";
import { NAVIGATION_CONFIG } from "@/config/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Helper to extract a flat list of links for a section (up to a limit)
  const getFooterLinks = (configSection: any[], limit = 6) => {
    return configSection.flatMap(section => section.items).slice(0, limit);
  };

  const productLinks = getFooterLinks(NAVIGATION_CONFIG.product);
  const solutionsLinks = getFooterLinks(NAVIGATION_CONFIG.solutions);
  const resourcesLinks = getFooterLinks(NAVIGATION_CONFIG.resources);
  const companyLinks = getFooterLinks(NAVIGATION_CONFIG.company);

  return (
    <footer className="bg-[#0A0F2C] border-t border-[#1B2339] pt-20 pb-10">
      <div className="max-w-[1300px] mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link prefetch={false} href="/" className="inline-block mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
              <div className="relative w-[112px] h-[36px]">
                <Image
                  src="/logo.png"
                  alt="Stroovo"
                  fill
                  className="object-contain object-left brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-gray-400 text-[14px] leading-relaxed mb-8 max-w-[280px]">
              The all-in-one work management platform built for modern teams.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="https://linkedin.com/company/revotic-ai" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Visit Stroovo on LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://x.com/revotic_ai" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Visit Stroovo on X (Twitter)">
                <Twitter size={20} />
              </a>
              <a href="https://github.com/sayababbasi/stroovo" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Visit Stroovo on GitHub">
                <Github size={20} />
              </a>
              <a href="https://youtube.com/@revotic-ai" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Visit Stroovo on YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-bold text-[14px] mb-6">Product</h4>
            <ul className="flex flex-col gap-3">
              {productLinks.map((link, idx) => (
                <li key={idx}>
                  <Link prefetch={false} href={link.href} className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li><Link prefetch={false} href="/pricing" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-[14px] mb-6">Solutions</h4>
            <ul className="flex flex-col gap-3">
              {solutionsLinks.map((link, idx) => (
                <li key={idx}>
                  <Link prefetch={false} href={link.href} className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-[14px] mb-6">Resources</h4>
            <ul className="flex flex-col gap-3">
              {resourcesLinks.map((link, idx) => (
                <li key={idx}>
                  <Link prefetch={false} href={link.href} className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-[14px] mb-6">Company</h4>
            <ul className="flex flex-col gap-4 mb-8">
              {companyLinks.map((link, idx) => (
                <li key={idx}>
                  <Link prefetch={false} href={link.href} className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-bold text-[14px] mb-4">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li><Link prefetch={false} href="/privacy" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">Privacy Policy</Link></li>
              <li><Link prefetch={false} href="/terms" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">Terms of Service</Link></li>
              <li><Link prefetch={false} href="/security" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">Security</Link></li>
              <li><Link prefetch={false} href="/gdpr" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block text-[14px] transition-all focus:outline-none focus-visible:text-white focus-visible:underline">GDPR</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1B2339] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-[13px]">
            &copy; {currentYear} Stroovo. All rights reserved.
          </p>
          <div className="flex items-center text-gray-500 text-[13px]">
            Made with <Heart size={14} className="text-rose-500 mx-1.5 fill-rose-500" aria-label="love" /> by 
            <a href="https://revotic.ai" target="_blank" rel="noopener noreferrer" className="ml-1 text-gray-400 hover:text-white hover:underline transition-colors focus:outline-none focus-visible:text-white">
              Revotic AI Team
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
