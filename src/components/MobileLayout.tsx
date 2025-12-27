import React, { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { BottomTabNav } from '@/components/BottomTabNav';
import { Header } from '@/components/Header';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showLogo?: boolean;
}

// Define page order for swipe navigation
const PAGE_ORDER = ['/dashboard', '/agenda', '/profile'];

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  }),
};

export function MobileLayout({ children, title, showLogo }: MobileLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [direction, setDirection] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const currentIndex = PAGE_ORDER.indexOf(location.pathname);

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isAnimating || currentIndex === -1) return;

    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 && velocity >= 0 && currentIndex > 0) {
        // Swipe right - go to previous page
        setDirection(-1);
        setIsAnimating(true);
        navigate(PAGE_ORDER[currentIndex - 1]);
      } else if (offset < 0 && velocity <= 0 && currentIndex < PAGE_ORDER.length - 1) {
        // Swipe left - go to next page
        setDirection(1);
        setIsAnimating(true);
        navigate(PAGE_ORDER[currentIndex + 1]);
      }
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!user) return null;

  return (
    <div className="mobile-app-container">
      {/* Header */}
      <Header title={title} showLogo={showLogo} />

      {/* Main Content with Swipe */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.main
          key={location.pathname}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          drag={currentIndex !== -1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleSwipe}
          className="mobile-page-content"
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <div className="page-inner touch-pan-y">
            {children}
          </div>
        </motion.main>
      </AnimatePresence>

      {/* Bottom Tab Navigation */}
      <BottomTabNav />
    </div>
  );
}
