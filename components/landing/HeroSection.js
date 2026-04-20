"use client";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-indigo-300/50 to-purple-300/30 rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-pink-300/40 to-rose-200/30 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] bg-gradient-to-br from-cyan-200/30 to-blue-300/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "3s" }} />
      </div>

      <div className="max-w-5xl mx-auto text-center space-y-8 pt-20 lg:pt-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping inline-block" aria-hidden="true" />
          AI-Powered Study Assistant — Now Available
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
          Sync Your Learning
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            with ScholarSync
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          All-in-one AI-powered study assistant for students. Generate notes, create flashcards,
          summarize PDFs, and track your daily study progress — all in one beautiful dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            aria-label="Get Started Free with ScholarSync"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-indigo-300/40 hover:shadow-2xl hover:shadow-indigo-400/50 hover:scale-105 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Get Started Free
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
          <Link
            href="/login"
            aria-label="Login to Dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/70 backdrop-blur-sm text-slate-700 font-semibold px-8 py-4 rounded-2xl text-base border border-white/80 shadow-md hover:bg-white hover:shadow-lg transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
          >
            Login to Dashboard
          </Link>
        </div>

        {/* Social proof strip */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] sm:text-xs text-slate-400 font-medium pt-2">
          <span>✓ No credit card required</span>
          <span>✓ Free forever plan</span>
          <span>✓ 10,000+ students</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 animate-bounce">
        <span className="text-xs font-medium">Scroll to explore</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
