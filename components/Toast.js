"use client";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const CONFIGS = {
  success: {
    icon: CheckCircle2,
    bar: "from-emerald-400 to-teal-400",
    bg: "bg-white",
    border: "border-emerald-200",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
    text: "text-slate-800",
    sub: "text-slate-500",
  },
  error: {
    icon: XCircle,
    bar: "from-rose-400 to-pink-500",
    bg: "bg-white",
    border: "border-rose-200",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
    text: "text-slate-800",
    sub: "text-slate-500",
  },
  warning: {
    icon: AlertTriangle,
    bar: "from-amber-400 to-orange-400",
    bg: "bg-white",
    border: "border-amber-200",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    text: "text-slate-800",
    sub: "text-slate-500",
  },
  info: {
    icon: Info,
    bar: "from-blue-400 to-indigo-500",
    bg: "bg-white",
    border: "border-blue-200",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    text: "text-slate-800",
    sub: "text-slate-500",
  },
};

/**
 * Individual Toast Card
 */
function ToastCard({ id, type = "success", message, subtitle, duration = 3500, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = CONFIGS[type] || CONFIGS.success;
  const Icon = cfg.icon;

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 350);
  }, [id, onDismiss]);

  // Slide in
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Auto-dismiss timer + progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) { clearInterval(interval); return 0; }
        return p - (100 / (duration / 50));
      });
    }, 50);

    const timer = setTimeout(dismiss, duration);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [dismiss, duration]);

  return (
    <div
      className={`
        relative w-full max-w-sm overflow-hidden pointer-events-auto
        ${cfg.bg} border ${cfg.border}
        rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)]
        transition-all duration-350 ease-out
        ${visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"}
      `}
      style={{ minWidth: 300 }}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 overflow-hidden rounded-b-2xl">
        <div
          className={`h-full bg-gradient-to-r ${cfg.bar} transition-none rounded-full`}
          style={{ width: `${progress}%`, transition: "width 50ms linear" }}
        />
      </div>

      <div className="flex items-start gap-3 p-4 pr-10">
        {/* Icon */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
          <Icon size={18} className={cfg.iconColor} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`text-sm font-semibold leading-snug ${cfg.text}`}>{message}</p>
          {subtitle && (
            <p className={`text-xs mt-0.5 leading-relaxed ${cfg.sub}`}>{subtitle}</p>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * Toast Container — renders all active toasts
 * Place <ToastContainer toasts={toasts} onDismiss={dismissToast} /> in your page.
 */
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/**
 * useToast — hook to manage toast queue
 *
 * Usage:
 *   const { toasts, toast, dismissToast } = useToast();
 *   toast.success("File uploaded!");
 *   toast.error("Something went wrong.");
 *   toast.warning("File is almost expired.");
 *   toast.info("Syncing your data...");
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, message, subtitle, duration }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, subtitle, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, subtitle, duration) => addToast({ type: "success", message, subtitle, duration }),
    error:   (message, subtitle, duration) => addToast({ type: "error",   message, subtitle, duration }),
    warning: (message, subtitle, duration) => addToast({ type: "warning", message, subtitle, duration }),
    info:    (message, subtitle, duration) => addToast({ type: "info",    message, subtitle, duration }),
  };

  return { toasts, toast, dismissToast };
}
