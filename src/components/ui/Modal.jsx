import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === overlayRef.current) onClose?.();
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-xl)',
        }}
        className={clsx(
          'relative bg-white w-full focus:outline-none',
          'animate-slide-up sm:animate-scale-in',
          SIZE_CLASSES[size]
        )}
        tabIndex="-1"
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 id="modal-title" className="text-base font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Tutup modal"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 z-10"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}

        {/* Body */}
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
