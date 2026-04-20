"use client";
import { CheckSquare, Clock, Link as LinkIcon, Plus, Calendar, Tag, ChevronRight, MoreVertical } from "lucide-react";

export default function Tasks() {
  const tasks = [
    { name: "Read Chapter 5 of Physics",  tag: "Reading",    due: "Today",    color: "bg-[#D1D1FF]/30 text-indigo-600",  priority: "High"   },
    { name: "Complete Bio Assignment",     tag: "Assignment", due: "Tomorrow", color: "bg-[#FFD8BE]/30 text-orange-600",  priority: "Medium" },
    { name: "Study for Math Exam",         tag: "Study",      due: "Mar 27",   color: "bg-[#E2F0CB]/40 text-green-700",   priority: "High"   },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-[1400px] mx-auto space-y-6 sm:space-y-8 lg:space-y-10">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-slate-800 tracking-tight font-bold">
            Daily Tasks
          </h1>
          <p className="text-slate-400 mt-1.5 font-medium text-sm sm:text-base">
            Manage your academic schedule and deadlines
          </p>
        </div>
        <div className="glass px-5 py-3 rounded-2xl text-center self-start sm:self-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
          <p className="text-xl font-black text-indigo-500">12/15</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

        {/* ── Task List ── */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">

          {/* New Task Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 sm:left-6 flex items-center pointer-events-none">
              <Plus className="text-indigo-400" size={20} />
            </div>
            <input
              placeholder="What's on your mind? Add a task..."
              className="w-full py-4 sm:py-6 pl-10 sm:pl-16 pr-28 sm:pr-32 rounded-[1.75rem] sm:rounded-[2rem] bg-white border border-transparent shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all text-slate-600 placeholder:text-slate-300 font-medium text-sm sm:text-base"
            />
            <button className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100 whitespace-nowrap">
              Add Task
            </button>
          </div>

          {/* Task Items */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Active Tasks</h3>
            {tasks.map((t, i) => (
              <div
                key={i}
                className="group glass p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-between hover:bg-white/80 transition-all duration-300 cursor-pointer border border-white/60 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                  {/* Checkbox */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-indigo-100 flex items-center justify-center group-hover:border-indigo-400 transition-colors bg-white shrink-0">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-700 text-sm sm:text-base lg:text-lg group-hover:text-indigo-600 transition-colors truncate">
                      {t.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5">
                      <span className={`${t.color} text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider flex items-center gap-1 whitespace-nowrap`}>
                        <Tag size={9} /> {t.tag}
                      </span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={13} className="text-slate-300" /> {t.due}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons — visible on hover (desktop), always visible on mobile */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                  <button className="p-2 sm:p-3 hover:bg-indigo-50 rounded-xl sm:rounded-2xl text-slate-300 hover:text-indigo-500 transition-all">
                    <LinkIcon size={16} />
                  </button>
                  <button className="p-2 sm:p-3 hover:bg-slate-100 rounded-xl sm:rounded-2xl text-slate-300 hover:text-slate-500 transition-all">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">

          {/* Productivity Card */}
          <div className="glass p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-white/80 space-y-6 sm:space-y-8">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Productivity</h3>

            <div className="space-y-5 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Progress</span>
                  <span className="text-sm font-black text-indigo-500">65%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
                  <div className="bg-indigo-400 h-full rounded-full w-[65%] shadow-[0_0_12px_rgba(129,140,248,0.4)]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[["Study Time", "4.2h", "text-slate-700"], ["Streak", <>12 <span className="text-sm">🔥</span></>, "text-orange-500"]].map(([label, val, cls]) => (
                  <div key={label} className="bg-white/50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className={`text-lg sm:text-xl font-black ${cls} flex items-center gap-1`}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-3.5 sm:py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 text-sm sm:text-base">
              Start Focus Session <ChevronRight size={18} />
            </button>
          </div>

          {/* Next Deadline Card */}
          <div className="bg-[#D1D1FF]/20 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-[#D1D1FF]/40">
            <div className="flex items-center gap-3 text-indigo-600 mb-3 sm:mb-4">
              <Clock size={18} />
              <h4 className="font-bold text-sm sm:text-base">Next Deadline</h4>
            </div>
            <p className="text-indigo-900/60 font-medium text-xs sm:text-sm leading-relaxed">
              You have a <strong>Biology Quiz</strong> starting in 2 hours. Review your &quot;Photosynthesis&quot; notes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}