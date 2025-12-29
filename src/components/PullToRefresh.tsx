import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

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

