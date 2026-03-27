import { Sparkles, ArrowRight } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="bg-[#F3EFFF] p-8 rounded-4xl space-y-4">
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
        <Sparkles size={20} /> AI Assistant
      </div>
      <p className="text-sm text-indigo-900/60 font-medium leading-relaxed">
        Ask anything about your studies. Get instant explanations and summaries from your library.
      </p>
      <button className="w-full bg-white py-4 rounded-2xl font-bold text-indigo-600 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
        Open AI Studio <ArrowRight size={18} />
      </button>
    </div>
  );
}