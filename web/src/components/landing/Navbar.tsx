"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { NAVIGATION_CONFIG } from "@/config/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll for sticky nav styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicking outside to close mega menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMenuOpen(false);
  }, [pathname]);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) setActiveDropdown(null);
    else setActiveDropdown(name);
  };

  const isActive = (path: string) => pathname.startsWith(path);

  const MegaMenu = ({ config, name }: { config: any, name: string }) => {
    const isOpen = activeDropdown === name;
    
    return (
      <div className="group relative">
        <button 
          onClick={() => toggleDropdown(name)}
          className={`flex items-center font-medium text-[15px] transition-colors py-2 focus:outline-none ${
            isOpen || (name === 'Product' && isActive('/product')) || (name === 'Solutions' && isActive('/solutions')) || (name === 'Resources' && isActive('/resources')) || (name === 'Company' && (isActive('/about') || isActive('/story') || isActive('/careers') || isActive('/contact') || isActive('/partners') || isActive('/revotic-ai'))) 
              ? "text-blue-600" 
              : "text-gray-700 hover:text-blue-600"
          }`}
          aria-expanded={isOpen}
        >
          {name} 
          <ChevronDown 
            size={14} 
            className={`ml-1 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-600" : "opacity-60"}`} 
          />
        </button>

        {/* Mega Menu Dropdown */}
        <div 
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white border border-gray-100 rounded-2xl shadow-xl transition-all duration-200 origin-top ${
            isOpen ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-95 invisible -translate-y-2"
          }`}
          style={{ width: 'max-content', maxWidth: '900px' }}
        >
          {/* Invisible padding area to prevent hover gap issues if we used hover instead of click */}
          <div className="absolute -top-4 left-0 w-full h-4"></div>
          
          <div className="p-6">
            <div className={`grid gap-x-8 gap-y-6 ${config.length === 4 ? 'grid-cols-4' : config.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {config.map((section: any, idx: number) => (
                <div key={idx} className="flex flex-col">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                    {section.title}
                  </h3>
                  <div className="flex flex-col space-y-1">
                    {section.items.map((item: any, itemIdx: number) => {
                      const Icon = item.icon;
                      return (
                        <Link 
                          key={itemIdx} 
                          href={item.href}
                          className="flex items-start p-2 rounded-lg hover:bg-blue-50 transition-colors group/item"
                        >
                          <div className="mt-0.5 mr-3 p-1.5 rounded-md bg-white border border-gray-100 text-gray-500 group-hover/item:text-blue-600 group-hover/item:border-blue-100 shadow-sm transition-colors">
                            <Icon size={16} strokeWidth={2.5} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm group-hover/item:text-blue-700 transition-colors">
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Optional Bottom Banner for Mega Menus */}
            {name === 'Product' && (
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between px-2">
                <div className="flex items-center text-sm">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full mr-2">New</span>
                  <span className="text-gray-600">Stroovo AI Copilot is now available.</span>
                </div>
                <Link href="/ai/assistant" className="text-sm font-semibold text-blue-600 flex items-center hover:text-blue-700 group/link">
                  Learn more <ArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const MobileAccordion = ({ name, config }: { name: string, config: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="border-b border-gray-50 last:border-0">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full py-3 text-lg font-medium text-gray-800"
        >
          {name}
          <ChevronDown size={18} className={`transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[800px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
          <div className="flex flex-col space-y-4 pl-2 pt-2">
            {config.map((section: any, idx: number) => (
              <div key={idx}>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{section.title}</div>
                <div className="flex flex-col space-y-3 pl-2">
                  {section.items.map((item: any, i: number) => {
                    const Icon = item.icon;
                    return (
                      <Link key={i} href={item.href} className="flex items-center text-gray-600 hover:text-blue-600">
                        <Icon size={16} className="mr-3 opacity-70" />
                        <span className="text-[15px] font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav
      ref={dropdownRef}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-white py-5"
      }`}
    >
      <div className="max-w-[1300px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center" onClick={() => setActiveDropdown(null)}>
          <div className="relative w-[112px] h-[36px]">
            <Image
              src="/logo.png"
              alt="Stroovo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Center: Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-8">
          <MegaMenu name="Product" config={NAVIGATION_CONFIG.product} />
          <MegaMenu name="Solutions" config={NAVIGATION_CONFIG.solutions} />
          <MegaMenu name="Resources" config={NAVIGATION_CONFIG.resources} />

          <Link 
            href="/customers" 
            className={`font-medium text-[15px] transition-colors ${isActive('/customers') ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
          >
            Customers
          </Link>

          <MegaMenu name="Company" config={NAVIGATION_CONFIG.company} />

          <Link 
            href="/pricing" 
            className={`font-medium text-[15px] transition-colors ${isActive('/pricing') ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
          >
            Pricing
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium text-[15px] px-2 transition-colors">
            Log in
          </Link>
          <Link
            href="/book-demo"
            className="text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold text-[14px] px-4 py-2.5 rounded-lg transition-colors"
          >
            Book a Demo
          </Link>
          <Link
            href="/signup"
            className="bg-[#0052CC] hover:bg-[#0047B3] text-white font-semibold text-[14px] px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-600 hover:text-gray-900 p-2 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 origin-top ${
          menuOpen ? "max-h-[100vh] opacity-100 visible" : "max-h-0 opacity-0 invisible"
        }`}
      >
        <div className="py-2 px-6 overflow-y-auto max-h-[calc(100vh-80px)] pb-10">
          
          <MobileAccordion name="Product" config={NAVIGATION_CONFIG.product} />
          <MobileAccordion name="Solutions" config={NAVIGATION_CONFIG.solutions} />
          <MobileAccordion name="Resources" config={NAVIGATION_CONFIG.resources} />
          
          <div className="border-b border-gray-50 py-3">
            <Link href="/customers" className="block text-lg font-medium text-gray-800">
              Customers
            </Link>
          </div>
          
          <MobileAccordion name="Company" config={NAVIGATION_CONFIG.company} />
          
          <div className="border-b border-gray-50 py-3">
            <Link href="/pricing" className="block text-lg font-medium text-gray-800">
              Pricing
            </Link>
          </div>

          <div className="flex flex-col space-y-3 pt-6 pb-4">
            <Link href="/login" className="text-center text-gray-700 font-medium text-[16px] py-2">
              Log in
            </Link>
            <Link href="/book-demo" className="text-center text-gray-700 border border-gray-200 font-semibold text-[15px] px-4 py-3 rounded-lg w-full">
              Book a Demo
            </Link>
            <Link href="/signup" className="text-center bg-[#0052CC] text-white font-semibold text-[15px] px-4 py-3 rounded-lg w-full shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
