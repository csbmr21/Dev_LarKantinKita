import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showInfo = true,
  totalItems,
  perPage,
  className,
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  const renderPage = (p, key) => (
    <button
      key={key}
      onClick={() => onPageChange(p)}
      className={clsx(
        'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
        p === currentPage
          ? 'bg-[#2D6A4F] text-white'
          : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      {p}
    </button>
  );

  const rendered = [];
  let prev = null;
  for (const p of visiblePages) {
    if (prev && p - prev > 1) {
      rendered.push(<span key={`ellipsis-${p}`} className="text-gray-400 text-sm px-1">…</span>);
    }
    rendered.push(renderPage(p, p));
    prev = p;
  }

  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
        </button>
        {rendered}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      {showInfo && totalItems != null && (
        <p className="text-xs text-gray-400">
          Menampilkan {Math.min((currentPage - 1) * perPage + 1, totalItems)}–
          {Math.min(currentPage * perPage, totalItems)} dari {totalItems} data
        </p>
      )}
    </div>
  );
}
