import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = (id) => setToasts((t) => t.filter((toast) => toast.id !== id));

  // type: "success" | "error" | "info"
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 2800);
  }, []);

  const icon = { success: "✓", error: "✕", info: "i" };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            className={`toast toast-${t.type}`}
            key={t.id}
            onClick={() => dismiss(t.id)}
          >
            <span className="toast-icon">{icon[t.type]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);