"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  FileText, Image as ImageIcon, LayoutGrid, List as ListIcon, 
  Clock, UploadCloud, AlertCircle, X, CheckCircle, 
  Database, HardDrive, CalendarDays, Loader2, Sparkles,
  Search, Trash2, Check
} from 'lucide-react';
import { loadFilesLocally, saveFileLocally, deleteFileLocally } from '../../lib/indexeddb';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp'];
const FILTERS = ["All Files", "AI Processed", "Needs Sync"];

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function LibraryPage() {
  // State Management
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('All Files');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [toast, setToast] = useState(null);
  const [fileToView, setFileToView] = useState(null);
  
  const fileInputRef = useRef(null);

  // --- Helpers ---
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredFiles = files.filter(file => {
    const matchesFilter = activeFilter === "All Files" || file.category === activeFilter;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // --- Initialize and Fetch from IndexedDB ---
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const localFiles = await loadFilesLocally();
        const decorated = await Promise.all(localFiles.map(async (file) => {
          const timeLeftMs = (48 * 3600 * 1000) - (Date.now() - (file.createdAt || Date.now()));
          const timeLeftHours = Math.max(0, Math.floor(timeLeftMs / (3600 * 1000)));
          const isExpired = timeLeftHours <= 0;
          
          let actualPages = file.pages;
          if (file.type === 'pdf' && file.base64 && (!file.pages || file.pages > 15)) {
            try {
              const byteCharacters = atob(file.base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const pdf = await pdfjs.getDocument({ data: byteArray }).promise;
              actualPages = pdf.numPages;
              saveFileLocally({ ...file, pages: actualPages }).catch(console.error);
            } catch (e) {
              console.error("Failed to parse PDF page count", e);
            }
          }
          
          return {
            ...file,
            pages: actualPages || 1,
            status: isExpired ? "Expired" : "Ready",
            statusColor: isExpired ? "bg-slate-300" : "bg-green-400",
            timeLeft: timeLeftHours,
            category: isExpired ? "Needs Sync" : "AI Processed"
          };
        }));
        setFiles(decorated);
      } catch (err) {
        console.error("Error loading DB", err);
      }
    };
    fetchFiles();
  }, []);

  // --- Handlers ---
  const handleDelete = async (id, name) => {
    await deleteFileLocally(id);
    setFiles(files.filter(f => f.id !== id));
    setSelectedFiles(prev => prev.filter(fId => fId !== id));
    triggerToast(`"${name}" deleted.`, 'error');
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) return;
    
    for (const id of selectedFiles) {
      await deleteFileLocally(id);
    }
    setFiles(files.filter(f => !selectedFiles.includes(f.id)));
    setSelectedFiles([]);
    triggerToast(`Deleted ${selectedFiles.length} files.`, 'success');
  };

  const toggleFileSelection = (id) => {
    setSelectedFiles(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  const handleReSync = async (id) => {
    setFiles(files.map(f => f.id === id ? { ...f, status: 'Syncing...', statusColor: 'bg-blue-400' } : f));
    setTimeout(() => {
      setFiles(current => current.map(f => {
        if (f.id === id) {
          const updated = { ...f, status: 'Ready', statusColor: 'bg-green-400', timeLeft: 48, category: 'AI Processed', createdAt: Date.now() };
          saveFileLocally(updated).catch(console.error); // sync to DB
          return updated;
        }
        return f;
      }));
      triggerToast("File re-synced!", 'success');
    }, 1500);
  };

  const validateAndAddFiles = async (uploadedFiles) => {
    setUploadError(null);
    let hasError = false;

    const filePromises = Array.from(uploadedFiles).map(file => {
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (file.size > MAX_FILE_SIZE) { setUploadError(`"${file.name}" exceeds 10MB.`); hasError = true; return null; }
      if (!VALID_EXTENSIONS.includes(fileExt) && !file.type.startsWith('image/')) { setUploadError(`"${file.name}" is unsupported.`); hasError = true; return null; }

      return new Promise(async (resolve) => {
        let actualPages = 1;
        if (fileExt === 'pdf') {
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
          else if (fileExt === 'pdf') uiType = 'pdf';

          resolve({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            type: uiType,
            mimeType: file.type || 'application/pdf',
            base64: base64Data,
            createdAt: Date.now(),
            pages: actualPages,
            status: "Ready",
            statusColor: "bg-green-400",
            timeLeft: 48,
            category: "AI Processed"
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newFiles = (await Promise.all(filePromises)).filter(Boolean);
    
    if (newFiles.length > 0) {
      for (const f of newFiles) {
        await saveFileLocally(f); // Save to IndexedDB
      }
      setFiles(prev => [...newFiles, ...prev]);
      if (!hasError) setShowUpload(false); 
      triggerToast(`Processed ${newFiles.length} file(s)`);
    }
  };

  // Drag & Drop
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) validateAndAddFiles(e.dataTransfer.files);
  }, []);

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

      {/* Control Bar: Search, Filters & View Toggles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 pb-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search your files..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-md border border-white/80 pl-11 pr-4 py-3 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm transition-all"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          
          {selectedFiles.length > 0 && (
            <button 
              onClick={handleBatchDelete} 
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shrink-0"
            >
              <Trash2 size={16} /> Delete ({selectedFiles.length})
            </button>
          )}

          <div className="flex flex-wrap items-center gap-1 bg-white/20 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-white/40 shrink-0">
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

          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-white/40 shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/40 text-[#2B3674]' : 'text-slate-400 hover:bg-white/30 hover:text-[#2B3674]'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/40 text-[#2B3674]' : 'text-slate-400 hover:bg-white/30 hover:text-[#2B3674]'}`}>
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Retention Policy Note */}
      <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/20 p-5 rounded-3xl flex items-start gap-4 shadow-sm">
        <Clock className="text-[#FF8A65] shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-bold text-[#D84315] text-sm">Temporary AI Memory Storage</h3>
          <p className="text-[#D84315]/80 text-sm mt-1 leading-relaxed">
            Your files are securely stored locally in your browser offline. However, the AI processing memory has a 48-hour retention limit. After 48 hours, simply click "Re-Sync" to re-process your document for AI interactions.
          </p>
        </div>
      </div>

      {/* Document Rendering */}
      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 border-dashed">
          <FileText size={48} className="mb-4 text-slate-300" />
          <p className="text-lg font-bold text-slate-500">
            {searchQuery ? "No files matched your search." : "No files found."}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {filteredFiles.map((file) => (
            <FileCard 
              key={file.id} 
              file={file} 
              viewMode={viewMode} 
              isSelected={selectedFiles.includes(file.id)}
              onToggleSelect={() => toggleFileSelection(file.id)}
              onReSync={handleReSync} 
              onDelete={handleDelete} 
              onOpenView={(url, type) => setFileToView({ url, type, name: file.name })}
            />
          ))}
        </div>
      )}

      {/* Storage Overview Component */}
      <StorageOverview files={files} />

      {/* File Viewer Modal */}
      {fileToView && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col transition-all duration-300 animate-in fade-in duration-300">
          <div className="flex justify-between items-center p-4 bg-slate-900/50 text-white border-b border-white/10 shrink-0 backdrop-blur-xl">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileText size={20} className="text-indigo-400" /> {fileToView.name}
            </h3>
            <button onClick={() => setFileToView(null)} className="p-2 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-colors active:scale-95">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 w-full h-full overflow-hidden bg-[#242424] flex items-center justify-center">
            {['img', 'png', 'jpg', 'jpeg', 'webp'].includes(fileToView.type) ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img src={fileToView.url} alt="Document" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              </div>
            ) : (
              <iframe src={fileToView.url} className="w-full h-full border-none bg-white rounded-t-lg shadow-2xl" title="Document Viewer" />
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function FileCard({ file, viewMode, isSelected, onToggleSelect, onReSync, onDelete, onOpenView }) {
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'img'].includes(file.type);
  const isProcessing = file.status === 'Uploading' || file.status === 'Syncing...';

  const handleOpen = () => {
    if (file.status === "Expired") {
      onReSync(file.id);
      return;
    }
    if (file.base64) {
      try {
        const byteCharacters = atob(file.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.mimeType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        onOpenView(url, file.type);
      } catch (err) {
        console.error("Failed to open file", err);
      }
    }
  };

  return (
    <div className={`group relative bg-white/40 backdrop-blur-xl border ${isSelected ? 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/50 hover:border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'} transition-all duration-300 ease-out rounded-[32px] p-6 lg:p-8 flex ${
      viewMode === 'grid' ? 'flex-col hover:-translate-y-1' : 'flex-col md:flex-row md:items-center justify-between gap-6 hover:scale-[1.005]'
    }`}>
      
      {/* Selection Checkbox */}
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
        className={`absolute top-6 right-6 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white scale-110' : 'border-slate-300 bg-white/50 text-transparent hover:border-indigo-400 opacity-0 group-hover:opacity-100'}`}
      >
        <Check size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
      </button>

      {/* Left: Icon & Title */}
      <div className={`flex flex-col gap-3 ${viewMode === 'list' ? 'md:w-1/3' : ''}`}>
        <div className="flex items-start gap-3 pr-8">
          <div className={`p-3 backdrop-blur-md rounded-2xl transition-colors duration-300 border ${isSelected ? 'bg-indigo-500/10 border-indigo-200' : 'bg-white/30 group-hover:bg-white/50 border-white/20'}`}>
            {isImage ? <ImageIcon className={isSelected ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-500 transition-colors"} size={24} /> 
                     : <FileText className={isSelected ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-500 transition-colors"} size={24} />}
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
      <div className={`flex flex-col gap-5 ${viewMode === 'list' ? 'md:w-1/3 md:pr-10' : ''}`}>
        <div className="space-y-2 opacity-90 group-hover:opacity-100 transition-opacity">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500 flex items-center gap-1"><Clock size={12}/> AI Memory</span>
            <span className={file.timeLeft > 12 ? "text-green-600" : (file.timeLeft > 0 ? "text-orange-600" : "text-rose-500")}>
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
            onClick={handleOpen}
            disabled={isProcessing}
            className={`border py-2 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm flex items-center justify-center gap-2 backdrop-blur-md active:scale-95
              ${file.status === "Expired" 
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500' 
                : 'bg-indigo-50/50 border-indigo-200/50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md'} 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white/10`}
          >
            {file.status === "Syncing..." ? <Loader2 size={16} className="animate-spin" /> : null}
            {file.status === "Expired" ? "Re-Sync" : (file.status === "Syncing..." ? "Syncing" : "Open")}
          </button>
          
          <button 
            onClick={() => onDelete(file.id, file.name)}
            className="bg-rose-50/50 backdrop-blur-md border border-rose-200/50 text-slate-500 py-2 px-4 rounded-xl text-sm font-bold hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-md transition-all duration-300 shadow-sm active:scale-95"
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
        <Database size={20} className="text-indigo-500" /> Local Storage Overview
      </h2>
      
      {/* --- GLASS DESIGN BOX LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Storage Box */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[24px] shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
            <Database size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Total Browser Quota</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">~ 15.0 GB</h4>
          </div>
        </div>

        {/* Current Storage Box */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[24px] shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                <HardDrive size={26} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">Local Storage Used</p>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">{totalStorageUsed} MB</h4>
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden mt-1 relative z-10">
            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${Math.max(storagePercentage, 2)}%` }}></div>
          </div>
        </div>

        {/* Clean Up Box */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[24px] shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
            <CalendarDays size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Next AI Clean Up</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">2 Days</h4>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">Automated</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}