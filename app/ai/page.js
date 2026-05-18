"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  UploadCloud, FileText, CheckCircle2, Circle, Send, Sparkles,
  FileImage, ShieldCheck, Globe, LibraryBig, Lightbulb, Wand2,
  Loader2, Square, Edit3, Copy, Check, X, ExternalLink,
  ZoomIn, ZoomOut, Trash2, AlertTriangle, BookOpen, RotateCcw,
  MessageSquarePlus, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { saveFileLocally, loadFilesLocally, saveChatSession, loadChatSession, deleteChatSession } from '../../lib/indexeddb';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- Utility helpers ---
const FILE_BADGE = {
  pdf: { label: 'PDF', cls: 'bg-red-50 text-red-600 border-red-200' },
  img: { label: 'IMG', cls: 'bg-sky-50 text-sky-600 border-sky-200' },
  png: { label: 'PNG', cls: 'bg-sky-50 text-sky-600 border-sky-200' },
  jpg: { label: 'JPG', cls: 'bg-sky-50 text-sky-600 border-sky-200' },
  doc: { label: 'DOC', cls: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
};
const getBadge = (type) => FILE_BADGE[type] || FILE_BADGE.doc;
const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const fileSizeMB = (s) => parseFloat(s) || 0;

export default function AIWorkspace() {
  const [isDragging, setIsDragging] = useState(false);
  const [isRagMode, setIsRagMode] = useState(true);
  const [leftPaneOpen, setLeftPaneOpen] = useState(false); // mobile collapsible

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const shouldAbortRef = useRef(false);
  const [files, setFiles] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Derived: which file is currently selected
  const selectedFile = files.find(f => f.selected) || null;

  // PDF & Highlight State
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [highlightedText, setHighlightedText] = useState("");
  const [popupPosition, setPopupPosition] = useState(null);
  const previewContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setHighlightedText(selection.toString().trim());
        
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const containerRect = previewContainerRef.current?.getBoundingClientRect();
          
          if (containerRect) {
            const container = previewContainerRef.current;
            setPopupPosition({
              x: rect.left - containerRect.left + container.scrollLeft + (rect.width / 2),
              y: Math.max(10, rect.top - containerRect.top + container.scrollTop - 10) // Account for scroll position
            });
          }
        }
      } else {
        setHighlightedText("");
        setPopupPosition(null);
      }
    }, 50); // slight delay to allow selection API to update
  };

  const handleHighlightAction = (actionPrefix) => {
    handleSendMessage(`${actionPrefix}:\n\n"${highlightedText}"`);
    setHighlightedText("");
    setPopupPosition(null);
    window.getSelection().removeAllRanges();
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  useEffect(() => {
    const loadFiles = async () => {
      try {
        // Read IDs hidden for this session only
        const excluded = JSON.parse(sessionStorage.getItem('ss_ai_excluded_files') || '[]');

        const loaded = await loadFilesLocally();
        const decorated = await Promise.all(
          loaded
            .filter(f => !excluded.includes(f.id))
            .map(async (file) => {
              let actualPages = file.pages;
              if ((file.type === 'pdf' || file.name.endsWith('.pdf')) && file.base64 && (!file.pages || file.pages > 15)) {
                try {
                  const byteCharacters = atob(file.base64);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
                  const byteArray = new Uint8Array(byteNumbers);
                  const pdf = await pdfjs.getDocument({ data: byteArray }).promise;
                  actualPages = pdf.numPages;
                  saveFileLocally({ ...file, pages: actualPages }).catch(console.error);
                } catch (e) { console.error('Failed to parse PDF page count', e); }
              }
              return { ...file, pages: actualPages || 1, selected: false };
            })
        );
        setFiles(decorated);
      } catch (err) {
        console.error('Failed to load local files', err);
      }
    };
    loadFiles();
  }, []);

  // Load chat history when selected file changes
  useEffect(() => {
    if (!selectedFile) { setMessages([]); return; }
    loadChatSession(selectedFile.id).then(session => {
      setMessages(session?.messages || []);
    }).catch(() => setMessages([]));
  }, [selectedFile?.id]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (selectedFile && messages.length > 0) {
      saveChatSession({ fileId: selectedFile.id, messages, updatedAt: Date.now() }).catch(console.error);
    }
  }, [messages]);

  useEffect(() => {
    if (!previewContainerRef.current || !previewFile) return;
    
    const updateWidth = () => {
      if (previewContainerRef.current) {
        const width = previewContainerRef.current.clientWidth - 48; // subtract padding
        setContainerWidth(width > 0 ? width : null);
      }
    };

    updateWidth();
    
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    
    resizeObserver.observe(previewContainerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [previewFile]);

  const openPreview = (file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(file);
    if (file.base64) {
      try {
        const byteCharacters = atob(file.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: file.mimeType || 'application/pdf'});
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (e) {
         console.error(e);
         setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const toggleFileSelection = (id) => {
    setFiles(files.map(file => ({
      ...file,
      selected: file.id === id ? !file.selected : false
    })));
  };

  // Hide a file for this session only (sessionStorage). File stays in Library.
  const removeFileFromSession = (e, id) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
    if (previewFile?.id === id) closePreview();
    try {
      const excluded = JSON.parse(sessionStorage.getItem('ss_ai_excluded_files') || '[]');
      if (!excluded.includes(id)) {
        sessionStorage.setItem('ss_ai_excluded_files', JSON.stringify([...excluded, id]));
      }
    } catch (err) {
      console.error('sessionStorage write failed', err);
    }
  };

  // Clear the current chat conversation
  const handleClearChat = async () => {
    setMessages([]);
    if (selectedFile) {
      await saveChatSession({ fileId: selectedFile.id, messages: [], updatedAt: Date.now() }).catch(console.error);
    }
  };

  const processFiles = async (newFiles) => {
    setIsUploading(true);
    try {
      const filePromises = newFiles.map(file => {
        const fileExt = file.name.split('.').pop().toLowerCase();
        return new Promise(async (resolve) => {
          let actualPages = 1;
          if (fileExt === 'pdf' || file.type.includes('pdf')) {
            try {
              const arrayBuffer = await file.arrayBuffer();
              const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
              actualPages = pdf.numPages;
            } catch (e) {
              console.error("Error reading PDF pages", e);
            }
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            let uiType = 'doc';
            if (file.type.includes('image')) uiType = 'img';
            else if (file.type.includes('pdf') || file.name.endsWith('.pdf')) uiType = 'pdf';

            resolve({
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
              type: uiType,
              mimeType: file.type || 'application/pdf',
              base64: base64Data,
              pages: actualPages,
              selected: true,
              createdAt: Date.now()
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const processed = await Promise.all(filePromises);
      for (const p of processed) {
        await saveFileLocally(p);
      }
      setFiles(prev => [...prev, ...processed]);
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    if (e.dataTransfer.files?.length > 0) processFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileSelect = (e) => {
    if (e.target.files?.length > 0) processFiles(Array.from(e.target.files));
  };

  const selectedCount = files.filter(f => f.selected).length;
  const isInputDisabled = isRagMode && selectedCount === 0;

  const handleStopGeneration = () => {
    shouldAbortRef.current = true;
    setIsTyping(false);
  };

  const handleEditMessage = (index) => {
    const messageToEdit = messages[index];
    setInputValue(messageToEdit.content);
    setMessages(prev => prev.slice(0, index));
  };

  const handleSendMessage = async (textOrEvent) => {
    if (textOrEvent?.preventDefault) textOrEvent.preventDefault();
    
    const prompt = typeof textOrEvent === 'string' ? textOrEvent : inputValue;
    if (!prompt.trim() || isInputDisabled) return;

    setMessages(prev => [...prev, { role: 'user', content: prompt, timestamp: Date.now() }]);
    setInputValue('');
    setIsTyping(true);
    setShowQuickPrompts(false);

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Smart Action Interception
    if (prompt === "Generate 5 flashcards" || prompt === "Create a practice quiz") {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const chat = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const isFlashcards = prompt.includes("flashcards");
        const actionText = isFlashcards ? "exactly 5 flashcards" : "exactly 5 quiz questions";
        const formatString = isFlashcards ? 
          `{"flashcards": [{"q": "Question", "a": "Answer"}]}` : 
          `{"quiz": [{"question": "Q text", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}]}`;
          
        const systemPrompt = `You are an expert educator. Based ONLY on the provided documents, generate ${actionText}. Return STRICTLY a raw JSON object with this exact structure: ${formatString}. Do not include markdown formatting. Return only JSON.`;
        
        let finalParts = [{ text: systemPrompt }];
        if (isRagMode) {
          const selectedFiles = files.filter(f => f.selected);
          for (const file of selectedFiles) {
             if (file.base64) {
               finalParts.push({ inlineData: { data: file.base64, mimeType: file.mimeType } });
             }
          }
        }

        shouldAbortRef.current = false;
        const result = await chat.generateContent(finalParts);
        if (shouldAbortRef.current) return;

        let responseText = result.response.text();
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(responseText);
        
        const targetFile = files.find(f => f.selected);
        if (targetFile) {
           const { loadStudySetsLocally, saveStudySetLocally } = await import('../../lib/indexeddb');
           const existingSets = await loadStudySetsLocally();
           const existingSet = existingSets.find(s => s.fileId === targetFile.id) || { fileId: targetFile.id, fileName: targetFile.name, flashcards: [], quiz: [], createdAt: Date.now() };
           
           if (isFlashcards) {
             existingSet.flashcards = [...(existingSet.flashcards || []), ...parsedData.flashcards];
           } else {
             existingSet.quiz = [...(existingSet.quiz || []), ...parsedData.quiz];
           }
           await saveStudySetLocally(existingSet);
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          isWidget: true,
          widgetType: isFlashcards ? 'flashcards' : 'quiz',
          content: `I've successfully generated ${isFlashcards ? '5 flashcards' : 'a practice quiz'} based on your material and saved them directly to your Study Center!`,
          timestamp: Date.now()
        }]);

      } catch (err) {
        let errorMsg = "Sorry, I couldn't generate that correctly. Please make sure you have selected a valid file.";
        if (err.message && err.message.includes("429")) {
          errorMsg = "Oops! We're talking a little too fast. Google's free AI limit restricts us to 20 actions per minute. Please wait just a few seconds and try again!";
        }
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, timestamp: Date.now() }]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is missing. Please check your .env.local file.");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: isRagMode 
          ? `You are an expert academic tutor. You are in 'Grounded Mode'. You must strictly answer questions using ONLY the context provided by the user's selected files. Do not use outside knowledge. If the answer is not within the provided context, state clearly that the provided documents do not contain the answer. IMPORTANT: Do NOT use any Markdown formatting (no asterisks, no hashes, no symbols). Output your response as formal, plain text paragraphs.`
          : `You are a highly knowledgeable, friendly, and helpful academic assistant. Provide detailed and accurate information to assist the student with their studies. IMPORTANT: Do NOT use any Markdown formatting (no asterisks, no hashes, no symbols). Output your response as formal, plain text paragraphs.`
      });

      const history = messages.filter(m => !m.isWidget).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({ history });

      let finalParts = [{ text: prompt }];
      if (isRagMode) {
        const activeFiles = files.filter(f => f.selected);
        for (const file of activeFiles) {
          if (file.base64) {
            finalParts.push({
              inlineData: { data: file.base64, mimeType: file.mimeType }
            });
          }
        }
      }

      shouldAbortRef.current = false;
      const result = await chat.sendMessage(finalParts);
      
      if (shouldAbortRef.current) return;

      let aiResponse = result.response.text();
      aiResponse = aiResponse
        .replace(/\*\*/g, '') 
        .replace(/\*/g, '')   
        .replace(/### /g, '') 
        .replace(/## /g, '')  
        .replace(/# /g, '')   
        .replace(/`/g, '')    
        .replace(/\[|\]/g, '');
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, timestamp: Date.now() }]);
    } catch (error) {
      let errorMsg = `Sorry, I encountered an error: ${error.message}`;
      if (error.message?.includes('429')) {
        errorMsg = "Oops! We're talking a little too fast. Google's free AI limit restricts us to 20 messages per minute. Please wait a few seconds and try again!";
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "Summarize key concepts",
    "Generate 5 flashcards",
    "Explain this simply",
    "Create a practice quiz",
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-4rem)] lg:h-screen flex flex-col gap-4 sm:gap-6 max-w-[1600px] mx-auto">
      
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-1 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#2B3674] font-bold tracking-tight flex items-center gap-2">
            Study Buddy <Sparkles className="text-indigo-400 shrink-0" size={24} />
          </h1>
          <p className="text-slate-400 font-medium mt-1 text-sm sm:text-base">Your personalized, AI-powered academic tutor</p>
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 min-h-0 pb-4">
        
        {/* LEFT PANE: Knowledge Base */}
        <div className={`
          ${previewFile ? 'hidden' : 'col-span-12 lg:col-span-4'} 
          bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.06)] rounded-[32px] flex flex-col overflow-hidden h-full transition-all duration-300
          ${leftPaneOpen ? 'max-h-[50vh]' : 'max-h-0 overflow-hidden'}
          lg:max-h-full lg:overflow-visible
        `}>
          <div className="px-6 py-4 flex items-center gap-3 border-b border-white/40">
            <LibraryBig className="text-indigo-500 shrink-0" size={22} />
            <h2 className="font-bold text-[#2B3674] text-base sm:text-lg">Knowledge Base</h2>
            {files.length > 0 && (
              <span className="ml-auto text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-5">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`w-full border-2 border-dashed rounded-[24px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                isDragging ? 'border-indigo-400 bg-indigo-50 scale-[1.02]' : 'border-[#D1D1FF]/60 bg-white/60 hover:bg-white hover:border-indigo-300'
              }`}
            >
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} disabled={isUploading} />
              {isUploading ? (
                <>
                  <Loader2 size={28} className="text-indigo-500 mb-2 animate-spin" />
                  <p className="font-bold text-[#2B3674] text-sm">Processing files...</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Please wait</p>
                </>
              ) : (
                <>
                  <UploadCloud size={28} className="text-indigo-400 mb-2" />
                  <p className="font-bold text-[#2B3674] text-sm">Click or Drag & Drop</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">PDF, DOCX, Images · Max 10MB</p>
                  <p className="text-[10px] text-indigo-400 font-semibold mt-2 flex items-center gap-1"><BookOpen size={10}/> Library files are listed below</p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Context</h3>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border transition-colors ${selectedCount > 0 ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-400 bg-slate-50 border-slate-100'
                  }`}>{selectedCount} Selected</span>
              </div>

              {files.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-slate-300">
                  <FileText size={32} className="mb-2" />
                  <p className="text-xs font-bold text-slate-400">No files yet</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Upload above or add from Library</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {files.map((file) => {
                    const badge = getBadge(file.type);
                    const isLarge = fileSizeMB(file.size) > 4;
                    return (
                      <div
                        key={file.id}
                        onClick={() => { toggleFileSelection(file.id); openPreview(file); }}
                        className={`flex items-center gap-3 cursor-pointer group p-3 rounded-2xl transition-all border ${
                          file.selected
                            ? 'bg-indigo-50/80 border-indigo-200 shadow-sm'
                            : previewFile?.id === file.id
                              ? 'bg-slate-50 border-slate-200'
                              : 'border-transparent hover:bg-white/70 hover:border-slate-100'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 border transition-colors ${
                          file.selected ? 'bg-indigo-500/10 border-indigo-200 text-indigo-500' : 'bg-white text-slate-400 border-slate-100 shadow-sm'
                        }`}>
                          {file.type === 'img' ? <FileImage size={18} /> : <FileText size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${file.selected ? 'text-[#2B3674]' : 'text-[#2B3674]/70'}`}>{file.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${badge.cls}`}>{badge.label}</span>
                            <span className="text-[11px] text-slate-400">{file.size}</span>
                            {isLarge && <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"><AlertTriangle size={8}/> Large</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {file.selected
                            ? <CheckCircle2 className="text-indigo-500" size={20} />
                            : <Circle className="text-slate-200 group-hover:text-indigo-300 transition-colors" size={20} />
                          }
                          <button
                            onClick={(e) => removeFileFromSession(e, file.id)}
                            className="ml-1 p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove from session"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE PANE: Document Preview */}
        {previewFile && (
          <div className="col-span-12 lg:col-span-5 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.06)] rounded-[32px] flex flex-col h-full overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-left duration-500">
            <div className="px-6 py-4 border-b border-white/40 flex justify-between items-center bg-white/50 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText size={20} className="text-indigo-500 shrink-0" />
                <h3 className="font-bold text-[#2B3674] text-sm truncate">{previewFile.name}</h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setPdfScale(s => Math.max(0.5, s - 0.2))} className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm transition-colors" title="Zoom Out">
                  <ZoomOut size={16} />
                </button>
                <span className="text-[11px] font-bold text-slate-500 min-w-[38px] text-center">{Math.round(pdfScale * 100)}%</span>
                <button onClick={() => setPdfScale(s => Math.min(3.0, s + 0.2))} className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm transition-colors" title="Zoom In">
                  <ZoomIn size={16} />
                </button>
                <button 
                  onClick={closePreview} 
                  className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-wider shrink-0 transition-colors"
                >
                  <X size={14} /> Close
                </button>
              </div>
            </div>
            <div 
              className="flex-1 bg-slate-50/50 relative overflow-y-auto overflow-x-hidden custom-scrollbar"
              ref={previewContainerRef}
              onMouseUp={handleMouseUp}
            >
              {previewUrl ? (
                previewFile.type === 'img' ? (
                  <div className="w-full h-full p-4 flex justify-center items-start">
                    <img src={previewUrl} alt="preview" className="max-w-full rounded-lg shadow-sm border border-slate-200" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 relative">
                    <Document
                      file={previewUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="shadow-md rounded-lg overflow-hidden border border-slate-200 bg-white"
                    >
                      {Array.from(new Array(numPages || 0), (el, index) => (
                         <div key={`page_${index + 1}`} className="mb-6 border-b-4 border-slate-100 last:border-b-0">
                            <Page 
                              pageNumber={index + 1} 
                              renderTextLayer={true}
                              renderAnnotationLayer={true}
                              width={containerWidth ? containerWidth * pdfScale : undefined}
                            />
                         </div>
                      ))}
                    </Document>

                    {/* HIGHLIGHT AI POPUP WIDGET */}
                    {highlightedText && popupPosition && (
                      <div 
                        className="absolute z-50 bg-white border border-indigo-100 shadow-xl rounded-2xl p-2 flex gap-1 animate-in fade-in zoom-in duration-200"
                        style={{ 
                          left: Math.max(10, popupPosition.x - 150), 
                          top: Math.max(10, popupPosition.y), 
                          transform: 'translateY(-100%)' 
                        }}
                      >
                        <button onClick={() => handleHighlightAction("Explain this simply")} className="px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors whitespace-nowrap">
                          ✨ Explain
                        </button>
                        <button onClick={() => handleHighlightAction("Summarize this text")} className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors whitespace-nowrap">
                          📝 Summarize
                        </button>
                        <button onClick={() => handleHighlightAction("Create a flashcard from this")} className="px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50 rounded-xl transition-colors whitespace-nowrap">
                          🃏 Flashcard
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Preview not available</div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT PANE: Chat Workspace */}
        <div className={`${previewFile ? 'col-span-12 lg:col-span-7' : 'col-span-12 lg:col-span-8'} bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.06)] rounded-[32px] flex flex-col h-full relative overflow-hidden transition-all duration-300`}>
          
          <div className="px-6 py-4 flex items-center justify-between z-10 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              <h2 className="font-bold text-[#2B3674] text-lg">Study Assistant</h2>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                  title="Clear conversation"
                >
                  <RotateCcw size={13} /> Clear Chat
                </button>
              )}
              <button
                onClick={() => setIsRagMode(!isRagMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm ${
                  isRagMode ? 'bg-[#EAF5E4] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#DCECD6]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
                title={isRagMode ? 'RAG Mode ON — click to switch to General Mode' : 'General Mode ON — click to switch to RAG Mode'}
              >
                {isRagMode ? <ShieldCheck size={14} /> : <Globe size={14} />}
                {isRagMode ? 'RAG Mode' : 'General Mode'}
              </button>
            </div>
          </div>

          {isRagMode && (
            <div className="bg-white/20 px-8 py-3 flex items-center gap-2 text-xs text-slate-500 font-medium border-b border-white/30 shrink-0">
              <ShieldCheck size={16} className="text-green-500 shrink-0" />
              <span><strong className="text-green-700">RAG Mode is ON</strong> — The AI reads <em>only</em> from your selected files above. Answers are locked to your study materials for greater accuracy.</span>
            </div>
          )}
          {!isRagMode && (
            <div className="bg-white/20 px-8 py-3 flex items-center gap-2 text-xs text-slate-500 font-medium border-b border-white/30 shrink-0">
              <Globe size={16} className="text-slate-400 shrink-0" />
              <span><strong className="text-slate-600">General Mode is ON</strong> — The AI uses its full knowledge base. Answers are not restricted to your uploaded files.</span>
            </div>
          )}
          
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto py-8">
                  {isRagMode ? (
                    <div className="w-full">
                      {selectedCount > 0 ? (
                        <div className="bg-white/40 border border-white/60 backdrop-blur-md shadow-sm p-8 rounded-[32px] text-slate-600 text-center">
                          <Wand2 size={32} className="text-indigo-400 mx-auto mb-4" />
                          <p className="text-lg font-medium mb-2 text-[#2B3674]">
                            I am analyzing <strong className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{selectedCount} files</strong> from your Knowledge Base.
                          </p>
                          <p className="text-sm text-slate-500">What would you like to achieve in this study session?</p>
                        </div>
                      ) : (
                        <div className="bg-[#FFF8F3] border border-[#FFE0CC] p-10 rounded-[32px] flex flex-col items-center text-center max-w-xl mx-auto">
                          <Lightbulb className="text-[#FF8A65] mb-4" size={32} />
                          <p className="text-[#D84315] text-base font-bold mb-2">
                            Select a file to activate RAG Mode
                          </p>
                          <p className="text-[#D84315]/80 text-sm leading-relaxed mb-1">
                            In <strong>RAG Mode</strong>, the AI reads your uploaded document and answers questions <em>based only on what's inside it</em> — like a tutor who has read your notes.
                          </p>
                          <p className="text-[#D84315]/60 text-xs">Click a file on the left panel to get started.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 shadow-sm p-8 rounded-[32px] text-slate-600 text-center w-full max-w-xl mx-auto">
                      <Globe size={32} className="text-slate-400 mx-auto mb-4" />
                      <p className="text-lg font-bold mb-2 text-[#2B3674]">General Mode is active</p>
                      <p className="text-sm text-slate-500 leading-relaxed">The AI is using its full knowledge — not limited to your files. Great for general questions, explanations, or topic exploration outside your documents.</p>
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in fade-in duration-300`}>
                    {msg.role === 'user' && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                        <button onClick={() => handleEditMessage(idx)} className="p-2 bg-white rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 shadow-sm transition-all" title="Edit Message">
                          <Edit3 size={16} />
                        </button>
                      </div>
                    )}
                    
                    {msg.isWidget ? (
                      <div className="bg-white/80 backdrop-blur-md border border-indigo-100 p-6 rounded-2xl shadow-sm w-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-100 rounded-full text-green-600">
                             <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">Study Set Generated!</h4>
                            <p className="text-sm text-slate-500">{msg.content}</p>
                          </div>
                        </div>
                        <Link href="/study">
                          <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                             Practice Now <ExternalLink size={16} />
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-tr-sm'
                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          {msg.timestamp && <span className="text-[10px] text-slate-300 font-medium">{fmtTime(msg.timestamp)}</span>}
                          {msg.role !== 'user' && (
                            <button
                               onClick={() => handleCopy(msg.content, idx)}
                               className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-indigo-500 transition-colors py-0.5 px-1.5 rounded-md hover:bg-slate-50"
                               title="Copy"
                            >
                               {copiedIndex === idx ? <><Check size={12} className="text-green-500" /><span className="text-green-500">Copied</span></> : <><Copy size={12} /> Copy</>}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex w-full justify-start">
                    <div className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 rounded-tl-sm shadow-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Input Section */}
          <div className="px-6 pb-6 pt-3 flex flex-col gap-3 shrink-0">
            {/* Quick Prompts — always accessible */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setShowQuickPrompts(p => !p)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-indigo-500 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-200 bg-white/60 transition-all shrink-0"
                title="Quick prompts"
              >
                <MessageSquarePlus size={13} />
                Prompts {showQuickPrompts ? '▲' : '▼'}
              </button>
              {showQuickPrompts && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isInputDisabled}
                      title={isInputDisabled ? 'Select a file first to use RAG prompts' : ''}
                      className="text-[12px] font-bold bg-white px-4 py-1.5 rounded-full text-[#5B61F4] border border-[#D1D1FF] shadow-sm hover:bg-[#F3F4FF] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="relative">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isRagMode ? (selectedCount > 0 ? 'Ask a question about your materials...' : 'Select a file above to start in RAG Mode...') : 'Ask me anything...'}
                disabled={isInputDisabled}
                className="w-full py-4 px-6 rounded-full bg-white/60 backdrop-blur-md border border-white/60 outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white/80 transition-all text-sm font-medium pr-16 text-slate-700 placeholder:text-slate-400 disabled:opacity-60"
              />
              {isTyping ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-all hover:scale-105 active:scale-95"
                  title="Stop Generating"
                >
                  <Square size={14} className="fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isInputDisabled || !inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#B4B9FF] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:bg-[#9FA6FF] transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}