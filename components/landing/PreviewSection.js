"use client";

function MockProgressRing({ pct }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" width="96" height="96">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="url(#ring-grad)" strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <p className="text-lg font-bold text-slate-800">{pct}%</p>
        <p className="text-[9px] text-slate-400">Goal</p>
      </div>
    </div>
  );
}

const recentDocs = [
  { icon: "📘", title: "Biology 101", sub: "Chapter 5 · 65% read", color: "bg-indigo-50", badge: "Science" },
  { icon: "⚖️", title: "Constitutional Law", sub: "Week 3 notes · Updated today", color: "bg-purple-50", badge: "Law" },
  { icon: "🧮", title: "Calculus II", sub: "Integration by parts", color: "bg-pink-50", badge: "Math" },
];

const tasks = [
  { label: "Finish Biology flashcards", done: true },
  { label: "Review Calculus chapter 7", done: true },
  { label: "Summarize Law textbook", done: false },
  { label: "Practice exam questions", done: false },
];

export default function PreviewSection() {
  return (
    <section id="preview" className="py-28 px-6 relative overflow-hidden">
      {/* Soft blurry bg accent */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/40 via-white/0 to-white/0" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-pink-500 bg-pink-50 px-4 py-1.5 rounded-full">
            Preview
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">
            Your dashboard,{" "}
            <span className="bg-gradient-to-r from-pink-500 to-indigo-600 bg-clip-text text-transparent">
              beautifully organized
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            A clean, distraction-free workspace built to keep you in flow.
          </p>
        </div>

        {/* Browser window mockup */}
        <div className="relative mx-auto max-w-5xl">
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 blur-3xl rounded-[3rem] -z-10" />

          {/* Browser chrome */}
          <div className="bg-slate-800 rounded-t-2xl px-4 py-3 flex items-center gap-2 shadow-2xl">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 mx-4 bg-slate-700 rounded-md px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400 text-xs">app.scholarsync.io/dashboard</span>
            </div>
          </div>

          {/* Dashboard UI inside */}
          <div className="bg-[#F8FAFC] rounded-b-2xl overflow-hidden shadow-2xl border border-t-0 border-slate-200/60">
            <div className="flex min-h-[480px]">
              {/* Mini Sidebar */}
              <div className="w-16 bg-white/80 backdrop-blur-md border-r border-slate-100 flex flex-col items-center py-5 gap-4 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm mb-2">✦</div>
                {["🏠","✨","📚","✅","📖"].map((icon, i) => (
                  <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all ${i === 0 ? "bg-indigo-500/10 text-indigo-600" : "text-slate-400 hover:bg-slate-100"}`}>
                    {icon}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 space-y-4 overflow-hidden">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Good morning, Scholar 👋</h3>
                    <p className="text-slate-400 text-xs">Monday, March 31 · 3 tasks pending</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">PA</div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  {/* Left column */}
                  <div className="col-span-8 space-y-3">
                    {/* Search bar */}
                    <div className="bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 flex items-center gap-2 text-slate-400 text-xs shadow-sm">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      Search documents, notes, flashcards...
                    </div>

                    {/* Recent Docs */}
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Recent Documents</p>
                    <div className="space-y-2">
                      {recentDocs.map((doc) => (
                        <div key={doc.title} className={`${doc.color} border border-white/60 rounded-2xl px-4 py-3 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer`}>
                          <span className="text-xl">{doc.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{doc.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{doc.sub}</p>
                          </div>
                          <span className="shrink-0 text-[9px] font-bold bg-white/70 text-slate-500 px-2 py-0.5 rounded-full">{doc.badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="col-span-4 space-y-3">
                    {/* Progress ring card */}
                    <div className="bg-white/80 border border-white/60 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                      <p className="text-[10px] font-bold text-slate-700 self-start mb-3">Daily Goal</p>
                      <MockProgressRing pct={87} />
                    </div>

                    {/* Task list */}
                    <div className="bg-white/80 border border-white/60 rounded-2xl p-4 shadow-sm space-y-2">
                      <p className="text-[10px] font-bold text-slate-700 mb-1">Tasks</p>
                      {tasks.map((t) => (
                        <div key={t.label} className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${t.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                            {t.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                          </div>
                          <span className={`text-[10px] leading-tight ${t.done ? "line-through text-slate-400" : "text-slate-600"}`}>{t.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
