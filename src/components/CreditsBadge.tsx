import React from 'react';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditsBadgeProps {
  credits: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CreditsBadge({ credits, size = 'md', showLabel = true }: CreditsBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        credits > 0
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive",
        sizeClasses[size]
      )}
    >
      <Coins className={iconSizes[size]} />
      <span>{credits}</span>
      {showLabel && <span className="font-normal">credits</span>}
    </div>
  );
}
