"use client";

const features = [
  {
    icon: "✨",
    color: "from-indigo-500/20 to-purple-500/10",
    border: "border-indigo-200/60",
    iconBg: "bg-indigo-500/10",
    iconText: "text-indigo-600",
    badge: "AI-Powered",
    badgeColor: "bg-indigo-50 text-indigo-600",
    title: "AI-Powered Summaries",
    description:
      "Upload any PDF or paste text and get instant, intelligent summaries. Our AI distills complex content into clear, concise notes tailored to your learning style.",
    stats: "10x faster",
    statsLabel: "than manual notes",
  },
  {
    icon: "🃏",
    color: "from-pink-500/20 to-rose-500/10",
    border: "border-pink-200/60",
    iconBg: "bg-pink-500/10",
    iconText: "text-pink-600",
    badge: "Smart",
    badgeColor: "bg-pink-50 text-pink-600",
    title: "Flashcard Generation",
    description:
      "Automatically generate study flashcards from your notes, documents, or any topic. Spaced repetition keeps information in your long-term memory.",
    stats: "3x better",
    statsLabel: "memory retention",
  },
  {
    icon: "📈",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-200/60",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600",
    badge: "Analytics",
    badgeColor: "bg-emerald-50 text-emerald-600",
    title: "Study Progress Tracking",
    description:
      "Visualize your daily study streaks, set goals, and track completion. Stay motivated with progress rings, task completion, and weekly insights.",
    stats: "87%",
    statsLabel: "avg goal completion",
  },
  {
    icon: "📂",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-200/60",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600",
    badge: "Organized",
    badgeColor: "bg-amber-50 text-amber-600",
    title: "Smart Document Management",
    description:
      "Keep all your study materials organized in one place. Smart tagging, full-text search, and automatic categorization make finding anything instant.",
    stats: "Everything",
    statsLabel: "in one place",
  },
];

function FeatureCard({ feature, index }) {
  return (
    <div
      role="article"
      aria-label={feature.title}
      className={`group relative bg-gradient-to-br ${feature.color} border ${feature.border} backdrop-blur-sm rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-200`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Icon */}
      <div aria-hidden="true" className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {feature.icon}
      </div>

      {/* Badge */}
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${feature.badgeColor} mb-4 inline-block`}>
        {feature.badge}
      </span>

      {/* Title */}
      <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>

      {/* Description */}
      <p className="text-slate-500 text-sm leading-relaxed mb-6">{feature.description}</p>

      {/* Stats */}
      <div className="border-t border-white/40 pt-5">
        <span className={`text-2xl font-bold ${feature.iconText}`}>{feature.stats}</span>
        <span className="text-slate-400 text-xs font-medium ml-2">{feature.statsLabel}</span>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              study smarter
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            ScholarSync brings together powerful AI tools and intuitive organization so you can focus on what matters — learning.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
