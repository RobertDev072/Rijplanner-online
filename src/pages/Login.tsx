import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Car, User, Lock, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PinInput } from '@/components/PinInput';

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-primary/20 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: Math.random() * 3 + 4,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

// Animated car road
const AnimatedRoad = () => (
  <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
    <div className="absolute bottom-8 left-0 right-0 h-0.5 bg-muted-foreground/20" />
    <motion.div
      className="absolute bottom-5"
      initial={{ x: '-10%' }}
      animate={{ x: '110%' }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <Car className="w-6 h-6 text-primary/50" />
    </motion.div>
  </div>
);

// Glowing orbs
const GlowingOrbs = () => (
  <>
    <motion.div
      className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
      animate={{
        scale: [1.1, 1, 1.1],
        opacity: [0.25, 0.15, 0.25],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 3,
      }}
    />
  </>
);

// Loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center gap-3">
    <motion.div
      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
    <span>Inloggen...</span>
  </div>
);

// Success animation
const SuccessAnimation = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <motion.div
            className="w-20 h-20 bg-success rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 10 }}
          >
            <CheckCircle2 className="w-10 h-10 text-success-foreground" />
          </motion.div>
          <motion.p
            className="text-xl font-semibold text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Welkom terug!
          </motion.p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Voer je gebruikersnaam in');
      return;
    }

    if (pincode.length !== 4) {
      setError('Voer een 4-cijferige pincode in');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(username, pincode);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError('Ongeldige gebruikersnaam of pincode');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated background */}
      <GlowingOrbs />
      <FloatingParticles />
      <AnimatedRoad />

      {/* Success overlay */}
      <SuccessAnimation show={showSuccess} />

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* App Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="relative mb-4"
            whileHover={{ scale: 1.05 }}
          >
            {/* Glow */}
            <motion.div
              className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative">
              <Car className="w-16 h-16 text-primary drop-shadow-lg" />
              
              {/* L badge */}
              <motion.div
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 15px hsl(var(--primary) / 0.4)',
                    '0 0 25px hsl(var(--primary) / 0.6)',
                    '0 0 15px hsl(var(--primary) / 0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-primary-foreground font-black text-xs">L</span>
              </motion.div>
              
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
            </div>
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Rij<span className="text-primary">Planner</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Rijlessen eenvoudig gepland
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Gebruikersnaam
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Voer je gebruikersnaam in"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="username"
                  autoCapitalize="none"
                  className="h-12 bg-background/50 border-border focus:border-primary transition-colors"
                />
                <AnimatePresence>
                  {username.length > 0 && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Shield className="w-4 h-4 text-success" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Pincode field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Pincode
              </label>
              <PinInput value={pincode} onChange={setPincode} />
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-xl border border-destructive/20"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Inloggen'}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Heb je nog geen account? Neem contact op met je rijschool.
        </motion.p>
      </motion.div>
    </div>
  );
}