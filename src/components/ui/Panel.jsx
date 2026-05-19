import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

export default function Panel({
  isOpen,
  onClose,
  title,
  subtitle,
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
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div 
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-fade-in"
      />
      
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div 
          className={clsx(
            "pointer-events-auto w-screen animate-slide-left shadow-2xl bg-white flex flex-col",
            SIZE_CLASSES[size]
          )}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
              {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all"
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 px-6 py-5 border-t border-gray-100 flex justify-end items-center space-x-3 bg-white sticky bottom-0 z-10">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
