"use client";
import { useState, useRef } from 'react';
import {
  UploadCloud, FileText, CheckCircle2, Circle, Send, Sparkles,
  FileImage, ShieldCheck, Globe, LibraryBig, Lightbulb, Wand2, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

export default function AIWorkspace() {
  const [isDragging, setIsDragging] = useState(false);
  const [isRagMode, setIsRagMode] = useState(true);
  const [leftPaneOpen, setLeftPaneOpen] = useState(false); // mobile collapsible
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([
    { id: 1, name: "Biology_Ch5_Photosynthesis.pdf", size: "2.4 MB", type: "pdf", selected: false },
    { id: 2, name: "Chemistry_Lab_Notes.docx",      size: "1.1 MB", type: "doc", selected: false },
    { id: 3, name: "Lecture_Board_Scan.jpg",         size: "3.5 MB", type: "img", selected: false },
  ]);

  const toggleFileSelection = (id) =>
    setFiles(files.map(f => f.id === id ? { ...f, selected: !f.selected } : f));

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleFileSelect = (e) => console.log("Files selected:", Array.from(e.target.files));

  const selectedCount   = files.filter(f => f.selected).length;
  const isInputDisabled = isRagMode && selectedCount === 0;

  const quickPrompts = [
    "Summarize key concepts",
    "Generate 5 flashcards",
    "Explain this simply",
    "Create a practice quiz",
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-4rem)] lg:h-screen flex flex-col gap-4 sm:gap-6 max-w-[1600px] mx-auto">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#2B3674] font-bold tracking-tight flex items-center gap-2">
            Study Buddy <Sparkles className="text-indigo-400 shrink-0" size={24} />
          </h1>
          <p className="text-slate-400 font-medium mt-1 text-sm sm:text-base">
            Your personalized, AI-powered academic tutor
          </p>
        </div>

        {/* Mobile: toggle Knowledge Base panel */}
        <button
          className="lg:hidden p-2.5 rounded-xl bg-white/60 border border-white/60 text-slate-500 hover:text-indigo-600 transition-colors"
          onClick={() => setLeftPaneOpen(p => !p)}
          aria-label={leftPaneOpen ? "Hide knowledge base" : "Show knowledge base"}
        >
          {leftPaneOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 min-h-0">

        {/* ── LEFT: Knowledge Base ── */}
        <div className={`
          lg:col-span-4 bg-white/40 backdrop-blur-xl border border-white/60
          shadow-[0_8px_32px_rgba(31,38,135,0.06)] rounded-[2rem] flex flex-col overflow-hidden
          transition-all duration-300
          ${leftPaneOpen ? 'max-h-[50vh]' : 'max-h-0 overflow-hidden'}
          lg:max-h-full lg:overflow-visible
        `}>
          <div className="p-5 sm:p-6 flex items-center gap-3 border-b border-white/40">
            <LibraryBig className="text-indigo-500 shrink-0" size={22} />
            <h2 className="font-bold text-[#2B3674] text-base sm:text-lg">Knowledge Base</h2>
          </div>

          <div className="flex-1 p-5 sm:p-6 pt-0 overflow-y-auto custom-scrollbar flex flex-col gap-6 sm:gap-8">
            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`w-full border-2 border-dashed rounded-[2rem] p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                isDragging ? 'border-indigo-400 bg-indigo-50 scale-[1.02]' : 'border-[#D1D1FF]/60 bg-white hover:bg-slate-50'
              }`}
            >
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <UploadCloud size={28} className="text-indigo-500 mb-3" />
              <p className="font-bold text-[#2B3674] text-sm">Drag & Drop or Click to upload</p>
              <p className="text-slate-400 text-[11px] mt-1">PDF, DOCX, or Images (Max 10MB)</p>
            </div>

            {/* File List */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center ml-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Context</h3>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-widest">
                  {selectedCount} Selected
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => toggleFileSelection(file.id)}
                    className="flex items-center justify-between cursor-pointer group p-2 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 sm:p-3 rounded-2xl shrink-0 bg-slate-50 text-slate-400 border border-slate-100">
                        {file.type === 'img' ? <FileImage size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="truncate pr-2">
                        <p className={`font-bold text-xs sm:text-sm truncate ${file.selected ? 'text-[#2B3674]' : 'text-[#2B3674]/70'}`}>
                          {file.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{file.size}</p>
                      </div>
                    </div>
                    <div className="shrink-0 pr-1 sm:pr-2">
                      {file.selected
                        ? <CheckCircle2 className="text-green-500" size={22} />
                        : <Circle className="text-slate-200 group-hover:text-indigo-200 transition-colors" size={22} />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Chat Workspace ── */}
        <div className="lg:col-span-8 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.06)] rounded-[2rem] flex flex-col min-h-0 overflow-hidden">

          {/* Chat Header */}
          <div className="px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-slate-50 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" />
              <h2 className="font-bold text-[#2B3674] text-sm sm:text-lg truncate">Assistant is ready</h2>
            </div>
            <button
              onClick={() => setIsRagMode(!isRagMode)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm shrink-0 ${
                isRagMode
                  ? 'bg-[#EAF5E4] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#DCECD6]'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isRagMode ? <ShieldCheck size={14} /> : <Globe size={14} />}
              <span className="hidden sm:inline">{isRagMode ? 'Grounded Mode' : 'Web Knowledge'}</span>
            </button>
          </div>

          {isRagMode && (
            <div className="bg-white/20 px-5 sm:px-8 py-2.5 flex items-center gap-2 text-xs text-slate-500 font-medium border-b border-white/30">
              <ShieldCheck size={14} className="text-green-500 shrink-0" />
              <span>Responses are strictly generated from your selected materials to ensure academic accuracy.</span>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-center min-h-0">
            <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
              {isRagMode ? (
                selectedCount > 0 ? (
                  <div className="bg-white/40 border border-white/60 backdrop-blur-md shadow-sm p-6 sm:p-8 rounded-[2rem] text-slate-600 text-center w-full">
                    <Wand2 size={28} className="text-indigo-400 mx-auto mb-4" />
                    <p className="text-base sm:text-lg font-medium mb-2 text-[#2B3674]">
                      Analyzing <strong className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{selectedCount} files</strong> from your Knowledge Base.
                    </p>
                    <p className="text-sm text-slate-500">What would you like to achieve in this study session?</p>
                  </div>
                ) : (
                  <div className="bg-[#FFF8F3] border border-[#FFE0CC] p-8 sm:p-10 rounded-[2rem] flex flex-col items-center text-center w-full max-w-xl mx-auto">
                    <Lightbulb className="text-[#FF8A65] mb-4" size={28} />
                    <p className="text-[#D84315] text-sm sm:text-base font-medium mb-2">
                      Please select a file from the panel so I can securely read your materials.
                    </p>
                    <p className="text-[#D84315]/70 text-sm">What would you like to achieve in this study session?</p>
                  </div>
                )
              ) : (
                <div className="bg-slate-50 border border-slate-100 shadow-sm p-6 sm:p-8 rounded-[2rem] text-slate-600 text-center w-full max-w-xl mx-auto">
                  <Globe size={28} className="text-slate-400 mx-auto mb-4" />
                  <p className="text-base sm:text-lg font-medium mb-2 text-[#2B3674]">Using broad web knowledge.</p>
                  <p className="text-sm text-slate-500">Not restricting answers to your uploaded files. Ask me anything!</p>
                </div>
              )}
            </div>
          </div>

          {/* Input Section */}
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4">
            {/* Quick Prompts — scrollable on mobile */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="text-[11px] sm:text-[13px] font-bold bg-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[#5B61F4] border border-[#D1D1FF] shadow-sm hover:bg-[#F3F4FF] transition-all whitespace-nowrap shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="relative">
              <input
                placeholder={isRagMode
                  ? (selectedCount > 0 ? "Ask a question about your materials..." : "Waiting for file selection...")
                  : "Ask me anything..."}
                disabled={isInputDisabled}
                className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-full bg-white/60 backdrop-blur-md border border-white/60 outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white/80 transition-all text-sm font-medium pr-14 sm:pr-16 text-slate-700 placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                disabled={isInputDisabled}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#B4B9FF] text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm hover:bg-[#9FA6FF] transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}