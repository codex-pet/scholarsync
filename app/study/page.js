import { Flame, Target, TrendingUp, BookOpen, Zap } from "lucide-react";

export default function StudyCenter() {
  const stats = [
    { label: "Current Streak",  value: "15 Days", color: "text-[#D1D1FF]", icon: Flame      },
    { label: "Total Flashcards", value: "810",     color: "text-[#E2F0CB]", icon: Target     },
    { label: "Overall Mastery", value: "74%",      color: "text-[#FFD8BE]", icon: TrendingUp },
  ];

  const subjects = [
    {
      name: "Mathematics", mastery: 75, flashcards: 128, quizzes: 12,
      colorClass: "text-indigo-400", bgClass: "bg-[#D1D1FF]/20",
      btnClass: "bg-[#D1D1FF]/30 text-indigo-500 hover:bg-[#D1D1FF]/50",
    },
    {
      name: "History", mastery: 62, flashcards: 95, quizzes: 8,
      colorClass: "text-green-500", bgClass: "bg-[#E2F0CB]/40",
      btnClass: "bg-[#E2F0CB]/50 text-green-600 hover:bg-[#E2F0CB]/80",
    },
    {
      name: "Biology", mastery: 88, flashcards: 156, quizzes: 15,
      colorClass: "text-orange-400", bgClass: "bg-[#FFD8BE]/30",
      btnClass: "bg-[#FFD8BE]/40 text-orange-600 hover:bg-[#FFD8BE]/60",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8 lg:space-y-10 max-w-[1400px] mx-auto">

      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl text-slate-800 tracking-tight font-bold flex items-center gap-3">
          Study Center
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          Master your subjects with interactive flashcards and quizzes
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex justify-between items-center relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${stat.color} drop-shadow-sm`}>
                {stat.value}
              </h2>
            </div>
            <stat.icon
              size={40}
              className={`${stat.color} opacity-20 absolute right-5 sm:right-6 top-1/2 -translate-y-1/2`}
              strokeWidth={2}
            />
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {["Review All", "Daily Challenge", "Weak Areas"].map(label => (
          <button
            key={label}
            className="bg-white border border-slate-100 shadow-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-slate-500 hover:text-indigo-500 hover:border-indigo-100 transition-all"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Subjects Grid */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl text-slate-800 font-bold ml-1">Your Subjects</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {subjects.map((sub, i) => (
            <div
              key={i}
              className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col border border-white/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <div className={`p-3 sm:p-4 rounded-2xl ${sub.bgClass} ${sub.colorClass}`}>
                  <BookOpen size={22} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mastery</p>
                  <div className={`flex items-center gap-1 text-sm font-black ${sub.colorClass}`}>
                    <TrendingUp size={12} /> {sub.mastery}%
                  </div>
                </div>
              </div>

              <h4 className="text-lg sm:text-xl text-slate-800 mb-5 sm:mb-8 font-bold">{sub.name}</h4>

              <div className="grid grid-cols-2 gap-4 mb-5 sm:mb-8">
                {[["Flashcards", sub.flashcards], ["Quizzes", sub.quizzes]].map(([label, val]) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-700">{val}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-4 sm:space-y-6">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${sub.bgClass}`}
                    style={{ width: `${sub.mastery}%` }}
                  />
                </div>
                <button className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${sub.btnClass}`}>
                  <Zap size={16} /> Study Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}