"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RecentDocs from "@/components/RecentDocs";
import ProgressRing from "@/components/ProgressRing";
import {
  ArrowRight, BookOpen, BrainCircuit, Sparkles, ChevronRight,
  LibraryBig, FileText, Target, Zap, TrendingUp, BookMarked
} from "lucide-react";
import Link from "next/link";
import { loadFilesLocally, loadStudySetsLocally } from "../../lib/indexeddb";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [studySets, setStudySets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [f, s] = await Promise.all([loadFilesLocally(), loadStudySetsLocally()]);
        setFiles(f);
        setStudySets(s);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const totalFlashcards = studySets.reduce((a, s) => a + (s.flashcards?.length || 0), 0);
  const totalQuizQs = studySets.reduce((a, s) => a + (s.quiz?.length || 0), 0);

  // Sort sets: recently studied first, then by creation date
  const sortedSets = [...studySets].sort((a, b) => {
    const aTime = a.lastStudied || a.createdAt || 0;
    const bTime = b.lastStudied || b.createdAt || 0;
    return bTime - aTime;
  });

  const STATS = [
    { label: "Files in Library", value: files.length, Icon: LibraryBig, href: "/library", accent: "text-indigo-500", blob: "from-indigo-400/10 to-indigo-300/5", border: "border-indigo-100/60" },
    { label: "Study Sets", value: studySets.length, Icon: BrainCircuit, href: "/study", accent: "text-purple-500", blob: "from-purple-400/10 to-purple-300/5", border: "border-purple-100/60" },
    { label: "Flashcards", value: totalFlashcards, Icon: BookOpen, href: "/study", accent: "text-emerald-500", blob: "from-emerald-400/10 to-emerald-300/5", border: "border-emerald-100/60" },
    { label: "Quiz Questions", value: totalQuizQs, Icon: Target, href: "/study", accent: "text-orange-400", blob: "from-orange-400/10 to-orange-300/5", border: "border-orange-100/60" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 xl:p-12 space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl mx-auto">
      <Header />
      <SearchArea />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ── Left Column: Library & Study ── */}
        <div className="lg:col-span-8 space-y-8 lg:space-y-10">

          {/* Library Section */}
          <section id="library-section" className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
                <BookOpen className="text-indigo-500 shrink-0" size={22} /> My Library
              </h2>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors whitespace-nowrap">
                View All
              </button>
            </div>
            <RecentDocs />
          </section>

          {/* Study Section */}
          <section id="study-section" className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
              <BrainCircuit className="text-purple-500 shrink-0" size={22} /> Continued Study
            </h2>

            {/* Active Reading Card */}
            <div className="bg-white/40 backdrop-blur-md border border-white/60 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] space-y-5 sm:space-y-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 text-xl sm:text-2xl shrink-0">
                    📖
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">Biology 101</h3>
                    <p className="text-slate-500 text-sm">Chapter 5: Photosynthesis</p>
                  </div>
                </div>
                <span className="self-start text-[10px] font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Expires in 32h
                </span>
              </div>
              <div className="flex justify-center">
                <ProgressRing />
              </div>
              <Link href="/study"
                className="mt-6 w-full py-3.5 sm:py-3.5 flex items-center justify-center gap-2 font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-sm sm:text-base group/btn"
              >
                Go to Study Center
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        </div>

        {/* ── Right Column: Progress, Tasks & AI ── */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8">

          {/* Study Goal / Progress */}
          <section
            id="progress-section"
            className="bg-emerald-500/5 backdrop-blur-md border border-white/60 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center shadow-sm"
          >
            <h3 className="self-start mb-6 sm:mb-8 text-base sm:text-lg font-bold text-slate-800">
              Daily Study Goal
            </h3>
            <ProgressRing percentage={87} />
          </section>

          {/* Tasks */}
          <section id="tasks-section" className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="text-emerald-500 shrink-0" size={20} /> Today's Tasks
            </h2>
            <TaskList />
          </section>

          {/* AI */}
          <section id="ai-section" className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-indigo-400 shrink-0" size={20} /> Quick AI Help
            </h2>
            <AIAssistant />
          </section>
        </div>
      </div>
    </div>
  );
}
