import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-login-navy via-login-navy-light to-login-navy flex flex-col items-center justify-center z-50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-login-amber/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-login-amber/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo with animations */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-login-amber/15 blur-3xl rounded-full scale-150" />
        
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
            <Car className="w-28 h-28 text-login-amber drop-shadow-2xl" />
            {/* L badge on roof */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg border-2 border-login-amber">
              <span className="text-login-navy font-black text-xl">L</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <h1 className="text-3xl font-bold text-white">
            Rij<span className="text-login-amber">Planner</span>
          </h1>
          <p className="text-login-muted text-sm mt-1">Rijlessen eenvoudig gepland</p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-login-amber rounded-full"
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

      {/* Copyright footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-login-muted/60 text-xs">
          Ontwikkeld door <span className="font-semibold text-login-muted">ROBERTDEV.NL</span>
        </p>
      </motion.div>
    </div>
  );
}
