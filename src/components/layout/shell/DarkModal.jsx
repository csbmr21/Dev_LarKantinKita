import React from 'react';

/**
 * DarkModal — Reusable dark-mode modal
 * @param {boolean}  open
 * @param {'ok'|'danger'|'warn'} type
 * @param {string}   icon  — emoji
 * @param {string}   title
 * @param {string}   body
 * @param {string}   confirmLabel
 * @param {string}   cancelLabel
 * @param {Function} onConfirm
 * @param {Function} onCancel
 * @param {boolean}  loading
 */
export default function DarkModal({
  open,
  type = 'ok',
  icon,
  title,
  body,
  confirmLabel = 'Konfirmasi',
  cancelLabel  = 'Batal',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) {
  if (!open) return null;

  const ICON_DEFAULT = { ok: '✅', danger: '🗑️', warn: '⚠️' };

  return (
    <div className="kk-modal-overlay" onClick={onCancel}>
      <div className="kk-modal" onClick={e => e.stopPropagation()}>
        <div className={`kk-modal-icon ${type}`}>
          {icon ?? ICON_DEFAULT[type]}
        </div>
        <p className="kk-modal-title">{title}</p>
        {body && <p className="kk-modal-body">{body}</p>}
        <div className="kk-modal-btns">
          {onCancel && (
            <button className="btn-cancel" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </button>
          )}
          {onConfirm && (
            <button
              className={`btn-confirm${danger ? ' danger' : ''}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? '⏳ Memproses...' : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
