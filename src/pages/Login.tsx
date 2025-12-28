import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Car, User, Lock, CheckCircle2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PinInput } from '@/components/PinInput';

// Modern gradient background
const GradientBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
    <motion.div
      className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.3, 0.2],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-0 left-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl"
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
  </div>
);

// Success animation
const SuccessAnimation = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <motion.div
            className="w-20 h-20 bg-success rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 12 }}
          >
            <Check className="w-10 h-10 text-success-foreground stroke-[3]" />
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
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect als al ingelogd - FIX voor de reload bug
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

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
          navigate('/dashboard', { replace: true });
        }, 800);
      } else {
        setError('Ongeldige gebruikersnaam of pincode');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  // Niet renderen terwijl we checken of user al ingelogd is
  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <GradientBackground />
      <SuccessAnimation show={showSuccess} />

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* App Logo */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div className="relative mb-5" whileHover={{ scale: 1.05 }}>
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="w-10 h-10 text-primary-foreground" />
            </div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-md"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-accent-foreground font-black text-sm">L</span>
            </motion.div>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Rij<span className="text-primary">Planner</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Rijlessen eenvoudig gepland
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  autoComplete="username"
                  autoCapitalize="none"
                  className="h-12 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                />
                <AnimatePresence>
                  {username.length > 0 && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-success-foreground stroke-[3]" />
                      </div>
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
              <AnimatePresence>
                {pincode.length === 4 && (
                  <motion.div
                    className="flex items-center gap-2 text-success text-sm"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Pincode compleet</span>
                  </motion.div>
                )}
              </AnimatePresence>
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
              className="w-full h-12 text-base font-semibold shadow-lg rounded-xl bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Inloggen...</span>
                </div>
              ) : (
                'Inloggen'
              )}
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