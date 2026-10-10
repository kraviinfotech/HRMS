import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle, X, AlertTriangle, Info } from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({ type = "info", message }) => {
      const id = crypto.randomUUID();
      setToasts((items) => [...items, { id, type, message }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const value = useMemo(
    () => ({
      success: (message) => notify({ type: "success", message }),
      error: (message) => notify({ type: "error", message }),
      info: (message) => notify({ type: "info", message }),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          const color =
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-blue-200 bg-blue-50 text-blue-800";
          return (
            <div key={toast.id} className={`flex items-start gap-3 rounded-md border p-3 shadow-sm ${color}`}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="min-w-0 flex-1 text-sm">{toast.message}</p>
              <button className="focus-ring rounded p-1" type="button" onClick={() => remove(toast.id)} aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
