"use client";
import { useState } from 'react';
import { Type, Highlighter, Send, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AIWorkspace() {
  const [sepia, setSepia] = useState(false);

  return (
    <div className="p-8 lg:p-12 h-screen flex flex-col gap-6">
      <header>
        <h1 className="text-3xl text-slate-800 tracking-tight">AI Workspace</h1>
        <p className="text-slate-400">Grounded reading & source-cited intelligence</p>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Document Viewer */}
        <div className={`col-span-8 glass rounded-4xl flex flex-col overflow-hidden transition-all duration-500 ${sepia ? 'bg-[#f4ecd8]' : 'bg-white/80'}`}>
          <div className="p-4 border-b border-white/40 flex justify-between bg-white/20">
             <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                <span className="bg-white/60 px-3 py-1 rounded-lg">Document.pdf</span>
                <span>Page 1 of 10</span>
             </div>
             <div className="flex gap-2">
                <button onClick={() => setSepia(!sepia)} className="p-2 bg-white rounded-xl shadow-sm hover:scale-105 transition-transform"><Type size={18}/></button>
                <button className="p-2 bg-white rounded-xl shadow-sm hover:scale-105 transition-transform"><Highlighter size={18}/></button>
             </div>
          </div>
          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
             <h2 className="text-2xl mb-8">Chapter 1: Introduction to Learning</h2>
             <p className="text-slate-600 leading-relaxed text-lg mb-6">
               Learning is a complex cognitive process involving the acquisition of new knowledge, skills, and understanding...
             </p>
             <div className="bg-lavender/10 p-6 rounded-2xl border-l-4 border-lavender italic text-indigo-800 text-lg">
               "Active learning is proven to be more effective than passive reading."
             </div>
          </div>
          <div className="p-4 bg-white/30 border-t border-white/20 flex justify-between">
            <button className="px-6 py-2 bg-white rounded-xl text-xs font-bold text-slate-400">PREVIOUS</button>
            <button className="px-8 py-2 bg-slate-800 rounded-xl text-xs font-bold text-white">NEXT PAGE</button>
          </div>
        </div>

        {/* AI Buddy Chat */}
        <div className="col-span-4 glass rounded-4xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/40 font-bold text-slate-800">Study Buddy</div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
             <div className="flex gap-3">
                <div className="bg-lavender/20 p-2 rounded-lg text-indigo-400 h-fit"><Sparkles size={16}/></div>
                <div className="bg-white p-4 rounded-2xl shadow-sm text-sm text-slate-600 border border-slate-50">
                   Hello! I've read your document. What would you like to know about it?
                   <div className="mt-3">
                      <span className="bg-sage text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">🔗 Source: Page 1</span>
                   </div>
                </div>
             </div>
          </div>
          <div className="p-6">
             <div className="relative">
                <input placeholder="Ask anything..." className="w-full py-4 px-6 rounded-3xl glass outline-none text-sm pr-14" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 text-white p-2.5 rounded-full shadow-lg"><Send size={18}/></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}