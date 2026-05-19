import React from 'react';
import clsx from 'clsx';

function SkeletonBase({ className }) {
  return (
    <div className={clsx('animate-pulse bg-gray-200 rounded', className)} />
  );
}

export function SkeletonLine({ width = 'w-full', height = 'h-4', className }) {
  return <SkeletonBase className={clsx(width, height, 'rounded-md', className)} />;
}

export function SkeletonCircle({ size = 'w-10 h-10', className }) {
  return <SkeletonBase className={clsx(size, '!rounded-full', className)} />;
}

export function SkeletonCard({ className }) {
  return (
    <div style={{ borderRadius: 'var(--r-lg)', fontFamily: 'var(--font-sans)' }} className={clsx('bg-white p-4 space-y-3 shadow-sm', className)}>
      <SkeletonBase className="w-full h-36 rounded-lg" />
      <SkeletonLine width="w-3/4" />
      <SkeletonLine width="w-1/2" height="h-3" />
      <div className="flex justify-between items-center pt-1">
        <SkeletonLine width="w-1/3" height="h-5" />
        <SkeletonBase className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonOrderCard({ className }) {
  return (
    <div style={{ borderRadius: 'var(--r-lg)' }} className={clsx('bg-white p-4 space-y-3 shadow-sm border border-gray-100', className)}>
      <div className="flex justify-between">
        <SkeletonLine width="w-1/3" height="h-4" />
        <SkeletonLine width="w-1/4" height="h-4" />
      </div>
      <SkeletonLine width="w-full" height="h-3" />
      <SkeletonLine width="w-2/3" height="h-3" />
      <div className="flex justify-between pt-1">
        <SkeletonLine width="w-1/4" height="h-5" />
        <SkeletonBase className="w-20 h-7 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4, Card = SkeletonOrderCard }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

// Default export — generic skeleton line
export default function Skeleton({ className, width, height }) {
  return <SkeletonLine className={className} width={width} height={height} />;
}
