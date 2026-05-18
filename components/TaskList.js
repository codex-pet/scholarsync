import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

export default function TaskList() {
  const tasks = [
    { title: "Review Chapter 3", completed: true },
    { title: "Complete Exercise Set A", completed: false },
  ];

  return (
    <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white/60 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-lg">Today&apos;s Tasks</h3>
          <span className="text-xs font-bold text-green-600 bg-green-100/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-green-200/50 shadow-sm">1/3</span>
        </div>
        
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <div key={i} className="flex items-center gap-3 group/task cursor-pointer p-2 -mx-2 rounded-xl hover:bg-white/50 transition-colors">
              {task.completed ? (
                <CheckCircle2 className="text-green-500 shadow-sm rounded-full" size={20} />
              ) : (
                <Circle className="text-slate-300 group-hover/task:text-indigo-400 transition-colors" size={20} />
              )}
              <span className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-semibold group-hover/task:text-indigo-600 transition-colors'}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
        
        <Link href="/tasks" className="mt-8 block text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors w-full text-center hover:translate-x-1">
          View All Tasks →
        </Link>
      </div>
    </div>
  );
}