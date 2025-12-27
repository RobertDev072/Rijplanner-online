import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PageSkeletonProps {
  type?: 'dashboard' | 'list' | 'form' | 'profile';
}

export function PageSkeleton({ type = 'dashboard' }: PageSkeletonProps) {
  if (type === 'profile') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-fade-in">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  // Dashboard type
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="h-5 w-32" />

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
