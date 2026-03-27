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
      className={`fixed left-6 top-[47%] -translate-y-1/2 h-fit min-h-[580px] rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.05)] flex flex-col py-6 z-50 transition-all duration-300 ${
        isExpanded ? 'w-56 px-5 items-start' : 'w-20 px-2 items-center'
      }`}
    >
      <div className={`mb-6 text-lavender flex items-center gap-3 ${isExpanded ? 'w-full px-2' : 'flex-col gap-1'}`}>
        <Sparkles size={28} className="shrink-0" />
        <span className={`font-bold uppercase tracking-tighter transition-all duration-300 ${isExpanded ? 'text-xl' : 'text-[10px]'}`}>
          Scholar
        </span>
      </div>

      <nav className={`flex flex-col gap-3 flex-1 w-full ${isExpanded ? 'items-stretch' : 'items-center'}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="group relative w-full flex justify-center">
              <div 
                className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 w-full ${
                  isActive ? 'bg-white shadow-md text-indigo-500 scale-105' : 'text-slate-500 hover:text-indigo-400'
                } ${!isExpanded ? 'justify-center w-12 h-12' : 'px-4'}`}
              >
                <item.icon size={22} className="shrink-0" />
                <span 
                  className={`font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0 hidden'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
        
        <div className={`mt-auto border-t border-slate-200/50 pt-5 flex flex-col gap-4 w-full ${isExpanded ? 'items-start' : 'items-center'}`}>
          <div className={`flex items-center gap-4 w-full p-3 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer rounded-2xl ${
            !isExpanded ? 'justify-center w-12 h-12' : 'px-4'
          }`}>
            <Settings size={22} className="shrink-0" />
            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0 hidden'
            }`}>
              Settings
            </span>
          </div>
          
          <div className={`flex items-center gap-4 w-full p-3 opacity-60 ${
            !isExpanded ? 'flex-col gap-1 justify-center' : 'px-4'
          }`}>
            <Cloud size={18} className="text-green-500 shrink-0" />
            <span className={`font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isExpanded ? 'text-xs w-full opacity-100' : 'text-[7px] text-center'
            }`}>
              Synced
            </span>
          </div>

          <button 
            onClick={() => setIsExpanded?.(!isExpanded)}
            className={`p-2 rounded-full hover:bg-white/50 text-slate-400 hover:text-indigo-500 transition-all cursor-pointer flex items-center justify-center mx-auto ${
              !isExpanded ? 'w-10 h-10' : 'w-10 h-10 ml-auto mr-0'
            }`}
          >
            {isExpanded ? <ChevronLeft size={20} className="shrink-0" /> : <ChevronRight size={20} className="shrink-0" />}
          </button>
        </div>
      </nav>
    </aside>
  );
}