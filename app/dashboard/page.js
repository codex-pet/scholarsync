import Header from "@/components/Header";
import SearchArea from "@/components/SearchArea";
import RecentDocs from "@/components/RecentDocs";
import ProgressRing from "@/components/ProgressRing";
import TaskList from "@/components/TaskList";
import AIAssistant from "@/components/AIAssistant";
import { ArrowRight, BookOpen, BrainCircuit, CheckSquare, Sparkles } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto">
      <Header />
      <SearchArea />

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Library & Study */}
        <div className="col-span-12 lg:col-span-8 space-y-10">

          {/* Library Section */}
          <section id="library-section" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <BookOpen className="text-indigo-500" size={24} /> My Library
              </h2>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
            </div>
            <RecentDocs />
          </section>

          {/* Study Section */}
          <section id="study-section" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <BrainCircuit className="text-purple-500" size={24} /> Continued Study
            </h2>

            {/* Active Reading Card with Glass Effect */}
            <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
          </section>
        </div>

        {/* Right Column: Tasks & AI */}
        <div className="col-span-12 lg:col-span-4 space-y-10">

          {/* Study Goal / Progress Section */}
          <section id="progress-section" className="bg-emerald-500/5 backdrop-blur-md border border-white/60 p-8 rounded-[2.5rem] flex flex-col items-center shadow-sm">
            <h3 className="self-start mb-8 text-lg font-bold text-slate-800">Daily Study Goal</h3>
            <ProgressRing percentage={87} />
          </section>

          {/* Tasks Section */}
          <section id="tasks-section" className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
              <CheckSquare className="text-emerald-500" size={20} /> Today's Tasks
            </h2>
            <TaskList />
          </section>

          {/* AI Section */}
          <section id="ai-section" className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Sparkles className="text-indigo-400" size={20} /> Quick AI Help
            </h2>
            <AIAssistant />
          </section>
        </div>
      </div>
    </div>
  );
}

