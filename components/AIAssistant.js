"use client";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, FileText } from "lucide-react";
import { loadFilesLocally } from "../lib/indexeddb";
import Link from "next/link";

const QUICK_PROMPTS = [
  "Summarize my latest file",
  "Create flashcards for me",
  "Quiz me on my materials",
];

export default function AIAssistant() {
  const [fileCount, setFileCount] = useState(0);

  useEffect(() => {
    loadFilesLocally()
      .then(f => setFileCount(f.length))
      .catch(() => setFileCount(0));
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-md p-6 rounded-[2.5rem] space-y-4 border border-white/60 shadow-sm hover:shadow-xl hover:shadow-indigo-200/40 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-indigo-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
            <div className="p-2 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/50">
              <Sparkles size={16} className="text-indigo-600" />
            </div>
            AI Assistant
          </div>
          {fileCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">
              <FileText size={10} /> {fileCount} file{fileCount !== 1 ? 's' : ''} ready
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
          {fileCount > 0
            ? `Ask questions about your ${fileCount} uploaded file${fileCount !== 1 ? 's' : ''}. RAG mode gives you document-grounded answers.`
            : "Upload files to the AI section and ask anything — get instant explanations and summaries."}
        </p>

        {/* Quick Prompts */}
        <div className="flex flex-col gap-2 mb-4">
          {QUICK_PROMPTS.map((p, i) => (
            <Link
              key={i}
              href="/ai"
              className="text-xs font-bold text-indigo-600 bg-white/70 border border-white/80 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all flex items-center justify-between group/p"
            >
              {p}
              <ArrowRight size={12} className="opacity-40 group-hover/p:opacity-100 group-hover/p:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        <Link href="/ai" className="w-full bg-white/70 backdrop-blur-md py-3 rounded-2xl font-bold text-indigo-600 shadow-sm border border-white/80 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2 group/btn text-sm">
          Open Full AI Studio <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}