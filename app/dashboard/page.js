import Header from "@/components/Header";
import SearchArea from "@/components/SearchArea";
import RecentDocs from "@/components/RecentDocs";
import ProgressRing from "@/components/ProgressRing";
import TaskList from "@/components/TaskList";
import AIAssistant from "@/components/AIAssistant";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto">
      <Header />
      <SearchArea />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <h2 className="text-2xl font-semibold text-slate-800">Recent Documents</h2>
          <RecentDocs />

          {/* Active Reading Card with Glass Effect */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 text-2xl">📖</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Biology 101</h3>
                  <p className="text-slate-500 text-sm">Chapter 5: Photosynthesis</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-wider">Expires in 32h</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 tracking-widest">
                <span>READING PROGRESS</span>
                <span className="text-indigo-500">65%</span>
              </div>
              <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Continue Reading <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-emerald-500/5 backdrop-blur-md border border-white/60 p-8 rounded-[2.5rem] flex flex-col items-center shadow-sm">
            <h3 className="self-start mb-8 text-lg font-bold text-slate-800">Daily Study Goal</h3>
            <ProgressRing percentage={87} />
          </div>
          <TaskList />
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}
