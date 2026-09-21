"use client";

import { createContext, useCallback, useContext, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

function subscribe() {
  return () => {};
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Portal targets don't exist during SSR; this returns false on the
  // server and true once running in the browser, without the
  // setState-in-effect pattern React now warns against.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed bottom-4 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
            {toasts.map((t) => (
              <div
                key={t.id}
                role="status"
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-control)] border px-4 py-3 text-sm shadow-[var(--shadow-card)]",
                  t.variant === "success"
                    ? "border-success/20 bg-success-soft text-success"
                    : "border-danger/20 bg-danger-soft text-danger",
                )}
              >
                {t.variant === "success" ? (
                  <CircleCheck className="h-4 w-4 shrink-0" />
                ) : (
                  <CircleAlert className="h-4 w-4 shrink-0" />
                )}
                <span className="flex-1">{t.message}</span>
                <button
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  aria-label="Dismiss"
                  className="text-current opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.toast;
}