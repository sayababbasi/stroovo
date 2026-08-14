"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle scroll for sticky nav styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-white py-5"
      }`}
    >
      <div className="max-w-[1300px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center">
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
          <div className="group relative">
            <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-[15px] transition-colors">
              Product <ChevronDown size={14} className="ml-1 opacity-60" />
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Overview</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Projects</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Tasks</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Goals</a>
            </div>
          </div>

          <div className="group relative">
            <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-[15px] transition-colors">
              Solutions <ChevronDown size={14} className="ml-1 opacity-60" />
            </button>
          </div>

          <div className="group relative">
            <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-[15px] transition-colors">
              Resources <ChevronDown size={14} className="ml-1 opacity-60" />
            </button>
          </div>

          <Link href="#" className="text-gray-700 hover:text-blue-600 font-medium text-[15px] transition-colors">
            Customers
          </Link>

          <div className="group relative">
            <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-[15px] transition-colors">
              Company <ChevronDown size={14} className="ml-1 opacity-60" />
            </button>
          </div>

          <Link href="#" className="text-gray-700 hover:text-blue-600 font-medium text-[15px] transition-colors">
            Pricing
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium text-[15px] px-2 transition-colors">
            Log in
          </Link>
          <Link
            href="#"
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
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 px-6 flex flex-col space-y-4">
          <Link href="#" className="text-gray-700 font-medium text-lg border-b border-gray-50 pb-2">Product</Link>
          <Link href="#" className="text-gray-700 font-medium text-lg border-b border-gray-50 pb-2">Solutions</Link>
          <Link href="#" className="text-gray-700 font-medium text-lg border-b border-gray-50 pb-2">Resources</Link>
          <Link href="#" className="text-gray-700 font-medium text-lg border-b border-gray-50 pb-2">Customers</Link>
          <Link href="#" className="text-gray-700 font-medium text-lg border-b border-gray-50 pb-2">Company</Link>
          <Link href="#" className="text-gray-700 font-medium text-lg pb-2">Pricing</Link>
          <div className="flex flex-col space-y-3 pt-2">
            <Link href="/login" className="text-center text-gray-700 font-medium text-[16px] py-2">Log in</Link>
            <Link href="#" className="text-center text-gray-700 border border-gray-200 font-semibold text-[15px] px-4 py-3 rounded-lg w-full">Book a Demo</Link>
            <Link href="/signup" className="text-center bg-[#0052CC] text-white font-semibold text-[15px] px-4 py-3 rounded-lg w-full shadow-sm">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

