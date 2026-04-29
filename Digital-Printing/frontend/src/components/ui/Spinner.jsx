import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './Skeleton';

export function Spinner({ className, size = 24, ...props }) {
  return (
    <Loader2 
      className={cn("animate-spin text-primary-600", className)} 
      size={size} 
      {...props} 
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 backdrop-blur-sm fixed inset-0 z-50">
      <div className="glass-card p-6 rounded-2xl flex flex-col items-center space-y-4">
        <Spinner size={40} />
        <p className="text-slate-600 font-medium">Memuat...</p>
      </div>
    </div>
  );
}
