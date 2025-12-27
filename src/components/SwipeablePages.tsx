import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  
  const currentIndex = SWIPE_PAGES.indexOf(location.pathname);
  const isSwipeable = currentIndex !== -1;

  // Simple touch handling
  const touchStartX = React.useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwipeable) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 80;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < SWIPE_PAGES.length - 1) {
        // Swipe left - next page
        navigate(SWIPE_PAGES[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous page
        navigate(SWIPE_PAGES[currentIndex - 1]);
      }
    }
  }, [isSwipeable, currentIndex, navigate]);

  if (!user) return <>{children}</>;

  return (
    <div 
      className="w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Simple page dots - no labels */}
      {isSwipeable && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-full border border-border/40">
          {SWIPE_PAGES.map((page, index) => (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={`transition-all duration-200 rounded-full ${
                index === currentIndex
                  ? 'w-5 h-2 bg-primary'
                  : 'w-2 h-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
