import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const PULL_THRESHOLD = 60;
const MAX_PULL = 100;

export function PullToRefresh({ children, onRefresh, className = '' }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, PULL_THRESHOLD / 2, PULL_THRESHOLD], [0, 0.5, 1]);
  const scale = useTransform(y, [0, PULL_THRESHOLD], [0.6, 1]);
  const indicatorY = useTransform(y, [0, MAX_PULL], [-40, 20]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container && container.scrollTop <= 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0 || isRefreshing) return;

    const deltaY = e.touches[0].clientY - startY.current;
    
    if (deltaY > 0) {
      e.preventDefault();
      const pullDistance = Math.min(deltaY * 0.4, MAX_PULL);
      currentY.current = pullDistance;
      y.set(pullDistance);
    }
  }, [isRefreshing, y]);

  const handleTouchEnd = useCallback(async () => {
    if (currentY.current >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      animate(y, 50, { duration: 0.2 });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        animate(y, 0, { duration: 0.3, ease: 'easeOut' });
      }
    } else {
      animate(y, 0, { duration: 0.3, ease: 'easeOut' });
    }
    
    startY.current = 0;
    currentY.current = 0;
  }, [isRefreshing, onRefresh, y]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Minimal indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        style={{ y: indicatorY, opacity, scale }}
      >
        <motion.div
          className={`
            w-9 h-9 rounded-full flex items-center justify-center
            backdrop-blur-md border shadow-lg
            ${isRefreshing 
              ? 'bg-primary/90 border-primary/50 text-primary-foreground' 
              : 'bg-background/80 border-border/50 text-muted-foreground'
            }
          `}
        >
          <Loader2 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: isRefreshing ? undefined : `rotate(${currentY.current * 3}deg)` 
            }}
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden overscroll-none"
        style={{ y: useTransform(y, [0, MAX_PULL], [0, 30]) }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
