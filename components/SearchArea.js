import { Search, Sparkles } from "lucide-react";

export default function SearchArea() {
  const suggestions = [
    "Explain photosynthesis",
    "Create flashcards for biology",
    "Summarize this PDF",
    "Help me study for my exam"
  ];

  return (
    <div className="space-y-5">
      <div className="relative group">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder="What should we learn today?"
          className="w-full bg-white py-6 px-16 rounded-full shadow-sm border-none focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-600 placeholder:text-slate-300"
        />
        <Sparkles className="absolute right-7 top-1/2 -translate-y-1/2 text-indigo-200" size={20} />
      </div>

      <div className="flex flex-wrap gap-3 px-2">
        {suggestions.map((text) => (
          <button key={text} className="bg-white px-6 py-2.5 rounded-full text-sm font-medium text-slate-500 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}