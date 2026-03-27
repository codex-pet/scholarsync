"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, BookOpen, CheckSquare, Layout, Settings, Cloud, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Sidebar({ isExpanded = false, setIsExpanded }) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Sparkles, path: '/ai', label: 'AI' },
    { icon: BookOpen, path: '/library', label: 'Library' },
    { icon: Layout, path: '/study', label: 'Study' },
    { icon: CheckSquare, path: '/tasks', label: 'Tasks' },
  ];

  return (
    <aside
      className={`
        fixed left-6 top-[45%] -translate-y-1/2 h-fit min-h-[400px] max-h-[calc(100vh-120px)] 
        rounded-[2.5rem] flex flex-col py-6 z-50 transition-all duration-500 ease-in-out
        
        /* THE GLASS PHYSICS */
        bg-white/[0.15] 
        bg-gradient-to-b from-white/20 via-transparent to-white/10
        backdrop-blur-3xl backdrop-saturate-[1.8]
        border border-white/30
        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
        
        ${isExpanded ? 'w-56 px-5 items-start' : 'w-20 px-2 items-center'}
      `}
    >
      {/* Logo Section */}
      <div className={`mb-8 flex items-center shrink-0 transition-all duration-300 ${isExpanded ? 'w-full px-4 gap-3 justify-start' : 'w-16 h-16 justify-center'}`}>
        <img
          src="/scholarsync-logo.png"
          alt="ScholarSync Logo"
          className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
        />
        <span className={`font-bold text-slate-800 tracking-tight transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? 'opacity-100 text-sm translate-x-1' : 'opacity-0 w-0 -translate-x-2'}`}>
          ScholarSync
        </span>
      </div>

      {/* Navigation */}
      <nav className={`flex flex-col gap-3 flex-1 w-full overflow-y-auto overflow-x-hidden pr-1 ${isExpanded ? 'items-stretch' : 'items-center'}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="group relative w-full flex justify-center shrink-0">
              <div
                className={`
                  flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 w-full 
                  ${isActive
                    ? 'bg-white/40 shadow-sm text-indigo-600 border border-white/50'
                    : 'text-slate-600 hover:bg-white/20 hover:text-indigo-500'
                  } 
                  ${!isExpanded ? 'justify-center w-12 h-12' : 'px-4'}
                `}
              >
                <item.icon size={20} className="shrink-0" />
                <span className={`font-semibold text-xs transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`mt-4 border-t border-white/20 pt-4 flex flex-col gap-4 w-full shrink-0 ${isExpanded ? 'items-start' : 'items-center'}`}>
        <div className={`flex items-center gap-4 w-full p-3 text-slate-500 hover:bg-white/20 transition-all cursor-pointer rounded-2xl shrink-0 ${!isExpanded ? 'justify-center w-12 h-12' : 'px-4'}`}>
          <Settings size={20} />
          <span className={`font-medium text-xs transition-all duration-300 ${isExpanded ? 'opacity-100' : 'hidden'}`}>Settings</span>
        </div>

        <div className={`flex items-center gap-4 w-full p-3 shrink-0 ${!isExpanded ? 'flex-col gap-1 justify-center' : 'px-4'}`}>
          <div className="relative">
            <Cloud size={16} className="text-emerald-500 shrink-0 relative z-10" />
            <div className="absolute inset-0 bg-emerald-500/30 blur-md rounded-full"></div>
          </div>
          <span className={`font-bold uppercase tracking-widest text-slate-400 ${isExpanded ? 'text-[10px]' : 'text-[7px]'}`}>Synced</span>
        </div>

        <button
          onClick={() => setIsExpanded?.(!isExpanded)}
          className="p-2.5 rounded-full bg-white/30 hover:bg-white/60 text-slate-500 hover:text-indigo-600 transition-all border border-white/40 shadow-sm flex items-center justify-center mx-auto"
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </aside>
  );
}