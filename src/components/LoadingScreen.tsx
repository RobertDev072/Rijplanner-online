import React from 'react';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Laden...' }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50"
    >
      {/* Animated car */}
      <div className="relative mb-8">
        <motion.div
          animate={{
            x: [0, 10, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl">
            <Car className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Road dots animation */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/30"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground font-medium"
      >
        {message}
      </motion.p>

      {/* Progress bar */}
      <motion.div
        className="w-48 h-1 bg-muted rounded-full mt-4 overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
