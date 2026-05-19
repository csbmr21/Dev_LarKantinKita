import React from 'react';
import clsx from 'clsx';

const VARIANT_STYLES = {
  success: { background: 'var(--c-emerald-100)', color: 'var(--c-emerald-600)' },
  warning: { background: 'var(--c-amber-100)',   color: 'var(--c-amber-700)'   },
  danger:  { background: 'var(--c-red-100)',      color: 'var(--c-red-600)'    },
  info:    { background: 'var(--c-blue-100)',     color: 'var(--c-blue-600)'   },
  gray:    { background: 'var(--c-neutral-100)',  color: 'var(--c-neutral-600)' },
  primary: { background: 'var(--c-primary-100)', color: 'var(--c-primary-700)' },
  orange:  { background: '#FFEDD5',              color: '#C2410C'              },
  purple:  { background: 'var(--c-violet-100)',  color: 'var(--c-violet-500)'  },
};

const DOT_COLORS = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  gray:    'bg-gray-400',
  primary: 'bg-[var(--c-primary-700)]',
  orange:  'bg-orange-500',
  purple:  'bg-purple-500',
};

const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className,
}) {
  return (
    <span
      style={{ fontFamily: 'var(--font-sans)', borderRadius: 'var(--r-full)', ...VARIANT_STYLES[variant] }}
      className={clsx(
        'inline-flex items-center gap-1 font-medium',
        SIZES[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLORS[variant])}
        />
      )}
      {children}
    </span>
  );
}
