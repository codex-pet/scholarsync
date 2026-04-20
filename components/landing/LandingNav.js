"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "mx-4 mt-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-indigo-100/40"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center shadow-indigo-200 group-hover:scale-105 transition-transform">
            <img
              src="/scholarsync-logo.png"
              alt="ScholarSync Logo"
              className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
            />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">ScholarSync</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Preview", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus-visible:text-indigo-600 outline-none"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA Buttons + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors px-4 py-2 rounded-xl hover:bg-indigo-50 outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:scale-105 transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Get Started <span className="ml-1 hidden sm:inline">→</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={`md:hidden absolute top-full left-4 right-4 mt-2 glass rounded-2xl p-4 transition-all duration-300 origin-top overflow-hidden z-50 ${isMobileMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}`}
      >
        <div className="flex flex-col gap-2">
          {["Features", "Preview", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
            >
              {item}
            </a>
          ))}
          <div className="h-px bg-slate-100 my-2" />
          <Link
            href="/login"
            className="px-4 py-3 text-sm font-bold text-indigo-600"
          >
            Login to Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
