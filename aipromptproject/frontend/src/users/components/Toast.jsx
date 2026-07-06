import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ── Context ─────────────────────────────────────────────────── */
const ToastContext = createContext(null);

/**
 * Hook to show a toast from any component.
 * Usage:  const showToast = useToast();
 *         showToast("Copied to clipboard!", "success");
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx.show;
}

/* ── Provider ────────────────────────────────────────────────── */
const TOAST_DURATION = 3000; // ms

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, variant = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, variant, removing: false }]);

    // Auto-dismiss
    setTimeout(() => dismiss(id), TOAST_DURATION);
  }, []);

  function dismiss(id) {
    // Start exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Toast container — bottom-left */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "1.5rem",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column-reverse",
          gap: "0.625rem",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Single toast item ───────────────────────────────────────── */
const VARIANT_CONFIG = {
  success: {
    bg: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
    border: "rgba(52, 211, 153, 0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    color: "#a7f3d0",
  },
  error: {
    bg: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
    border: "rgba(248, 113, 113, 0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    color: "#fecaca",
  },
  info: {
    bg: "linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)",
    border: "rgba(96, 165, 250, 0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    color: "#bfdbfe",
  },
};

function ToastItem({ toast, onDismiss }) {
  const config = VARIANT_CONFIG[toast.variant] || VARIANT_CONFIG.success;

  return (
    <div
      onClick={onDismiss}
      style={{
        pointerEvents: "auto",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "0.875rem",
        padding: "0.875rem 1.25rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        minWidth: "260px",
        maxWidth: "380px",
        animation: toast.removing
          ? "toast-slide-out 0.3s ease-in forwards"
          : "toast-slide-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.25)",
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>
      <span
        style={{
          color: config.color,
          fontSize: "0.8125rem",
          fontWeight: 700,
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </span>
    </div>
  );
}

/* ── Keyframe injection (runs once) ──────────────────────────── */
const STYLE_ID = "toast-keyframes";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes toast-slide-in {
      0%   { opacity: 0; transform: translateX(-100%) scale(0.92); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes toast-slide-out {
      0%   { opacity: 1; transform: translateX(0) scale(1); }
      100% { opacity: 0; transform: translateX(-100%) scale(0.92); }
    }
  `;
  document.head.appendChild(style);
}
