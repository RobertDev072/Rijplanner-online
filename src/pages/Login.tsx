/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Car, User, Lock, Check, Shield, Star, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PinInput } from '@/components/PinInput';

// Animated gradient background with floating elements
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
    
    {/* Animated floating circles */}
    <motion.div
      className="absolute top-10 right-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl"
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.1, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-20 left-5 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
      animate={{
        y: [0, 15, 0],
        scale: [1.1, 1, 1.1],
        opacity: [0.1, 0.2, 0.1],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.1, 0.15, 0.1],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Subtle grid pattern overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_60%,transparent_100%)]" />
  </div>
);

// Success animation with ripple effect
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
          {/* Success circle with ripple effect */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-success/20 rounded-full"
              initial={{ scale: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8, repeat: 2 }}
            />
            <motion.div
              className="w-24 h-24 bg-success rounded-full flex items-center justify-center shadow-lg relative z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 12 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Check className="w-12 h-12 text-success-foreground stroke-[3]" />
              </motion.div>
            </motion.div>
          </div>
          <motion.p
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Welkom terug!
          </motion.p>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Je wordt doorgestuurd...
          </motion.p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Trust badge component
const TrustBadge = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <motion.div 
    className="flex items-center gap-1.5 text-muted-foreground/80"
    whileHover={{ scale: 1.02 }}
  >
    <Icon className="w-3.5 h-3.5" />
    <span className="text-xs">{text}</span>
  </motion.div>
);

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect als al ingelogd
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

  // Toon laadscherm terwijl we checken of user al ingelogd is
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-lg flex items-center justify-center shadow-md">
              <span className="text-accent-foreground font-black text-xs">L</span>
            </div>
          </div>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <SuccessAnimation show={showSuccess} />

      {/* Header with back button */}
      <motion.header 
        className="relative z-10 p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Terug naar home</span>
        </Link>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <motion.div
          className="w-full max-w-sm relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* App Logo with enhanced animation */}
          <motion.div
            className="flex flex-col items-center mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="relative mb-5" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl scale-150"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                <Car className="w-10 h-10 text-primary-foreground" />
              </div>
              
              {/* L Badge with pulse */}
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-md z-20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
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

          {/* Login Form Card */}
          <motion.div
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-xl"
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

              {/* Submit button with enhanced styling */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-semibold shadow-lg rounded-xl bg-primary hover:bg-primary/90 transition-all"
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

          {/* Trust badges */}
          <motion.div
            className="flex justify-center gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TrustBadge icon={Shield} text="AVG-compliant" />
            <TrustBadge icon={Star} text="SSL beveiligd" />
          </motion.div>

          {/* Help text */}
          <motion.p
            className="text-center text-xs text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Geen account? Neem contact op met je rijschool.
          </motion.p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 py-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-muted-foreground">
          © 2026 <span className="font-semibold text-foreground">RijPlanner</span>
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          Gebouwd door <span className="font-medium">ROBERTDEV.NL</span>
        </p>
      </motion.footer>
    </div>
  );
}
