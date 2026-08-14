import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Github, Youtube, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A0F2C] border-t border-[#1B2339] pt-20 pb-10">
      <div className="max-w-[1300px] mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
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
              <Link href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </Link>
              <Link href="#" className="hover:text-white transition-colors" aria-label="X (Twitter)">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </Link>
              <Link href="#" className="hover:text-white transition-colors" aria-label="YouTube">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-bold text-[14px] mb-6">Product</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Features</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Roadmap</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Changelog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-[14px] mb-6">Solutions</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Project Management</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Team Collaboration</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Task Management</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Goal Tracking</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Enterprise</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-[14px] mb-6">Resources</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Guides</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-[14px] mb-6">Company</h4>
            <ul className="flex flex-col gap-4 mb-8">
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Partners</Link></li>
            </ul>
            <h4 className="text-white font-bold text-[14px] mb-4">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">Security</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-[14px] transition-colors">GDPR</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1B2339] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-[13px]">
            &copy; 2026 Stroovo. All rights reserved.
          </p>
          <div className="flex items-center text-gray-500 text-[13px]">
            Made with <Heart size={14} className="text-rose-500 mx-1.5 fill-rose-500" /> by Revotic AI Team
          </div>
        </div>

      </div>
    </footer>
  );
}

