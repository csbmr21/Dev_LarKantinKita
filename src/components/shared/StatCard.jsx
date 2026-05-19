import React from 'react';
import clsx from 'clsx';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  trendLabel,
  color = 'primary',
  className,
}) {
  const colorMap = {
    primary:  { bg: 'bg-[#f0fdf4]', icon: 'text-[#2D6A4F]', badge: 'bg-[#2D6A4F]' },
    orange:   { bg: 'bg-orange-50',  icon: 'text-orange-500', badge: 'bg-orange-500' },
    blue:     { bg: 'bg-blue-50',    icon: 'text-blue-500',   badge: 'bg-blue-500'   },
    purple:   { bg: 'bg-purple-50',  icon: 'text-purple-500', badge: 'bg-purple-500' },
    red:      { bg: 'bg-red-50',     icon: 'text-red-500',    badge: 'bg-red-500'    },
  };

  const c = colorMap[color] ?? colorMap.primary;
  const isUp = trend === 'up';

  return (
    <div className={clsx('bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {icon && (
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', c.bg)}>
            <span className={clsx('w-5 h-5', c.icon)}>{icon}</span>
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-gray-800 mb-1">{value ?? '—'}</p>

      {subtitle && (
        <p className="text-xs text-gray-400">{subtitle}</p>
      )}

      {trendValue != null && (
        <div className="flex items-center gap-1 mt-2">
          {isUp ? (
            <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <ArrowTrendingDownIcon className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={clsx('text-xs font-medium', isUp ? 'text-green-600' : 'text-red-600')}>
            {trendValue}
          </span>
          {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
