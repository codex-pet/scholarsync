import { CheckSquare, Clock, Link as LinkIcon, Plus } from "lucide-react";

export default function Tasks() {
  const tasks = [
    { name: "Read Chapter 5 of Physics", tag: "Reading", due: "3/26/2026", color: "bg-[#D1D1FF]" },
    { name: "Complete Bio Assignment", tag: "Assignment", due: "3/25/2026", color: "bg-[#FFD8BE]" },
    { name: "Study for Math Exam", tag: "Study", due: "3/27/2026", color: "bg-[#E2F0CB]" },
  ];

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl">Tasks</h1>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 glass p-8 rounded-4xl">
          <div className="relative mb-10">
            <input placeholder="Add a new task..." className="w-full py-4 px-6 rounded-2xl bg-slate-50 outline-none pr-14" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E2F0CB] p-2 rounded-xl"><Plus /></button>
          </div>
          <div className="space-y-6">
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 cursor-pointer" />
                  <div>
                    <p className="font-bold text-slate-700">{t.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`${t.color} text-[10px] font-bold px-2 py-0.5 rounded-md`}>{t.tag}</span>
                      <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1"><Clock size={12} /> Due: {t.due}</span>
                    </div>
                  </div>
                </div>
                <LinkIcon size={18} className="text-slate-200 cursor-pointer hover:text-indigo-400" />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4 glass p-8 rounded-4xl">
          <h3 className="mb-6">Today&apos;s Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm"><span>Tasks Completed</span><span className="font-bold">4/8</span></div>
            <div className="flex justify-between text-sm"><span>Study Time</span><span className="font-bold">2h 30m</span></div>
            <div className="flex justify-between text-sm"><span>Streak</span><span className="font-bold text-orange-400">7 Days 🔥</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}