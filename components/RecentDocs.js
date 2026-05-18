"use client";
import { useEffect, useState } from "react";
import { loadFilesLocally } from "../lib/indexeddb";
import { FileText, FileImage, UploadCloud } from "lucide-react";
import Link from "next/link";

const FILE_COLORS = [
  "bg-indigo-500/10 text-indigo-600 border-indigo-100",
  "bg-green-500/10 text-green-600 border-green-100",
  "bg-purple-500/10 text-purple-600 border-purple-100",
  "bg-orange-500/10 text-orange-600 border-orange-100",
];

export default function RecentDocs() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilesLocally()
      .then(f => setFiles(f.slice(-4).reverse())) // last 4, newest first
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white/30 rounded-[2rem] h-28 animate-pulse border border-white/40" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Link href="/library" className="flex flex-col items-center justify-center bg-white/30 backdrop-blur-md border-2 border-dashed border-white/50 rounded-[2rem] p-10 text-center hover:bg-white/40 transition-all group">
        <UploadCloud size={36} className="text-indigo-300 mb-3 group-hover:text-indigo-500 transition-colors" />
        <p className="font-bold text-slate-600">No files yet</p>
        <p className="text-sm text-slate-400 mt-1">Go to Library to upload your study materials →</p>
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
      {files.map((file, idx) => (
        <Link
          href="/library"
          key={file.id}
          className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-white/60 hover:shadow-xl hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-start gap-3">
            <div className={`p-2.5 rounded-xl border ${FILE_COLORS[idx % FILE_COLORS.length]} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              {file.type === 'img' ? <FileImage size={20} /> : <FileText size={20} />}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors text-sm">{file.name}</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{file.size} · {file.pages || 1} {file.pages === 1 ? 'page' : 'pages'}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}