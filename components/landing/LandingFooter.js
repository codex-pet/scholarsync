"use client";
import Link from "next/link";

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About Us", "Blog", "Careers", "Press"],
  Support: ["Help Center", "Privacy Policy", "Terms of Service", "Contact"],
};

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/60 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex items-center justify-center shadow-indigo-200 group-hover:scale-105 transition-transform">
                <img
                  src="/scholarsync-logo.png"
                  alt="ScholarSync Logo"
                  className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
                />
              </div>
              <span className="font-bold text-slate-800 text-lg tracking-tight">ScholarSync</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              The AI-powered study dashboard that helps students study smarter, not harder.
            </p>
            {/* Social icons */}
            <div className="flex gap-4">
              {["𝕏", "in", "gh"].map((icon) => (
                <button
                  key={icon}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-500 flex items-center justify-center text-sm font-bold transition-all"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-800">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 hover:text-indigo-600 transition-colors outline-none focus-visible:text-indigo-600"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 mb-16 shadow-xl shadow-indigo-200/40">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-white font-bold text-2xl sm:text-3xl mb-1 tracking-tight">Ready to study smarter?</h3>
            <p className="text-indigo-100/90 text-sm sm:text-base">Join 10,000+ students already using ScholarSync.</p>
          </div>
          <Link
            href="/login"
            aria-label="Get Started Free with ScholarSync"
            className="w-full sm:w-auto shrink-0 bg-white text-indigo-600 font-bold px-10 py-4 rounded-2xl hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg text-base text-center outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
          >
            Get Started Free →
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 border-t border-slate-100 pt-8">
          <p>© {new Date().getFullYear()} ScholarSync. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600 transition-colors outline-none focus-visible:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors outline-none focus-visible:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors outline-none focus-visible:text-indigo-600">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
