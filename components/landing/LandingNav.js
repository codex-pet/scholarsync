"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

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
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors px-4 py-2 rounded-xl hover:bg-indigo-50"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:scale-105 transition-all"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </nav>
  );
}
