import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ children, onRefresh, className = '' }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);
  const rotation = useTransform(y, [0, PULL_THRESHOLD, MAX_PULL], [0, 180, 360]);
  const scale = useTransform(y, [0, PULL_THRESHOLD / 2, PULL_THRESHOLD], [0.5, 0.8, 1]);
  const opacity = useTransform(y, [0, 20, PULL_THRESHOLD], [0, 0.5, 1]);

  const handleDragStart = useCallback(() => {
    const container = containerRef.current;
    if (container && container.scrollTop <= 0) {
      setIsPulling(true);
    }
  }, []);

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const container = containerRef.current;
      if (!container || container.scrollTop > 0 || isRefreshing) {
        y.set(0);
        return;
      }

      // Only allow pulling down
      if (info.offset.y > 0) {
        const pullDistance = Math.min(info.offset.y * 0.5, MAX_PULL);
        y.set(pullDistance);
      }
    },
    [isRefreshing, y]
  );

  const handleDragEnd = useCallback(
    async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsPulling(false);
      
      if (y.get() >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        y.set(60); // Keep indicator visible during refresh
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          y.set(0);
        }
      } else {
        y.set(0);
      }
    },
    [isRefreshing, onRefresh, y]
  );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center"
        style={{ 
          y: useTransform(y, [0, MAX_PULL], [-50, 10]),
          opacity,
          scale,
        }}
      >
        <motion.div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isRefreshing 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card border border-border shadow-md'
          }`}
          style={{ rotate: isRefreshing ? undefined : rotation }}
          animate={isRefreshing ? { rotate: 360 } : undefined}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>
        <motion.p
          className="text-xs text-muted-foreground mt-2 font-medium"
          style={{ opacity: useTransform(y, [20, PULL_THRESHOLD], [0, 1]) }}
        >
          {isRefreshing ? 'Vernieuwen...' : 'Trek naar beneden'}
        </motion.p>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="min-h-screen overflow-y-auto overflow-x-hidden touch-pan-y"
        style={{ y: isPulling || isRefreshing ? y : 0 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        dragDirectionLock
      >
        {children}
      </motion.div>
    </div>
  );
}
