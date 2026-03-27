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
          <h2 className="text-2xl text-slate-800">Recent Documents</h2>
          <RecentDocs />
          
          {/* Active Reading Card */}
          <div className="glass p-8 rounded-4xl space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="p-4 bg-lavender/20 rounded-2xl text-indigo-500">📖</div>
                <div>
                  <h3 className="text-xl">Biology 101</h3>
                  <p className="text-slate-400 text-sm">Chapter 5: Photosynthesis</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-peach/30 text-orange-600 px-3 py-1 rounded-full uppercase">Expires in 32h</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>READING PROGRESS</span>
                <span className="text-indigo-500">65%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-300 h-full w-[65%]" />
              </div>
            </div>
            <button className="w-full bg-lavender/30 text-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-lavender/50 transition-all">
              Continue Reading <ArrowRight size={18} />
            </button>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-sage/40 p-8 rounded-4xl glass flex flex-col items-center">
            <h3 className="self-start mb-8 text-lg">Daily Study Goal</h3>
            <ProgressRing percentage={87} />
          </div>
          <TaskList />
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}