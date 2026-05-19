import React from 'react';
import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
  xl: 'w-14 h-14 border-4',
};

const COLOR_CLASSES = {
  primary: 'border-[#2D6A4F] border-t-transparent',
  white:   'border-white border-t-transparent',
  gray:    'border-gray-400 border-t-transparent',
};

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullPage = false,
  label,
  className,
}) {
  const spinner = (
    <div
      className={clsx(
        'rounded-full animate-spin flex-shrink-0',
        SIZE_CLASSES[size],
        COLOR_CLASSES[color],
        className
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50 gap-3">
        <div className={clsx('rounded-full animate-spin', SIZE_CLASSES.xl, COLOR_CLASSES.primary)} />
        <p className="text-sm text-gray-500 font-medium">Memuat...</p>
      </div>
    );
  }

  if (label) {
    return (
      <div className="flex items-center gap-2">
        {spinner}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    );
  }

  return spinner;
}
