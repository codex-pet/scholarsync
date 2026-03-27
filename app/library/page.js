import { FileText, Eye, Trash2, Upload } from "lucide-react";

export default function Library() {
  const docs = [
    { name: "World History Notes", subject: "History", status: "Ready", time: "32h" },
    { name: "Biology Textbook Ch5", subject: "Biology", status: "Vectorizing", time: "32h" },
    { name: "Python Guide", subject: "Comp Sci", status: "Ready", time: "32h" },
  ];

  return (
    <div className="p-10 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl">My Library</h1>
          <p className="text-slate-400">Resource repository & multi-modal support</p>
        </div>
        <button className="bg-[#D1D1FF]/40 px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
          <Upload size={20}/> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {docs.map((doc, i) => (
          <div key={i} className="glass p-8 rounded-4xl space-y-6">
            <div className="flex gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-400"><FileText/></div>
              <div><h3 className="text-lg">{doc.name}</h3><p className="text-xs text-slate-400">{doc.subject}</p></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest border-b pb-4">
              <span>Mar 14, 2024</span>
              <span className="text-indigo-300">Expires in {doc.time}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${doc.status === 'Ready' ? 'bg-[#E2F0CB] text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                {doc.status}
              </span>
              <div className="flex gap-4 text-slate-300"><Eye size={18}/><Trash2 size={18}/></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}