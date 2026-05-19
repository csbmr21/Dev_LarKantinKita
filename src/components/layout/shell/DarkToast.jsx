import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

const ICON_MAP = {
  success: { emoji: '✅', bg: 'rgba(16,185,129,0.12)'  },
  error:   { emoji: '❌', bg: 'rgba(239,68,68,0.12)'   },
  warning: { emoji: '⚠️', bg: 'rgba(245,158,11,0.12)'  },
  info:    { emoji: 'ℹ️', bg: 'rgba(59,130,246,0.12)'  },
};

/**
 * DarkToastContainer — Mount inside AdminView or AppShell
 * Exposes `addToast(type, message, duration)` via ref or context
 */
export function DarkToastContainer({ toasts, onRemove }) {
  return (
    <div className="kk-toast-container">
      {toasts.map(t => {
        const ic = ICON_MAP[t.type] ?? ICON_MAP.info;
        return (
          <div key={t.id} className={`kk-toast ${t.type}`}>
            <div className="kk-toast-icon" style={{ background: ic.bg }}>
              {ic.emoji}
            </div>
            <div style={{ flex: 1 }}>
              {t.title && (
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-100)', marginBottom: 2 }}>
                  {t.title}
                </p>
              )}
              <p className="kk-toast-msg">{t.message}</p>
            </div>
            <button
              onClick={() => onRemove(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * useDarkToast — Hook for managing toast state
 * Usage: const { toasts, toast, removeToast } = useDarkToast();
 */
export function useDarkToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, { title, duration = 3500 } = {}) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, message, title }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = {
    success: (msg, opts) => addToast('success', msg, opts ?? {}),
    error:   (msg, opts) => addToast('error',   msg, opts ?? {}),
    warning: (msg, opts) => addToast('warning', msg, opts ?? {}),
    info:    (msg, opts) => addToast('info',     msg, opts ?? {}),
  };

  return { toasts, toast, removeToast };
}
