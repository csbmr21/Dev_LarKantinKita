import React from 'react';
import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'w-8 h-4',
  md: 'w-11 h-6',
};

const THUMB_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
};

const TRANSLATE = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  labelPosition = 'right',
  disabled = false,
  size = 'md',
  className,
}) {
  return (
    <label
      className={clsx(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {label && labelPosition === 'left' && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && onChange?.(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={clsx(
            'rounded-full transition-colors duration-200',
            SIZE_CLASSES[size],
            checked ? 'bg-[#2D6A4F]' : 'bg-gray-300'
          )}
        />
        <div
          className={clsx(
            'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200',
            THUMB_SIZES[size],
            checked ? TRANSLATE[size] : 'translate-x-0'
          )}
        />
      </div>
      {label && labelPosition === 'right' && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
}
