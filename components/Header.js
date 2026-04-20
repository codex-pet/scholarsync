import { CloudSnow } from "lucide-react";

export default function Header() {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-slate-800 mb-1 leading-tight">
          Good evening, Learner
        </h1>
        <p className="text-slate-400 font-medium text-sm sm:text-base">
          Ready to sync and grow today?
        </p>
        <div className="mt-4 sm:mt-6 flex items-start gap-3 bg-white/40 border border-white/60 px-4 sm:px-5 py-2.5 rounded-full w-fit shadow-sm max-w-full">
          <span className="text-base sm:text-lg shrink-0">💡</span>
          <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
            Pro tip: Break your learning into 25-minute focus sessions for maximum retention.
          </p>
        </div>
      </div>

      {/* Weather Widget — hidden on very small screens */}
      <div className="hidden sm:flex glass p-4 sm:p-5 rounded-3xl flex-col items-center gap-1 shrink-0 w-20 sm:w-24">
        <CloudSnow className="text-blue-300" size={28} />
        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
          Snowy
        </span>
      </div>
    </div>
  );
}