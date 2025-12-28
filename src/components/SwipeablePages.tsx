import React from 'react';

interface SwipeablePagesProps {
  children: React.ReactNode;
}

// Simplified wrapper - swipe removed to prevent conflicts with other drag gestures
export function SwipeablePages({ children }: SwipeablePagesProps) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}
