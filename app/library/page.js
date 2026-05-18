import { FileText, Eye, Trash2, Upload } from "lucide-react";

export default function Library() {
  const docs = [
    { name: "World History Notes", subject: "History", status: "Ready", time: "32h" },
    { name: "Biology Textbook Ch5", subject: "Biology", status: "Vectorizing", time: "32h" },
    { name: "Python Guide", subject: "Comp Sci", status: "Ready", time: "32h" },
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
      </header>

      {/* Upload Dropzone */}
      {showUpload && (
        <div
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-12 rounded-[32px] border-2 border-dashed transition-all duration-300 cursor-pointer ${isDragging ? 'border-[#5B61F4] bg-white/30 backdrop-blur-md scale-[1.01]' : 'border-slate-300/50 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:border-indigo-300'
            }`}
        >
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-indigo-500/20' : 'bg-white/50 backdrop-blur-sm shadow-sm'}`}>
            <UploadCloud size={40} className="text-[#5B61F4]" />
          </div>
          <h3 className="text-xl font-bold text-[#2B3674] mb-2">{isDragging ? 'Drop files here!' : 'Click or Drag & Drop to Upload'}</h3>
          <p className="text-slate-500 text-sm font-medium">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</p>
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files?.length > 0) validateAndAddFiles(e.target.files); }} multiple accept=".pdf,.doc,.docx,image/*" />
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
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col transition-all duration-300">
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
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${doc.status === 'Ready' ? 'bg-[#E2F0CB] text-green-700' : 'bg-orange-50 text-orange-600'
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
        </div>

    </div>
    </div >
  );
}