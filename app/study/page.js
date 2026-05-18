"use client";
import { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadFilesLocally, loadStudySetsLocally, saveStudySetLocally, deleteStudySetLocally } from "../../lib/indexeddb";
import { Flame, Target, TrendingUp, BookOpen, Zap, Loader2, FileText, CheckCircle, XCircle, ChevronRight, ChevronLeft, ArrowLeft, RefreshCw, LibraryBig, Shuffle, ThumbsUp, ThumbsDown, Trash2, Search, SlidersHorizontal, Award, RotateCcw } from "lucide-react";

// Shuffle array (Fisher-Yates)
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Get current streak from localStorage
const getStreak = () => {
  try {
    const data = JSON.parse(localStorage.getItem('ss_streak') || '{"count":0,"lastDate":""}');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === today) return data.count;
    if (data.lastDate === yesterday) {
      const updated = { count: data.count + 1, lastDate: today };
      localStorage.setItem('ss_streak', JSON.stringify(updated));
      return updated.count;
    }
    const reset = { count: 1, lastDate: today };
    localStorage.setItem('ss_streak', JSON.stringify(reset));
    return reset.count;
  } catch { return 0; }
};

export default function StudyCenter() {
  const stats = [
    { label: "Current Streak", value: "15 Days", color: "text-[#D1D1FF]", icon: Flame },
    { label: "Total Flashcards", value: "810", color: "text-[#E2F0CB]", icon: Target },
    { label: "Overall Mastery", value: "74%", color: "text-[#FFD8BE]", icon: TrendingUp },
  ];

  const subjects = [
    {
      name: "Mathematics", mastery: 75, flashcards: 128, quizzes: 12,
      colorClass: "text-indigo-400", bgClass: "bg-[#D1D1FF]/20",
      btnClass: "bg-[#D1D1FF]/30 text-indigo-500 hover:bg-[#D1D1FF]/50",
    },
    {
      name: "History", mastery: 62, flashcards: 95, quizzes: 8,
      colorClass: "text-green-500", bgClass: "bg-[#E2F0CB]/40",
      btnClass: "bg-[#E2F0CB]/50 text-green-600 hover:bg-[#E2F0CB]/80",
    },
    {
      name: "Biology", mastery: 88, flashcards: 156, quizzes: 15,
      colorClass: "text-orange-400", bgClass: "bg-[#FFD8BE]/30",
      btnClass: "bg-[#FFD8BE]/40 text-orange-600 hover:bg-[#FFD8BE]/60",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8 lg:space-y-10 max-w-[1400px] mx-auto">

      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl text-slate-800 tracking-tight font-bold flex items-center gap-3">
          Study Center
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          Master your subjects with interactive flashcards and quizzes
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex justify-between items-center relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${stat.color} drop-shadow-sm`}>
                {stat.value}
              </h2>
            </div>
            <stat.icon
              size={40}
              className={`${stat.color} opacity-20 absolute right-5 sm:right-6 top-1/2 -translate-y-1/2`}
              strokeWidth={2}
            />
          </div>

          <button
            onClick={() => { setCardIndex(Math.min(cards.length - 1, cardIndex + 1)); setIsFlipped(false); }}
            disabled={cardIndex === cards.length - 1}
            className="p-3 rounded-full bg-white/60 shadow-sm border border-white disabled:opacity-30 hover:bg-white transition-all text-slate-600"
          ><ChevronRight size={22} /></button>
        </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {["Review All", "Daily Challenge", "Weak Areas"].map(label => (
          <button
            key={label}
            className="bg-white border border-slate-100 shadow-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-slate-500 hover:text-indigo-500 hover:border-indigo-100 transition-all"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Subjects Grid */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl text-slate-800 font-bold ml-1">Your Subjects</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {subjects.map((sub, i) => (
            <div
              key={i}
              className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col border border-white/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <div className={`p-3 sm:p-4 rounded-2xl ${sub.bgClass} ${sub.colorClass}`}>
                  <BookOpen size={22} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mastery</p>
                  <div className={`flex items-center gap-1 text-sm font-black ${sub.colorClass}`}>
                    <TrendingUp size={12} /> {sub.mastery}%
                  </div>
                </div>
              </div>

              <h4 className="text-lg sm:text-xl text-slate-800 mb-5 sm:mb-8 font-bold">{sub.name}</h4>

              <div className="grid grid-cols-2 gap-4 mb-5 sm:mb-8">
                {[["Flashcards", sub.flashcards], ["Quizzes", sub.quizzes]].map(([label, val]) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-700">{val}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-4 sm:space-y-6">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${sub.bgClass}`}
                    style={{ width: `${sub.mastery}%` }}
                  />
                </div>
                <button className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${sub.btnClass}`}>
                  <Zap size={16} /> Study Now
                </button>
                )
            })}
              </div>

              {selectedOption && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={nextQuestion}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    {quizIndex === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
      </div>
        );
  }

        // ----------------------------------------------------
        // OVERVIEW RENDERER
        // ----------------------------------------------------
        return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto min-h-screen flex flex-col">

          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#2B3674] tracking-tight">Study Center</h1>
              <p className="text-slate-500 font-medium mt-1">AI-generated flashcards and quizzes from your library.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-100 to-amber-50 border border-orange-200 px-5 py-2.5 rounded-2xl flex items-center gap-2.5">
                <Flame className="text-orange-500" size={20} />
                <div>
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none">Streak</p>
                  <p className="text-lg font-black text-orange-600 leading-tight">{streak} Day{streak !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {avgMastery !== null && (
                <div className="bg-gradient-to-r from-indigo-100 to-blue-50 border border-indigo-200 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 hidden sm:flex">
                  <Award className="text-indigo-500" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Avg Mastery</p>
                    <p className="text-lg font-black text-indigo-600 leading-tight">{avgMastery}%</p>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[28px] flex justify-between items-center relative overflow-hidden shadow-sm">
              <div className="space-y-0.5 z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Saved Materials</p>
                <h2 className="text-4xl font-black text-[#5B61F4]">{files.length}</h2>
              </div>
              <FileText size={44} className="text-[#5B61F4] opacity-10 absolute right-5" strokeWidth={2} />
            </div>
            <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[28px] flex justify-between items-center relative overflow-hidden shadow-sm">
              <div className="space-y-0.5 z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Flashcards</p>
                <h2 className="text-4xl font-black text-green-500">{totalFlashcards}</h2>
              </div>
              <BookOpen size={44} className="text-green-500 opacity-10 absolute right-5" strokeWidth={2} />
            </div>
            <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-[28px] flex justify-between items-center relative overflow-hidden shadow-sm">
              <div className="space-y-0.5 z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Quiz Qs</p>
                <h2 className="text-4xl font-black text-orange-400">{totalQuizzes}</h2>
              </div>
              <Target size={44} className="text-orange-400 opacity-10 absolute right-5" strokeWidth={2} />
            </div>
          </div>
          {/* Study Materials Grid */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-[#2B3674] mr-auto">Your Study Sets</h3>
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="pl-8 pr-4 py-2 text-sm bg-white/60 border border-white/80 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-slate-700 placeholder:text-slate-400 w-44"
                />
              </div>
              {/* Sort */}
              <div className="relative flex items-center gap-1.5 bg-white/60 border border-white/80 rounded-xl px-3 py-2">
                <SlidersHorizontal size={13} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-sm font-bold text-slate-600 bg-transparent outline-none cursor-pointer"
                >
                  <option value="name">Name</option>
                  <option value="mastery">Mastery</option>
                  <option value="date">Date Created</option>
                </select>
              </div>
            </div>

            {files.length === 0 ? (
              <div className="bg-white/30 backdrop-blur-md border-2 border-dashed border-white/50 rounded-[32px] p-16 text-center text-slate-500 flex flex-col items-center">
                <LibraryBig size={48} className="text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-600">Your library is empty!</p>
                <p className="text-sm">Upload files in the AI or Library tab first, then come back here to generate study sets.</p>
              </div>
            ) : displayedFiles.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Search size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold">No files match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedFiles.map((file) => {
                  const studySet = studySets[file.id];
                  const isProcessing = isGenerating === file.id;

                  // Expiration check (matches Library page 48-hour logic)
                  const timeLeftMs = (48 * 3600 * 1000) - (Date.now() - (file.createdAt || Date.now()));
                  const isExpired = timeLeftMs <= 0;

                  const flashCount = studySet?.flashcards?.length || 0;
                  const quizCount = studySet?.quiz?.length || 0;
                  const lastStudied = studySet?.lastStudied ? new Date(studySet.lastStudied).toLocaleDateString([], { month: 'short', day: 'numeric' }) : null;

                  return (
                    <div key={file.id} className="bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-lg transition-all duration-300 rounded-[28px] p-6 flex flex-col gap-4 group hover:-translate-y-0.5">

                      {/* Card Header */}
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl shrink-0 mt-0.5">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#2B3674] text-base leading-snug line-clamp-2 break-words" title={file.name}>{file.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-[11px] text-slate-400 font-medium">{file.size} &bull; {file.pages || 1} {file.pages === 1 ? 'Page' : 'Pages'}</p>
                            {lastStudied && <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Studied {lastStudied}</span>}
                            {isExpired && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Expired - Re-Sync in Library</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {studySet?.mastery !== undefined && (
                            <div className="flex flex-col items-center">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Mastery</p>
                              <div className="w-10 h-10 rounded-full border-4 border-indigo-100 bg-white shadow-sm flex items-center justify-center">
                                <span className="text-[10px] font-black text-indigo-600">{studySet.mastery}%</span>
                              </div>
                            </div>
                          )}
                          {/* Delete button */}
                          {studySet && (
                            confirmDeleteId === file.id ? (
                              <div className="flex items-center gap-1 mt-1">
                                <button onClick={() => deleteStudySet(file.id)} className="text-[10px] font-black text-white bg-red-500 px-2 py-1 rounded-lg hover:bg-red-600 transition-all">Yes</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg hover:bg-slate-200 transition-all">No</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(file.id)}
                                className="mt-1 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete study set"
                              ><Trash2 size={13} /></button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Study Set Content */}
                      {studySet ? (
                        <div className="flex flex-col gap-3 mt-auto">
                          <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-3">
                            <div className="flex-1 text-center">
                              <span className="block text-2xl font-black text-green-500 leading-none">{flashCount}</span>
                              <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">Flashcards</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="flex-1 text-center">
                              <span className="block text-2xl font-black text-orange-400 leading-none">{quizCount}</span>
                              <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">Quiz Qs</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => startFlashcards(file.id)} disabled={isExpired} className="py-2.5 px-3 bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500 hover:text-white rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                              <BookOpen size={15} /> Cards
                            </button>
                            <button onClick={() => startQuiz(file.id)} disabled={isExpired} className="py-2.5 px-3 bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500 hover:text-white rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                              <Target size={15} /> Quiz
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => extendStudySet(file, studySet)} disabled={isProcessing || isExpired} className="flex-1 py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-500 rounded-xl font-bold text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                              {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                              Extend
                            </button>
                            <button onClick={() => { if (window.confirm('This will reset your study set back to the original 10 cards and 5 questions. Are you sure?')) refreshStudySet(file.id); }} disabled={isProcessing || isExpired || (flashCount <= 10 && quizCount <= 5)} className="flex-1 py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 text-slate-500 rounded-xl font-bold text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" title="Resets current set completely">
                              <RotateCcw size={13} />
                              Refresh
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-auto pt-4 border-t border-slate-100/60 flex flex-col gap-2">
                          {isExpired && <p className="text-[11px] text-center text-red-500 font-bold mb-1">File expired. Please re-sync in Library first.</p>}
                          <button onClick={() => generateStudySet(file)} disabled={isGenerating !== null || isExpired} className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95 ${(isProcessing || isExpired) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-md hover:from-indigo-600 hover:to-purple-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                            {isProcessing ? <><Loader2 size={15} className="animate-spin" /> Analyzing...</> : <><Zap size={15} /> Generate AI Study Set</>}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        );
}