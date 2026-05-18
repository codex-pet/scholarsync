"use client";
import { useState, useRef, useEffect } from "react";
import { 
  FileText, ImageIcon, LayoutGrid, List as ListIcon, Trash2, Plus, 
  UploadCloud, Clock, Eye, AlertCircle, X, Search, Check, RefreshCw, BarChart2, Loader2
} from "lucide-react";
import { saveFileLocally, loadFilesLocally, deleteFileLocally } from "../../lib/indexeddb";
import { pdfjs } from 'react-pdf';
import { useToast, ToastContainer } from "@/components/Toast";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [fileToView, setFileToView] = useState(null);
  const [deleteConfirmFiles, setDeleteConfirmFiles] = useState(null); // Custom confirm modal state
  
  const fileInputRef = useRef(null);
  const { toasts, toast, dismissToast } = useToast();

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
  const handleDelete = (id, name) => {
    setDeleteConfirmFiles([{ id, name }]);
  };

  const handleBatchDelete = () => {
    const selectedList = files.filter(f => selectedFiles.includes(f.id)).map(f => ({ id: f.id, name: f.name }));
    setDeleteConfirmFiles(selectedList);
  };

  const confirmDeletion = async () => {
    if (!deleteConfirmFiles) return;
    try {
      const idsToDelete = deleteConfirmFiles.map(f => f.id);
      for (const id of idsToDelete) {
        await deleteFileLocally(id);
      }
      setFiles(prev => prev.filter(f => !idsToDelete.includes(f.id)));
      setSelectedFiles(prev => prev.filter(id => !idsToDelete.includes(id)));
      
      if (deleteConfirmFiles.length === 1) {
        toast.success(`"${deleteConfirmFiles[0].name}" deleted permanently.`);
      } else {
        toast.success(`Deleted ${deleteConfirmFiles.length} files successfully.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete selected files.");
    } finally {
      setDeleteConfirmFiles(null);
    }
  };

  const toggleFileSelection = (id) => {
    setSelectedFiles(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  const handleReSync = async (id) => {
    setFiles(files.map(f => f.id === id ? { ...f, status: 'Syncing...', statusColor: 'bg-blue-400' } : f));
    toast.info("Syncing document metadata with local memory...");
    setTimeout(() => {
      setFiles(current => current.map(f => {
        if (f.id === id) {
          const updated = { ...f, status: 'Ready', statusColor: 'bg-green-400', timeLeft: 48, category: 'AI Processed', createdAt: Date.now() };
          saveFileLocally(updated).catch(console.error); // sync to DB
          return updated;
        }
        return f;
      }));
      toast.success("Document successfully re-synced!", "AI Retention active for 48 hours");
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
            pages: actualPages,
            selected: false,
            createdAt: Date.now()
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const resolvedFiles = (await Promise.all(filePromises)).filter(Boolean);
    if (hasError) return;

    for (const f of resolvedFiles) {
      await saveFileLocally(f);
    }

    const decorated = resolvedFiles.map(f => ({
      ...f,
      status: "Ready",
      statusColor: "bg-green-400",
      timeLeft: 48,
      category: "AI Processed"
    }));

    setFiles(prev => [...decorated, ...prev]);
    setShowUpload(false);
    toast.success(`Uploaded ${resolvedFiles.length} file${resolvedFiles.length > 1 ? 's' : ''}!`, "Document stored locally in your browser memory.");
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) validateAndAddFiles(e.dataTransfer.files);
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-300 relative">
      {/* Toast Alert */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Premium Confirmation Modal */}
      {deleteConfirmFiles && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 rounded-[32px] max-w-md w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
              <Trash2 size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Delete Documents</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {deleteConfirmFiles.length === 1 
                  ? `Are you sure you want to permanently delete "${deleteConfirmFiles[0].name}"? This action cannot be undone.`
                  : `Are you sure you want to permanently delete ${deleteConfirmFiles.length} selected files? This action cannot be undone.`}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmFiles(null)}
                className="flex-1 py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletion}
                className="flex-1 py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-rose-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl text-[#2B3674] tracking-tight font-bold">My Library</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and upload documents locally in your browser memory</p>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)} 
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {showUpload ? <X size={16} /> : <Plus size={16} />}
          {showUpload ? "Cancel Upload" : "Upload Materials"}
        </button>
      </header>

      {/* Dynamic Upload Area */}
      {showUpload && (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-all duration-300 relative ${
            isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-[#D1D1FF]/60 bg-white/40 backdrop-blur-xl'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            onChange={(e) => validateAndAddFiles(e.target.files)} 
            className="hidden" 
          />
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <UploadCloud className="text-indigo-500" size={32} />
            </div>
            <div>
              <p className="font-bold text-[#2B3674] text-lg">Drag & drop your files here</p>
              <p className="text-sm text-slate-400 mt-1">Or click the button below to browse your local files</p>
            </div>
            {uploadError && <p className="text-sm font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl inline-block border border-rose-100">{uploadError}</p>}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              Browse Files
            </button>
            <p className="text-[11px] text-slate-400">Supported formats: PDF, DOC, DOCX, PNG, JPG (Max 10MB per file)</p>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..." 
            className="w-full pl-12 pr-6 py-3.5 bg-white/60 backdrop-blur-xl border border-white/60 outline-none rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:bg-white/80 transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-3">
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
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeFilter === filter ? 'bg-white/40 text-[#2B3674] shadow-sm' : 'text-slate-500 hover:bg-white/30 hover:text-slate-700'
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
    <div className={`group relative bg-white/40 backdrop-blur-xl border ${isSelected ? 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/50 hover:border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'} transition-all duration-300 ease-out rounded-[32px] p-6 lg:p-8 flex ${viewMode === 'grid' ? 'flex-col hover:-translate-y-1' : 'flex-col md:flex-row md:items-center justify-between gap-6 hover:scale-[1.005]'
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

      {/* Center: File Metadata */}
      <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 md:mt-0 ${viewMode === 'grid' ? 'justify-between border-t border-slate-100/50 pt-4 mt-6' : 'flex-1 justify-end md:pr-10'}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Size</span>
          <span className="text-sm font-bold text-slate-600 mt-0.5">{file.size}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pages</span>
          <span className="text-sm font-bold text-slate-600 mt-0.5">{file.pages || 1} pg</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Retention</span>
          <span className={`text-sm font-bold mt-0.5 flex items-center gap-1 ${file.timeLeft <= 5 && file.timeLeft > 0 ? 'text-amber-500 animate-pulse' : file.timeLeft === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            <Clock size={12} /> {file.timeLeft === 0 ? "Expired" : `${file.timeLeft}h left`}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className={`flex items-center gap-3 shrink-0 ${viewMode === 'grid' ? 'w-full mt-4 justify-stretch' : 'mt-4 md:mt-0'}`}>
        <button 
          onClick={handleOpen}
          disabled={isProcessing}
          className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border flex items-center justify-center gap-1.5 active:scale-95 shadow-sm ${
            file.status === "Expired" 
              ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500' 
              : 'bg-white hover:bg-indigo-500 text-slate-600 hover:text-white border-slate-200 hover:border-indigo-500'
          }`}
        >
          {file.status === "Expired" ? <><RefreshCw size={14} /> Re-Sync</> : <><Eye size={14} /> View</>}
        </button>
        <button 
          onClick={() => onDelete(file.id, file.name)} 
          disabled={isProcessing}
          className="p-3 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-xl transition-all duration-300 active:scale-95 shadow-sm flex items-center justify-center"
          title="Delete document"
        >
          <Trash2 size={14} />
        </button>
      </div>

    </div>
  );
}

function StorageOverview({ files }) {
  const [quota, setQuota] = useState({ used: 0, total: 100 });

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.storage || !navigator.storage.estimate) return;
    
    const fetchQuota = async () => {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
        const totalMB = (estimate.quota / (1024 * 1024)).toFixed(1);
        setQuota({ used: parseFloat(usedMB) || 0, total: parseFloat(totalMB) || 100 });
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchQuota();
  }, [files]);

  const percentage = Math.min(100, Math.max(0.5, (quota.used / quota.total) * 100));

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-indigo-500" size={20} />
          <h3 className="font-bold text-slate-800 text-sm">Offline Browser Storage</h3>
        </div>
        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{quota.used} MB Used</span>
      </div>
      
      <div className="w-full bg-white/70 border border-white/80 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
        <span>0 MB</span>
        <span>Local Quota: {quota.total.toFixed(0)} MB</span>
      </div>
    </div>
  );
}