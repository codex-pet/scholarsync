"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  FileText, Image as ImageIcon, LayoutGrid, List as ListIcon, 
  Clock, UploadCloud, AlertCircle, X, CheckCircle, 
  Database, HardDrive, CalendarDays, Loader2, Sparkles 
} from 'lucide-react';

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_EXTENSIONS =['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp'];
const FILTERS =["All Files", "AI Processed", "Needs Sync"];

const INITIAL_FILES =[
  { id: 1, name: "Linear Algebra Notes", type: "pdf", status: "Ready", statusColor: "bg-green-400", size: "2.4 MB", pages: 42, lastModified: "2 hours ago", timeLeft: 32, category: "AI Processed" },
  { id: 2, name: "Quantum Mechanics Study Guide", type: "pdf", status: "Ready", statusColor: "bg-green-400", size: "3.1 MB", pages: 56, lastModified: "Yesterday", timeLeft: 18, category: "AI Processed" },
  { id: 3, name: "Chemistry Practice Problems", type: "doc", status: "Vectorizing", statusColor: "bg-indigo-400", size: "1.8 MB", pages: 28, lastModified: "Today", timeLeft: 36, category: "Needs Sync" },
  { id: 4, name: "History Timeline Scans", type: "img", status: "Expired", statusColor: "bg-slate-300", size: "5.2 MB", pages: 4, lastModified: "3 days ago", timeLeft: 0, category: "Needs Sync" }
];

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function LibraryPage() {
  // State Management
  const [files, setFiles] = useState(INITIAL_FILES);
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('All Files');
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const[toast, setToast] = useState(null);
  
  const fileInputRef = useRef(null);

  // --- Helpers ---
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredFiles = files.filter(file => 
    activeFilter === "All Files" || file.category === activeFilter
  );

  // --- Simulated Upload Progress Effect ---
  useEffect(() => {
    const uploadingFiles = files.filter(f => f.status === 'Uploading');
    if (uploadingFiles.length === 0) return;

    const timer = setInterval(() => {
      setFiles(currentFiles => currentFiles.map(f => {
        if (f.status === 'Uploading') {
          const newProgress = (f.progress || 0) + 25;
          if (newProgress >= 100) {
            triggerToast(`"${f.name}" processed!`, 'success');
            return { ...f, status: 'Ready', statusColor: 'bg-green-400', progress: 100, category: 'AI Processed', timeLeft: 48, pages: Math.floor(Math.random() * 20) + 1 };
          }
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 600);
    return () => clearInterval(timer);
  }, [files]);

  // --- Handlers ---
  const handleDelete = (id, name) => {
    setFiles(files.filter(f => f.id !== id));
    triggerToast(`"${name}" deleted.`, 'error');
  };

  const handleReSync = (id) => {
    setFiles(files.map(f => f.id === id ? { ...f, status: 'Syncing...', statusColor: 'bg-blue-400' } : f));
    setTimeout(() => {
      setFiles(current => current.map(f => f.id === id ? { ...f, status: 'Ready', statusColor: 'bg-green-400', timeLeft: 48, category: 'AI Processed' } : f));
      triggerToast("File re-synced!", 'success');
    }, 1500);
  };

  const validateAndAddFiles = (uploadedFiles) => {
    setUploadError(null);
    const newFiles =[];
    let hasError = false;

    Array.from(uploadedFiles).forEach((file) => {
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (file.size > MAX_FILE_SIZE) { setUploadError(`"${file.name}" exceeds 10MB.`); hasError = true; return; }
      if (!VALID_EXTENSIONS.includes(fileExt) && !file.type.startsWith('image/')) { setUploadError(`"${file.name}" is unsupported.`); hasError = true; return; }

      newFiles.push({
        id: Date.now() + Math.random(),
        name: file.name,
        type: fileExt,
        status: "Uploading",
        statusColor: "bg-blue-400",
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        pages: "-", 
        lastModified: "Just now",
        timeLeft: 48,
        category: "All Files",
        progress: 0
      });
    });

    if (newFiles.length > 0) {
      setFiles(prev => [...newFiles, ...prev]);
      if (!hasError) setShowUpload(false); 
      triggerToast(`Processing ${newFiles.length} file(s)`);
    }
  };

  // Drag & Drop
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },[]);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },[]);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) validateAndAddFiles(e.dataTransfer.files);
  },[]);

  // ==========================================
  // RENDER MAIN LAYOUT
  // ==========================================
  return (
    <div className="p-6 lg:p-10 min-h-screen bg-transparent max-w-[1600px] mx-auto flex flex-col gap-8 relative">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 transform ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg px-6 py-4 rounded-2xl flex items-center gap-3">
          {toast?.type === 'error' ? <AlertCircle className="text-red-500" size={20} /> : <CheckCircle className="text-green-500" size={20} />}
          <span className="font-bold text-slate-700">{toast?.message}</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#2B3674] tracking-tight">My Library</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your uploaded documents and media files</p>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="bg-white/40 backdrop-blur-md border border-white/40 text-[#5B61F4] px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/60 hover:scale-[1.02] hover:shadow-md transition-all duration-300 shadow-sm w-full md:w-auto active:scale-95"
        >
          {showUpload ? <X size={20} /> : <UploadCloud size={20} />}
          <span>{showUpload ? 'Cancel Upload' : 'Upload Document'}</span>
        </button>
      </header>

      {/* Upload Dropzone */}
      {showUpload && (
        <div 
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-12 rounded-[32px] border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragging ? 'border-[#5B61F4] bg-white/30 backdrop-blur-md scale-[1.01]' : 'border-slate-300/50 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:border-indigo-300'
          }`}
        >
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-indigo-500/20' : 'bg-white/50 backdrop-blur-sm shadow-sm'}`}>
            <UploadCloud size={40} className="text-[#5B61F4]" />
          </div>
          <h3 className="text-xl font-bold text-[#2B3674] mb-2">{isDragging ? 'Drop files here!' : 'Click or Drag & Drop to Upload'}</h3>
          <p className="text-slate-500 text-sm font-medium">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</p>
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if(e.target.files?.length > 0) validateAndAddFiles(e.target.files); }} multiple accept=".pdf,.doc,.docx,image/*" />
          {uploadError && (
            <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-500/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-red-500/20 animate-pulse">
              <AlertCircle size={16} /> {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Control Bar: Filters & View Toggles */}
      <div className="flex justify-between items-center gap-4 border-b border-slate-200/50 pb-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-white/20 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-white/40">
          {FILTERS.map(filter => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeFilter === filter ? 'bg-white/40 text-[#2B3674] shadow-sm' : 'text-slate-500 hover:bg-white/30 hover:text-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-white/40">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/40 text-[#2B3674]' : 'text-slate-400 hover:bg-white/30 hover:text-[#2B3674]'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/40 text-[#2B3674]' : 'text-slate-400 hover:bg-white/30 hover:text-[#2B3674]'}`}>
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      {/* Retention Policy Note */}
      <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/20 p-5 rounded-3xl flex items-start gap-4 shadow-sm">
        <Clock className="text-[#FF8A65] shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-bold text-[#D84315] text-sm">Temporary File Storage</h3>
          <p className="text-[#D84315]/80 text-sm mt-1 leading-relaxed">
            Due to the Gemini Free Tier 48-hour limit, files are temporarily stored in AI memory. Your files remain safely in your library, but AI processing will require a quick re-sync after 48 hours.
          </p>
        </div>
      </div>

      {/* Document Rendering */}
      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 border-dashed">
          <FileText size={48} className="mb-4 text-slate-300" />
          <p className="text-lg font-bold text-slate-500">No files found.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {filteredFiles.map((file) => (
            <FileCard 
              key={file.id} 
              file={file} 
              viewMode={viewMode} 
              onReSync={handleReSync} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      {/* Storage Overview Component */}
      <StorageOverview files={files} />

    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function FileCard({ file, viewMode, onReSync, onDelete }) {
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'img'].includes(file.type);
  const isProcessing = file.status === 'Uploading' || file.status === 'Syncing...';

  return (
    <div className={`group bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-white/80 transition-all duration-300 ease-out rounded-[32px] p-6 lg:p-8 flex ${
      viewMode === 'grid' ? 'flex-col hover:-translate-y-1' : 'flex-col md:flex-row md:items-center justify-between gap-6 hover:scale-[1.005]'
    }`}>
      
      {/* Left: Icon & Title */}
      <div className={`flex flex-col gap-3 ${viewMode === 'list' ? 'md:w-1/3' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="p-3 bg-white/30 backdrop-blur-md rounded-2xl group-hover:bg-white/50 transition-colors duration-300 border border-white/20">
            {isImage ? <ImageIcon className="text-slate-500 group-hover:text-[#5B61F4] transition-colors" size={24} /> 
                     : <FileText className="text-slate-500 group-hover:text-[#5B61F4] transition-colors" size={24} />}
          </div>
          <div className="mt-1">
            <h3 className="font-bold text-[#2B3674] text-lg leading-tight truncate max-w-[180px] xl:max-w-[220px]" title={file.name}>{file.name}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              {isProcessing ? <Loader2 size={12} className="animate-spin text-blue-500" /> 
                            : <span className={`w-2 h-2 rounded-full ${file.statusColor} shadow-sm`}></span>}
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{file.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Metadata or Progress */}
      <div className={`space-y-3 ${viewMode === 'grid' ? 'my-6' : 'md:w-1/3 my-4 md:my-0'}`}>
        {file.status === 'Uploading' ? (
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1"><Sparkles size={12}/> AI Processing</span>
              <span>{file.progress}%</span>
            </div>
            <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500" style={{ width: `${file.progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-sm group-hover:bg-white/20 p-1.5 rounded-lg transition-colors">
              <span className="text-slate-500 font-medium">Size</span><span className="font-bold text-slate-700">{file.size}</span>
            </div>
            <div className="flex justify-between items-center text-sm group-hover:bg-white/20 p-1.5 rounded-lg transition-colors">
              <span className="text-slate-500 font-medium">Pages</span><span className="font-bold text-slate-700">{file.pages}</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className={`flex flex-col gap-5 ${viewMode === 'list' ? 'md:w-1/3' : ''}`}>
        <div className="space-y-2 opacity-90 group-hover:opacity-100 transition-opacity">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500 flex items-center gap-1"><Clock size={12}/> AI Memory</span>
            <span className={file.timeLeft > 12 ? "text-green-600" : (file.timeLeft > 0 ? "text-orange-600" : "text-red-500")}>
              {file.timeLeft > 0 ? `${file.timeLeft}h left` : "Expired"}
            </span>
          </div>
          <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${file.timeLeft > 0 ? 'bg-gradient-to-r from-indigo-300 to-orange-400' : 'bg-slate-300'}`} style={{ width: `${(file.timeLeft / 48) * 100}%` }} />
          </div>
        </div>

        {/* --- GLASS DESIGN QUICK ACTIONS --- */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <button 
            onClick={() => file.status === "Expired" && onReSync(file.id)}
            disabled={isProcessing}
            className={`border py-2 px-4 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 backdrop-blur-md
              ${file.status === "Expired" 
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 hover:bg-orange-500/20 hover:border-orange-500/30' 
                : 'bg-white/10 border-white/30 text-[#5B61F4] hover:bg-white/30 hover:border-white/50'} 
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {file.status === "Syncing..." ? <Loader2 size={16} className="animate-spin" /> : null}
            {file.status === "Expired" ? "Re-Sync" : (file.status === "Syncing..." ? "Syncing" : "Open")}
          </button>
          
          <button 
            onClick={() => onDelete(file.id, file.name)}
            className="bg-white/10 backdrop-blur-md border border-white/30 text-slate-500 py-2 px-4 rounded-xl text-sm font-bold hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 transition-all shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function StorageOverview({ files }) {
  const totalStorageUsedMB = files.reduce((acc, file) => {
    const numericSize = parseFloat(file.size.toString().replace(/[^0-9.]/g, ''));
    return acc + (isNaN(numericSize) ? 0 : numericSize);
  }, 0);
  
  const totalStorageUsed = totalStorageUsedMB.toFixed(2);
  const storagePercentage = Math.min((totalStorageUsedMB / 15360) * 100, 100).toFixed(2); // Based on 15GB (15360 MB)

  return (
    <div className="mt-8 pt-8 border-t border-slate-200/50 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-[#2B3674] flex items-center gap-2">
        <Database size={20} className="text-[#5B61F4]" /> Storage Overview
      </h2>
      
      {/* --- GLASS DESIGN BOX LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Storage Box */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/40 p-6 rounded-[24px] shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
            <Database size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Total Allocated Size</p>
            <h4 className="text-2xl font-black text-[#2B3674] tracking-tight">15.0 GB</h4>
          </div>
        </div>

        {/* Current Storage Box */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/40 p-6 rounded-[24px] shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                <HardDrive size={26} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">Current Storage Used</p>
                <h4 className="text-2xl font-black text-[#2B3674] tracking-tight">{totalStorageUsed} MB</h4>
              </div>
            </div>
          </div>
          <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden mt-1 relative z-10">
            <div className="h-full bg-gradient-to-r from-blue-400 to-[#5B61F4] rounded-full" style={{ width: `${Math.max(storagePercentage, 2)}%` }}></div>
          </div>
        </div>

        {/* Clean Up Box */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/40 p-6 rounded-[24px] shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
            <CalendarDays size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Next AI Clean Up</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-[#2B3674] tracking-tight">2 Days</h4>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">Automated</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}