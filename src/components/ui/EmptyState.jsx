import React from 'react';
import clsx from 'clsx';
import Button from './Button';

export default function EmptyState({
  icon,
  title = 'Tidak Ada Data',
  description,
  action,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="text-5xl mb-4 select-none">{icon}</div>
      )}
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs">{description}</p>
      )}
      {(action || onAction) && (
        <div className="mt-5">
          {action ?? (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
