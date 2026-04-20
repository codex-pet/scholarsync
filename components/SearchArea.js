import { Search, Sparkles } from "lucide-react";

export default function SearchArea() {
  const suggestions = [
    "Explain photosynthesis",
    "Create flashcards for biology",
    "Summarize this PDF",
    "Help me study for my exam"
  ];

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Search className="absolute left-5 sm:left-7 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input
          type="text"
          placeholder="What should we learn today?"
          className="w-full bg-white py-4 sm:py-6 pl-12 sm:pl-16 pr-12 sm:pr-16 rounded-full shadow-sm border-none focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-600 placeholder:text-slate-300 text-sm sm:text-base"
        />
        <Sparkles className="absolute right-5 sm:right-7 top-1/2 -translate-y-1/2 text-indigo-200" size={18} />
      </div>

      {/* Suggestion chips — horizontal scroll on mobile */}
      <div className="flex gap-2 sm:gap-3 px-1 overflow-x-auto pb-1 no-scrollbar">
        {suggestions.map((text) => (
          <button
            key={text}
            className="bg-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium text-slate-500 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all whitespace-nowrap shrink-0"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}