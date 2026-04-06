"use client";
import { CheckSquare, Clock, Link as LinkIcon, Plus, Calendar, Tag, ChevronRight, MoreVertical } from "lucide-react";

export default function Tasks() {
  const tasks = [
    { name: "Read Chapter 5 of Physics", tag: "Reading", due: "Today", color: "bg-[#D1D1FF]/30 text-indigo-600", priority: "High" },
    { name: "Complete Bio Assignment", tag: "Assignment", due: "Tomorrow", color: "bg-[#FFD8BE]/30 text-orange-600", priority: "Medium" },
    { name: "Study for Math Exam", tag: "Study", due: "Mar 27", color: "bg-[#E2F0CB]/40 text-green-700", priority: "High" },
  ];

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-10">
      
      {/* 1. Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl text-slate-800 tracking-tight font-bold">Daily Tasks</h1>
          <p className="text-slate-400 mt-2 font-medium">Manage your academic schedule and deadlines</p>
        </div>
        <div className="hidden md:flex gap-3">
          <div className="glass px-6 py-3 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-xl font-black text-indigo-500">12/15</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        
        {/* 2. Main Task List (Left Side) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* New Task Input Bar */}
          <div className="group relative transition-all">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Plus className="text-indigo-400" size={20} />
            </div>
            <input 
              placeholder="What's on your mind? Add a task..." 
              className="w-full py-6 px-16 rounded-[2rem] bg-white border border-transparent shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all text-slate-600 placeholder:text-slate-300 font-medium" 
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-500 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100">
              Add Task
            </button>
          </div>

          {/* Task Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Active Tasks</h3>
            {tasks.map((t, i) => (
              <div key={i} className="group glass p-6 rounded-[2.5rem] flex items-center justify-between hover:bg-white/80 transition-all duration-300 cursor-pointer border border-white/60 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-6">
                  {/* Checkbox circle */}
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-100 flex items-center justify-center group-hover:border-indigo-400 transition-colors bg-white">
                    <div className="w-4 h-4 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                  </div>
                  
                  <div>
                    <p className="font-bold text-slate-700 text-lg group-hover:text-indigo-600 transition-colors">{t.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`${t.color} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1`}>
                        <Tag size={10}/> {t.tag}
                      </span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-300"/> {t.due}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-3 hover:bg-indigo-50 rounded-2xl text-slate-400 hover:text-indigo-500 transition-all">
                      <LinkIcon size={18} />
                   </button>
                   <button className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all">
                      <MoreVertical size={18} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Analytics & Productivity (Right Side) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Stats Card */}
          <div className="glass p-8 rounded-[3rem] border border-white/80 space-y-8">
            <h3 className="text-xl font-bold text-slate-800">Productivity</h3>
            
            <div className="space-y-6">
               <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Progress</span>
                    <span className="text-sm font-black text-indigo-500">65%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
                    <div className="bg-indigo-400 h-full rounded-full w-[65%] shadow-[0_0_12px_rgba(129,140,248,0.4)]" />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 p-4 rounded-3xl border border-white">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Study Time</p>
                    <p className="text-xl font-black text-slate-700">4.2h</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-3xl border border-white">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Streak</p>
                    <p className="text-xl font-black text-orange-500 flex items-center gap-1">12 <span className="text-sm">🔥</span></p>
                  </div>
               </div>
            </div>

            <button className="w-full py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
              Start Focus Session <ChevronRight size={18}/>
            </button>
          </div>

          {/* Upcoming Card */}
          <div className="bg-[#D1D1FF]/20 p-8 rounded-[3rem] border border-[#D1D1FF]/40">
             <div className="flex items-center gap-3 text-indigo-600 mb-4">
                <Clock size={20}/>
                <h4 className="font-bold">Next Deadline</h4>
             </div>
             <p className="text-indigo-900/60 font-medium text-sm leading-relaxed">
               You have a <strong>Biology Quiz</strong> starting in 2 hours. Review your "Photosynthesis" notes!
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}