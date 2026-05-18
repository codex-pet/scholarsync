"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RecentDocs from "@/components/RecentDocs";
import ProgressRing from "@/components/ProgressRing";
import {
  ArrowRight, BookOpen, BrainCircuit, Sparkles, ChevronRight,
  LibraryBig, FileText, Target, Zap, TrendingUp, BookMarked, CheckSquare
} from "lucide-react";
import Link from "next/link";
import { loadFilesLocally, loadStudySetsLocally } from "../../lib/indexeddb";
import SearchArea from "@/components/SearchArea";
import TaskList from "@/components/TaskList";
import AIAssistant from "@/components/AIAssistant";

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

      {/* ── STATS CARDS ── */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, Icon, href, accent, blob, border }) => (
            <Link key={label} href={href}
              className={`relative overflow-hidden bg-white/40 backdrop-blur-xl border ${border} rounded-3xl p-6 shadow-sm hover:shadow-lg hover:bg-white/50 hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-gradient-to-br ${blob} blur-2xl pointer-events-none`} />
              <div className={`inline-flex p-2.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm mb-4 ${accent}`}>
                <Icon size={22} />
              </div>
              <p className={`text-4xl font-black ${accent} leading-none mb-1`}>{value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <ArrowRight size={14} className={`absolute top-5 right-5 ${accent} opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all`} />
            </Link>
          ))}
        </div>
      )}

      {/* AI ASSISTANT PROMO */}
      <section>
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={22} /> AI Assistant
          </h2>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-6 relative overflow-hidden shadow-md hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group">
          {/* Decorative blobs */}
          <div className="absolute top-[-30%] right-[-5%] w-[280px] h-[280px] bg-gradient-to-br from-indigo-400/10 to-purple-400/8 rounded-full blur-[70px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-[-20%] left-[-5%] w-[200px] h-[200px] bg-gradient-to-br from-purple-400/8 to-pink-400/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left: description */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/80">
                  <Sparkles size={24} className="text-indigo-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Chat with your documents</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {files.length > 0
                      ? `${files.length} file${files.length !== 1 ? 's' : ''} ready in your library — ask anything`
                      : "Upload files to unlock document-grounded answers"}
                  </p>
                </div>
              </div>

              {/* Quick prompts row */}
              <div className="flex flex-wrap gap-2">
                {["Summarize my notes", "Explain a concept", "Quiz me on this topic", "Create a study plan"].map(prompt => (
                  <Link key={prompt} href="/ai"
                    className="text-xs font-bold text-indigo-600 bg-white/60 border border-indigo-100 px-3 py-1.5 rounded-xl hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all"
                  >
                    {prompt}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: CTA button */}
            <div className="flex flex-col gap-3">
              <Link href="/ai"
                className="w-full py-4 flex items-center justify-center gap-2 font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 group/btn"
              >
                Open AI - Study Buddy
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <p className="text-center text-[10px] text-slate-400 font-medium">RAG · General · Document Chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* LEFT COLUMN (7/12) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">

          {/* Continue Studying — ALL sets */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BrainCircuit className="text-purple-500" size={22} /> Continue Studying
              </h2>
              <Link href="/study" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-all hover:translate-x-1">
                Study Center <ChevronRight size={15} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="bg-white/30 rounded-[2rem] h-28 animate-pulse border border-white/40" />)}
              </div>
            ) : sortedSets.length === 0 ? (
              <Link href="/study" className="block bg-white/30 backdrop-blur-xl border-2 border-dashed border-purple-100 rounded-[2.5rem] p-10 text-center hover:bg-white/50 hover:border-purple-200 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Zap size={26} className="text-purple-400" />
                </div>
                <p className="font-bold text-slate-600">No study sets yet</p>
                <p className="text-sm text-slate-400 mt-1">Go to the Study Center and generate AI flashcards from your files →</p>
              </Link>
            ) : (
              <div className="space-y-3">
                {sortedSets.map((set) => {
                  const masteryColor = set.mastery >= 80 ? "text-emerald-600" : set.mastery >= 50 ? "text-amber-500" : "text-indigo-500";
                  const barColor = set.mastery >= 80 ? "from-emerald-400 to-green-400" : set.mastery >= 50 ? "from-amber-400 to-orange-400" : "from-indigo-400 to-purple-400";

                  return (
                    <div key={set.fileId} className="bg-white/40 backdrop-blur-xl border border-white/80 rounded-[2rem] p-5 relative overflow-hidden shadow-sm hover:shadow-lg hover:shadow-indigo-100/40 hover:-translate-y-0.5 transition-all duration-300 group">
                      <div className="absolute top-[-40%] right-[-5%] w-[160px] h-[160px] bg-gradient-to-br from-indigo-400/8 to-purple-400/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />

                      <div className="relative z-10 flex items-center gap-4">
                        {/* Icon */}
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500 shrink-0">
                          <BookMarked size={18} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{set.fileName}</h3>
                            {set.mastery !== undefined && (
                              <span className={`text-xs font-black shrink-0 ${masteryColor}`}>{set.mastery}%</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {set.flashcards?.length || 0} flashcards · {set.quiz?.length || 0} quiz Qs
                            {set.lastStudied && ` · studied ${new Date(set.lastStudied).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                          </p>

                          {/* Mastery bar */}
                          {set.mastery !== undefined && (
                            <div className="w-full bg-white/70 border border-white/80 h-1.5 rounded-full overflow-hidden mt-2">
                              <div
                                className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
                                style={{ width: `${set.mastery}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href="/study"
                            className="px-3 py-1.5 bg-green-500/10 text-green-600 border border-green-100 rounded-xl font-bold text-xs hover:bg-green-500 hover:text-white hover:border-green-500 transition-all flex items-center gap-1"
                          >
                            <BookOpen size={12} /> Cards
                          </Link>
                          <Link href="/study"
                            className="px-3 py-1.5 bg-orange-500/10 text-orange-500 border border-orange-100 rounded-xl font-bold text-xs hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all flex items-center gap-1"
                          >
                            <Target size={12} /> Quiz
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Link to see all in Study Center */}
                <Link href="/study" className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-purple-500 hover:text-purple-700 transition-colors">
                  View all in Study Center <ChevronRight size={15} />
                </Link>
              </div>
            )}
          </section>

          {/* Recent Files */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-indigo-500" size={22} /> Recent Files
              </h2>
              <Link href="/library" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all hover:translate-x-1">
                View All <ChevronRight size={15} />
              </Link>
            </div>
            <RecentDocs />
          </section>
        </div>

        {/* RIGHT COLUMN (5/12) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">

          {/* Mastery Ring */}
          <section className="bg-white/40 backdrop-blur-xl border border-white/60 p-7 rounded-[2.5rem] flex flex-col items-center shadow-sm hover:shadow-xl hover:shadow-emerald-100/40 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-[-30%] left-[-20%] w-[200px] h-[200px] bg-emerald-400/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[160px] h-[160px] bg-indigo-400/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Overall Mastery</h3>
                  <p className="text-xs text-slate-400 font-medium">Based on your quiz results</p>
                </div>
                <Link href="/study" className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-all hover:translate-x-0.5">
                  Details <ChevronRight size={13} />
                </Link>
              </div>

              <div className="flex justify-center py-2">
                <ProgressRing />
              </div>
            </div>
          </section>

          {/* Today's Tasks */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="text-emerald-500" size={22} /> Today&apos;s Tasks
            </h2>
            <TaskList />
          </section>

          {/* Quick AI Help */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={22} /> Quick AI Help
            </h2>
            <AIAssistant />
          </section>
        </div>

      </div>
    </div>
  );
}
