import React, { useState, forwardRef } from 'react';
import clsx from 'clsx';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    type = 'text',
    prefix,
    suffix,
    className,
    containerClassName,
    textarea = false,
    rows = 3,
    required,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseInput = clsx(
    'w-full border bg-white px-3 py-2.5 text-sm text-gray-900',
    'placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors duration-150',
    error
      ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-300 focus:ring-[var(--c-primary-700)]/20 focus:border-[var(--c-primary-700)]',
    prefix && 'pl-10',
    (suffix || isPassword) && 'pr-10',
    className
  );

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }} className={clsx('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {prefix}
          </span>
        )}
        {textarea ? (
          <textarea
            ref={ref}
            rows={rows}
            className={clsx(baseInput, 'resize-none')}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={inputType}
            className={baseInput}
            {...props}
          />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        )}
        {suffix && !isPassword && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
});

export default Input;
