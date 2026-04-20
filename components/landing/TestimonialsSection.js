"use client";

const testimonials = [
  {
    name: "Amara Osei",
    role: "Biology Major, UG",
    avatar: "AO",
    avatarColor: "from-indigo-400 to-purple-500",
    quote:
      "ScholarSync completely changed how I study. The AI summaries save me hours every week and the flashcards actually make me remember things during exams. I went from Cs to As!",
    rating: 5,
    tag: "📚 Improved grades",
  },
  {
    name: "Kwame Mensah",
    role: "Pre-Med Student, KNUST",
    avatar: "KM",
    avatarColor: "from-pink-400 to-rose-500",
    quote:
      "As a pre-med student, I have mountains of content to cover. ScholarSync's document management and PDF summaries are a lifesaver. It's like having a personal study assistant.",
    rating: 5,
    tag: "⚡ Saves 5+ hrs/week",
  },
  {
    name: "Esi Boateng",
    role: "Law Student, UCC",
    avatar: "EB",
    avatarColor: "from-emerald-400 to-teal-500",
    quote:
      "The study progress tracker keeps me accountable. Seeing my daily streak grow is incredibly motivating. I love how everything — notes, tasks, flashcards — is in one clean place.",
    rating: 5,
    tag: "🎯 Stays consistent",
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-28 px-6">
      {/* Background accent */}
      <div className="absolute left-0 right-0 h-[600px] bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/30 -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-purple-500 bg-purple-50 px-4 py-1.5 rounded-full">
            Student Love
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              students everywhere
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Don't take our word for it — here's what real students say about ScholarSync.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              role="article"
              aria-label={`Testimonial from ${t.name}`}
              className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-3xl p-8 shadow-lg shadow-slate-100/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {/* Tag + Stars */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  {t.tag}
                </span>
                <StarRating count={t.rating} />
              </div>

              {/* Quote */}
              <blockquote className="text-slate-600 text-sm leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: "10,000+", label: "Active Students" },
            { value: "2M+", label: "Notes Generated" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "50+", label: "Universities" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
