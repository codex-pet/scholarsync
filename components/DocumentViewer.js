import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';

export default function DocumentViewer({ fileToView }) {
  const [htmlContent, setHtmlContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 300));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 40));

  useEffect(() => {
    const loadDoc = async () => {
      try {
        setLoading(true);
        const ext = fileToView.name.split('.').pop().toLowerCase();
        if (ext === 'docx') {
          const res = await fetch(fileToView.url);
          const arrayBuffer = await res.arrayBuffer();
          const mammoth = (await import('mammoth')).default || await import('mammoth');
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setHtmlContent(result.value);
        } else {
          setError(`Preview is not supported for .${ext} files in the browser. Downloads are intentionally disabled.`);
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading the document.");
      } finally {
        setLoading(false);
      }
    };
    if (fileToView) loadDoc();
  }, [fileToView]);

  if (loading) {
    return (
      <div className="text-white flex flex-col items-center">
        <Loader2 className="animate-spin mb-4 text-indigo-400" size={32} /> 
        Loading Document...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-white bg-slate-800/80 p-8 rounded-2xl border border-white/10 flex flex-col items-center">
        <AlertCircle size={48} className="mb-4 text-rose-400" />
        <p className="font-medium text-lg text-center max-w-sm">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full bg-white rounded-t-lg shadow-2xl overflow-hidden relative text-black flex flex-col">
      {/* Zoom Controls Overlay */}
      <div className="absolute top-4 right-6 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-1.5 transition-all opacity-80 hover:opacity-100">
        <button onClick={handleZoomOut} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors" title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <span className="text-[11px] font-bold text-slate-600 min-w-[40px] text-center">{zoomLevel}%</span>
        <button onClick={handleZoomIn} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors" title="Zoom In">
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 lg:p-16 w-full">
        <div 
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
          className="max-w-4xl mx-auto space-y-4 leading-relaxed [&>p]:mb-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-8 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-8 [&>ol]:mb-4 [&>table]:w-full [&>table]:border-collapse [&>table]:mb-4 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-50 transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        />
      </div>
    </div>
  );
}
