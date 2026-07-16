import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextProps {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);

    setToasts((prev) => [...prev, { id, message, type, title }]);
  }, [removeToast]);

  const success = useCallback((msg: string, title?: string) => toast(msg, "success", title), [toast]);
  const error = useCallback((msg: string, title?: string) => toast(msg, "error", title), [toast]);
  const warning = useCallback((msg: string, title?: string) => toast(msg, "warning", title), [toast]);
  const info = useCallback((msg: string, title?: string) => toast(msg, "info", title), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      
      {/* Toast Portal Element */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`p-4 rounded-xl border shadow-lg flex gap-3 items-start transition-all glass-panel
                ${t.type === "success" ? "border-green-500/30 text-green-800 dark:text-green-200" : ""}
                ${t.type === "error" ? "border-red-500/30 text-red-800 dark:text-red-200" : ""}
                ${t.type === "warning" ? "border-yellow-500/30 text-yellow-800 dark:text-yellow-200" : ""}
                ${t.type === "info" ? "border-blue-500/30 text-blue-800 dark:text-blue-200" : ""}
              `}>
                <div className="mt-0.5">
                  {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {t.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                  {t.type === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {t.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
                </div>

                <div className="flex-1">
                  {t.title && <h4 className="font-semibold text-sm leading-tight text-slate-900 dark:text-slate-100 mb-0.5">{t.title}</h4>}
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{t.message}</p>
                </div>

                <button 
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
