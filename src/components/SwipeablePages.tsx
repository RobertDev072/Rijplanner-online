import React, { useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// Define swipeable page order
const SWIPE_PAGES = ['/dashboard', '/agenda', '/profile'];

interface SwipeablePagesProps {
  children: React.ReactNode;
}

export function SwipeablePages({ children }: SwipeablePagesProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const x = useMotionValue(0);
  const currentIndex = SWIPE_PAGES.indexOf(location.pathname);
  const isSwipeable = currentIndex !== -1;

  // Calculate opacity for edge indicators
  const leftIndicatorOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  const rightIndicatorOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isSwipeable || isAnimating) return;

      const threshold = 80;
      const velocity = Math.abs(info.velocity.x);
      const offset = info.offset.x;

      // Require either significant offset or high velocity
      if (Math.abs(offset) > threshold || velocity > 500) {
        if (offset > 0 && currentIndex > 0) {
          // Swipe right - go to previous page
          setIsAnimating(true);
          navigate(SWIPE_PAGES[currentIndex - 1]);
        } else if (offset < 0 && currentIndex < SWIPE_PAGES.length - 1) {
          // Swipe left - go to next page
          setIsAnimating(true);
          navigate(SWIPE_PAGES[currentIndex + 1]);
        }
      }
    },
    [isSwipeable, isAnimating, currentIndex, navigate]
  );

  // Get page name for indicators
  const getPageName = (index: number) => {
    switch (SWIPE_PAGES[index]) {
      case '/dashboard':
        return 'Home';
      case '/agenda':
        return 'Agenda';
      case '/profile':
        return 'Profiel';
      default:
        return '';
    }
  };

  if (!user) return <>{children}</>;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Left edge indicator */}
      {isSwipeable && currentIndex > 0 && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
          style={{ opacity: leftIndicatorOpacity }}
        >
          <div className="flex items-center gap-2 pl-2 pr-4 py-3 bg-primary/10 backdrop-blur-sm rounded-r-2xl border border-l-0 border-primary/20">
            <div className="w-1 h-8 bg-primary/40 rounded-full" />
            <span className="text-xs font-medium text-primary">{getPageName(currentIndex - 1)}</span>
          </div>
        </motion.div>
      )}

      {/* Right edge indicator */}
      {isSwipeable && currentIndex < SWIPE_PAGES.length - 1 && (
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
          style={{ opacity: rightIndicatorOpacity }}
        >
          <div className="flex items-center gap-2 pr-2 pl-4 py-3 bg-primary/10 backdrop-blur-sm rounded-l-2xl border border-r-0 border-primary/20">
            <span className="text-xs font-medium text-primary">{getPageName(currentIndex + 1)}</span>
            <div className="w-1 h-8 bg-primary/40 rounded-full" />
          </div>
        </motion.div>
      )}

      {/* Page dots indicator */}
      {isSwipeable && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-full border border-border/40">
          {SWIPE_PAGES.map((page, index) => (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={getPageName(index)}
            />
          ))}
        </div>
      )}

      {/* Swipeable content */}
      <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
        <motion.div
          key={location.pathname}
          className="w-full h-full"
          initial={{ opacity: 0, x: isSwipeable ? 100 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSwipeable ? -100 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          drag={isSwipeable ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          style={{ x }}
          whileDrag={{ cursor: 'grabbing' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
