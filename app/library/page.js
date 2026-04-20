import { FileText, Eye, Trash2, Upload } from "lucide-react";

export default function Library() {
  const docs = [
    { name: "World History Notes",     subject: "History",   status: "Ready",       time: "32h" },
    { name: "Biology Textbook Ch5",    subject: "Biology",   status: "Vectorizing", time: "32h" },
    { name: "Python Guide",            subject: "Comp Sci",  status: "Ready",       time: "32h" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Library</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Resource repository &amp; multi-modal support</p>
        </div>
        <button className="self-start sm:self-auto bg-[#D1D1FF]/40 px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold flex items-center gap-2 text-indigo-600 hover:bg-[#D1D1FF]/60 transition-colors text-sm sm:text-base whitespace-nowrap">
          <Upload size={18} /> Upload Document
        </button>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {docs.map((doc, i) => (
          <div key={i} className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] space-y-4 sm:space-y-6 hover:shadow-md transition-shadow">
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="p-3 sm:p-4 bg-indigo-50 rounded-2xl text-indigo-400 shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{doc.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{doc.subject}</p>
              </div>
            </div>

            <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest border-b border-slate-100 pb-4">
              <span>Mar 14, 2024</span>
              <span className="text-indigo-300">Expires in {doc.time}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                doc.status === 'Ready' ? 'bg-[#E2F0CB] text-green-700' : 'bg-orange-50 text-orange-600'
              }`}>
                {doc.status}
              </span>
              <div className="flex gap-3 sm:gap-4 text-slate-300">
                <button className="hover:text-indigo-500 transition-colors p-1" aria-label="Preview">
                  <Eye size={18} />
                </button>
                <button className="hover:text-red-400 transition-colors p-1" aria-label="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}