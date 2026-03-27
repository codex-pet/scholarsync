import { CloudSnow } from "lucide-react";

export default function Header() {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-4xl text-slate-800 mb-1">Good evening, Learner</h1>
        <p className="text-slate-400 font-medium">Ready to sync and grow today?</p>
        <div className="mt-6 flex items-center gap-3 bg-white/40 border border-white/60 px-5 py-2.5 rounded-full w-fit shadow-sm">
          <span className="text-lg">💡</span>
          <p className="text-xs text-slate-500 font-medium italic">
            Pro tip: Break your learning into 25-minute focus sessions for maximum retention.
          </p>
        </div>
      </div>
      <div className="glass p-5 rounded-4xl flex flex-col items-center gap-1 w-24">
        <CloudSnow className="text-blue-300" size={36} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Snowy</span>
      </div>
    </div>
  );
}