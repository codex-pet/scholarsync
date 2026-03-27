// components/RecentDocs.js
export default function RecentDocs() {
  const docs = [
    { title: "Biology 101", subject: "Biology", color: "bg-green-50", icon: "🌱" },
    { title: "Chemistry Notes", subject: "Chemistry", color: "bg-blue-50", icon: "🧪" },
    { title: "Literature Essay", subject: "Literature", color: "bg-orange-50", icon: "📖" },
    { title: "Python Basics", subject: "Programming", color: "bg-emerald-50", icon: "💻" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {docs.map((doc, idx) => (
        <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 hover:shadow-md transition-shadow cursor-pointer">
          <div className={`w-12 h-12 rounded-2xl ${doc.color} flex items-center justify-center mb-6 text-xl`}>
            {doc.icon}
          </div>
          <h3 className="font-bold text-slate-800 mb-1">{doc.title}</h3>
          <p className="text-sm text-slate-400">{doc.subject}</p>
        </div>
      ))}
    </div>
  );
}