"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Sparkles, BookOpen, CheckSquare,
  Layout, Settings, Cloud, ChevronRight, ChevronLeft, X
} from 'lucide-react';

export default function Sidebar({
  isExpanded = false,
  setIsExpanded,
  isMobileDrawer = false,
  onClose,
}) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home,        path: '/dashboard', label: 'Home'    },
    { icon: Sparkles,    path: '/ai',        label: 'AI'      },
    { icon: BookOpen,    path: '/library',   label: 'Library' },
    { icon: Layout,      path: '/study',     label: 'Study'   },
    { icon: CheckSquare, path: '/tasks',     label: 'Tasks'   },
  ];

  // In the mobile drawer the sidebar is always "expanded"
  const expanded = isMobileDrawer ? true : isExpanded;

  return (
    <aside
      aria-label="Dashboard Sidebar"
      className={`
        flex flex-col py-6 z-50 transition-all duration-500 ease-in-out

        /* Glass physics */
        bg-white/[0.75]
        backdrop-blur-3xl backdrop-saturate-[1.8]
        border-r border-white/40
        shadow-[4px_0_40px_rgba(31,38,135,0.08)]

        ${isMobileDrawer
          /* Full-height left drawer on mobile */
          ? 'fixed top-0 left-0 h-full w-72 rounded-none px-5 items-start'
          /* Floating pill on desktop */
          : `fixed left-6 top-[45%] -translate-y-1/2 h-fit min-h-[400px]
             max-h-[calc(100vh-120px)] rounded-[2.5rem]
             ${expanded ? 'w-56 px-5 items-start' : 'w-20 px-2 items-center'}`
        }
      `}
    >
      {/* Logo Section */}
      <div className={`mb-8 flex items-center shrink-0 transition-all duration-500 ${expanded ? 'w-full px-2 gap-3 justify-between' : 'w-16 h-16 justify-center'}`}>
        <div className="flex items-center gap-3">
          <img
            src="/scholarsync-logo.png"
            alt="ScholarSync Logo"
            className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
          />
          <span className={`font-bold text-slate-800 tracking-tight whitespace-nowrap overflow-hidden transition-all duration-500 ${expanded ? 'max-w-[150px] opacity-100 translate-x-1' : 'max-w-0 opacity-0 -translate-x-2'}`}>
            ScholarSync
          </span>
        </div>
        {isMobileDrawer && (
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl bg-slate-100/70 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main Navigation"
        className={`flex flex-col gap-3 flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide pr-1 ${expanded ? 'items-stretch' : 'items-center'}`}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="group relative w-full flex justify-center shrink-0 outline-none"
            >
              <div
                className={`
                  flex items-center p-3 rounded-2xl transition-all duration-500 w-full overflow-hidden
                  group-focus-visible:ring-2 group-focus-visible:ring-indigo-200
                  ${isActive
                    ? 'bg-indigo-50/80 shadow-sm text-indigo-600 border border-indigo-100/60'
                    : 'text-slate-500 hover:bg-white/60 hover:text-indigo-500'
                  } 
                  ${expanded ? 'px-4 justify-start gap-4' : 'justify-center w-12 h-12 gap-0'}
                `}
              >
                <item.icon size={20} className="shrink-0" />
                <span className={`font-semibold text-xs whitespace-nowrap overflow-hidden transition-all duration-500 ${expanded ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`mt-4 border-t border-slate-200/50 pt-4 flex flex-col gap-3 w-full shrink-0 ${expanded ? 'items-start' : 'items-center'}`}>
        <Link
          href="/settings"
          aria-label="Settings"
          className={`
            group flex items-center w-full p-3 text-slate-500 hover:bg-white/40 hover:shadow-sm hover:text-indigo-600 border border-transparent hover:border-white/50 transition-all duration-500 cursor-pointer rounded-2xl shrink-0 overflow-hidden
            outline-none focus-visible:ring-2 focus-visible:ring-indigo-100
            ${expanded ? 'px-4 justify-start gap-4' : 'justify-center w-12 h-12 gap-0'}
          `}
        >
          <Settings size={20} className="shrink-0 transition-transform group-hover:rotate-45 duration-500" />
          <span className={`font-semibold text-xs whitespace-nowrap overflow-hidden transition-all duration-500 ${expanded ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'}`}>
            Settings
          </span>
        </Link>

        <div className={`
          flex items-center w-full p-3 shrink-0 overflow-hidden transition-all duration-500
          ${expanded ? 'px-4 justify-start gap-3' : 'flex-col gap-1 justify-center w-12 h-12 gap-0'}
        `}>
          <div className="relative shrink-0">
            <Cloud aria-hidden="true" size={16} className="text-emerald-500 shrink-0 relative z-10" />
            <div className="absolute inset-0 bg-emerald-500/30 blur-md rounded-full"></div>
          </div>
          <span className={`font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap overflow-hidden transition-all duration-500 ${expanded ? 'max-w-[50px] opacity-100 text-[10px]' : 'max-w-0 opacity-0 text-[7px]'}`}>
            Synced
          </span>
        </div>

        {/* Expand/Collapse toggle — only on desktop non-drawer */}
        {!isMobileDrawer && (
          <button
            onClick={() => setIsExpanded?.(!isExpanded)}
            aria-label={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
            className="p-2.5 rounded-full bg-white/30 hover:bg-white/60 text-slate-500 hover:text-indigo-600 transition-all border border-white/40 shadow-sm flex items-center justify-center mx-auto outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
          >
            {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
      </div>
    </aside>
  );
}