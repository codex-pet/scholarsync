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
  const docs = [
    { title: "Biology 101", subject: "Biology", color: "bg-green-50", icon: "🌱" },
    { title: "Chemistry Notes", subject: "Chemistry", color: "bg-blue-50", icon: "🧪" },
    { title: "Literature Essay", subject: "Literature", color: "bg-orange-50", icon: "📖" },
    { title: "Python Basics", subject: "Programming", color: "bg-emerald-50", icon: "💻" },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
      {docs.map((doc, idx) => (
        <div
          key={idx}
          className="bg-white p-4 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${doc.color} flex items-center justify-center mb-4 sm:mb-6 text-lg sm:text-xl`}>
            {doc.icon}
          </div>
          <h3 className="font-bold text-slate-800 mb-1 text-sm sm:text-base">{doc.title}</h3>
          <p className="text-xs sm:text-sm text-slate-400">{doc.subject}</p>
        </div>
      ))}
    </div>
  );
}