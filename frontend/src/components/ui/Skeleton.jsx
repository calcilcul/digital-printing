import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to merge tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  );
}
