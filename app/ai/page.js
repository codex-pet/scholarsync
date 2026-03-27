"use client";
import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, Circle, Send, Sparkles, FileImage, ShieldCheck, Globe, LibraryBig, Lightbulb, Wand2 } from 'lucide-react';

export default function AIWorkspace() {
  const [isDragging, setIsDragging] = useState(false);
  const[isRagMode, setIsRagMode] = useState(true); 
  const fileInputRef = useRef(null);
  
  const[files, setFiles] = useState([
    { id: 1, name: "Biology_Ch5_Photosynthesis.pdf", size: "2.4 MB", type: "pdf", selected: false },
    { id: 2, name: "Chemistry_Lab_Notes.docx", size: "1.1 MB", type: "doc", selected: false },
    { id: 3, name: "Lecture_Board_Scan.jpg", size: "3.5 MB", type: "img", selected: false },
  ]);

  const toggleFileSelection = (id) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, selected: !file.selected } : file
    ));
  };

  // Drag, Drop, and Click-to-Upload Handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleFileSelect = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    console.log("Files selected:", uploadedFiles);
  };

  const selectedCount = files.filter(f => f.selected).length;
  const isInputDisabled = isRagMode && selectedCount === 0;

  const quickPrompts =[
    "Summarize key concepts",
    "Generate 5 flashcards",
    "Explain this simply",
    "Create a practice quiz"
  ];

  return (
    <div className="p-6 lg:p-8 h-screen flex flex-col gap-6 max-w-[1600px] mx-auto bg-[#FAF9F6]">
      
      {/* Header */}
      <header className="flex flex-col px-2">
        <h1 className="text-3xl lg:text-4xl text-[#2B3674] font-bold tracking-tight flex items-center gap-2">
          Study Buddy <Sparkles className="text-indigo-400" size={28} />
        </h1>
        <p className="text-slate-400 font-medium mt-1">Your personalized, AI-powered academic tutor</p>
      </header>

      {/* Asymmetrical Layout: 1/3 Knowledge Base, 2/3 Chat Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 pb-4">
        
        {/* ========================================== */}
        {/* LEFT PANE: Knowledge Base (33%)            */}
        {/* ========================================== */}
        <div className="lg:col-span-4 bg-white rounded-[32px] flex flex-col overflow-hidden h-full border border-slate-100 shadow-sm">
          
          <div className="p-6 flex items-center gap-3">
            <LibraryBig className="text-indigo-500" size={22} />
            <h2 className="font-bold text-[#2B3674] text-lg">Knowledge Base</h2>
          </div>
          
          <div className="flex-1 p-6 pt-0 overflow-y-auto custom-scrollbar flex flex-col gap-8">
            
            {/* Clickable Drag & Drop Upload Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`w-full border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                isDragging ? 'border-indigo-400 bg-indigo-50 scale-[1.02]' : 'border-[#D1D1FF]/60 bg-white hover:bg-slate-50'
              }`}
            >
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <UploadCloud size={32} className="text-indigo-500 mb-3" />
              <p className="font-bold text-[#2B3674] text-sm">Drag & Drop a file or Click to upload</p>
              <p className="text-slate-400 text-[11px] mt-1">PDF, DOCX, or Images(Max 10MB)</p>
            </div>

            {/* File Selection List */}
            <div className="space-y-4">
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
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-3 rounded-2xl shrink-0 bg-slate-50 text-slate-400 border border-slate-100">
                        {file.type === 'img' ? <FileImage size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="truncate pr-2">
                        <p className={`font-bold text-sm truncate ${file.selected ? 'text-[#2B3674]' : 'text-[#2B3674]/70'}`}>{file.name}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{file.size}</p>
                      </div>
                    </div>
                    <div className="shrink-0 pr-2">
                      {file.selected ? (
                        <CheckCircle2 className="text-green-500" size={24} />
                      ) : (
                        <Circle className="text-slate-200 group-hover:text-indigo-200 transition-colors" size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT PANE: Chat Workspace (66%)           */}
        {/* ========================================== */}
        <div className="lg:col-span-8 bg-white rounded-[32px] flex flex-col h-full border border-slate-100 shadow-sm relative overflow-hidden">
          
          {/* Header & Interactive RAG Button */}
          <div className="px-8 py-5 flex items-center justify-between z-10 border-b border-slate-50">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
               <h2 className="font-bold text-[#2B3674] text-lg">Assistant is ready</h2>
            </div>
            
            <button 
              onClick={() => setIsRagMode(!isRagMode)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm ${
                isRagMode ? 'bg-[#EAF5E4] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#DCECD6]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isRagMode ? <ShieldCheck size={16} /> : <Globe size={16} />}
              {isRagMode ? 'Grounded Mode' : 'Web Knowledge'}
            </button>
          </div>

          {/* RAG Note Positioned at the TOP */}
          {isRagMode && (
            <div className="bg-[#FAF9F6]/50 px-8 py-3 flex items-center gap-2 text-xs text-slate-500 font-medium border-b border-slate-50">
              <ShieldCheck size={16} className="text-green-500 shrink-0" />
              <span>Responses are strictly generated from your selected materials to ensure academic accuracy.</span>
            </div>
          )}
          
          {/* Spacious Chat Area */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col justify-center">
            
            <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
                {isRagMode ? (
                  <div className="w-full">
                    {selectedCount > 0 ? (
                      <div className="bg-[#FAF9F6] border border-slate-100 shadow-sm p-8 rounded-[32px] text-slate-600 text-center">
                        <Wand2 size={32} className="text-indigo-400 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2 text-[#2B3674]">
                          I am analyzing <strong className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{selectedCount} files</strong> from your Knowledge Base.
                        </p>
                        <p className="text-sm text-slate-500">What would you like to achieve in this study session?</p>
                      </div>
                    ) : (
                      <div className="bg-[#FFF8F3] border border-[#FFE0CC] p-10 rounded-[32px] flex flex-col items-center text-center max-w-xl mx-auto">
                        <Lightbulb className="text-[#FF8A65] mb-4" size={32} />
                        <p className="text-[#D84315] text-base font-medium mb-3">
                          Please select a file from the panel on the left so I can securely read your materials.
                        </p>
                        <p className="text-[#D84315]/70 text-sm">What would you like to achieve in this study session?</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 shadow-sm p-8 rounded-[32px] text-slate-600 text-center w-full max-w-xl mx-auto">
                    <Globe size={32} className="text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2 text-[#2B3674]">I am currently using my broad web knowledge.</p>
                    <p className="text-sm text-slate-500">I am not restricting my answers to your uploaded files. Ask me anything!</p>
                  </div>
                )}
            </div>
          </div>

          {/* Bottom Input Section */}
          <div className="p-6 lg:p-8 flex flex-col gap-4">
            
            {/* Quick Prompt Pills */}
            <div className="flex flex-wrap gap-3 mb-1">
              {quickPrompts.map((prompt, idx) => (
                <button 
                  key={idx}
                  className="text-[13px] font-bold bg-white px-5 py-2.5 rounded-full text-[#5B61F4] border border-[#D1D1FF] shadow-sm hover:bg-[#F3F4FF] transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Sized-Down Input Bar */}
            <div className="relative">
              <input 
                placeholder={isRagMode ? (selectedCount > 0 ? "Ask a question about your materials..." : "Waiting for file selection...") : "Ask me anything..."}
                disabled={isInputDisabled}
                className="w-full py-4 px-6 rounded-full bg-[#F8FAFC] border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all text-sm font-medium pr-16 text-slate-700 placeholder:text-slate-400 disabled:opacity-60" 
              />
              <button 
                disabled={isInputDisabled}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#B4B9FF] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:bg-[#9FA6FF] transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}