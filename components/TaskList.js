import { CheckCircle2, Circle } from "lucide-react";

export default function TaskList() {
  const tasks = [
    { title: "Review Chapter 3",       completed: true  },
    { title: "Complete Exercise Set A", completed: false },
  ];

  return (
    <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-50">
      <div className="flex justify-between items-center mb-5 sm:mb-6">
        <h3 className="font-bold text-slate-800 text-base sm:text-lg">Today&apos;s Tasks</h3>
        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">1/3</span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-center gap-3 group cursor-pointer">
            {task.completed ? (
              <CheckCircle2 className="text-green-400 shrink-0" size={20} />
            ) : (
              <Circle className="text-slate-200 group-hover:text-indigo-300 shrink-0 transition-colors" size={20} />
            )}
            <span className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-600 font-medium'}`}>
              {task.title}
            </span>
          </div>
        ))}
      </div>

      <button className="mt-6 sm:mt-8 text-sm font-bold text-slate-400 hover:text-indigo-500 transition-colors w-full text-center">
        View All Tasks →
      </button>
    </div>
  );
}