import React from 'react';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Laden...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col items-center justify-center z-50">
      {/* Animated background - same as SplashScreen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo with animations - consistent with SplashScreen */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full scale-150" />
        
        {/* Car icon with L badge */}
        <motion.div
          className="relative z-10"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="relative">
            <Car className="w-20 h-20 text-primary drop-shadow-xl" />
            {/* L badge on roof */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-black text-base">L</span>
            </div>
          </div>
        </motion.div>
        
        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-muted-foreground font-medium"
        >
          {message}
        </motion.p>

        {/* Loading dots - same as SplashScreen */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
