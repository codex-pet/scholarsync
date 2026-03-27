"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, BookOpen, CheckSquare, Layout, Cloud, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Sparkles, path: '/ai', label: 'AI'}, 
    { icon: BookOpen, path: '/library', label: 'Library' },
    { icon: Layout, path: '/study', label: 'Study' }, 
    { icon: CheckSquare, path: '/tasks', label: 'Tasks' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-24 glass flex flex-col items-center py-10 z-50">
      <div className="mb-12 text-lavender flex flex-col items-center gap-1">
        <Sparkles size={32} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Scholar</span>
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path} className="group relative">
            <div className={`p-3 rounded-2xl transition-all duration-300 ${
              pathname === item.path ? 'bg-white shadow-md text-indigo-500 scale-110' : 'text-slate-300 hover:text-indigo-400'
            }`}>
              <item.icon size={26} />
            </div>
          </Link>
        ))}
        <div className="border-t border-slate-100 pt-8 flex flex-col gap-8">
          <Settings className="text-slate-300 hover:text-indigo-400 cursor-pointer" size={26} />
        </div>
      </nav>

      <div className="mt-auto flex flex-col items-center gap-6">
        <div className="flex flex-col items-center opacity-40">
          <Cloud size={16} className="text-green-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Synced</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-peach/20 border-2 border-white overflow-hidden shadow-sm cursor-pointer">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jade" alt="User" />
        </div>
      </div>
    </aside>
  );
}