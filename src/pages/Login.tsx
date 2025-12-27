import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Car, Fingerprint, Scan, User, Lock, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PinInput } from '@/components/PinInput';
import { toast } from 'sonner';
import { useBiometricAuth, getBiometricCredentials } from '@/hooks/useBiometricAuth';

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-primary/20 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: Math.random() * 3 + 3,
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
        duration: 8,
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
      className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/15 rounded-full blur-3xl"
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.2, 0.4],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2,
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

// Biometric scan animation
const BiometricScanAnimation = ({ isScanning }: { isScanning: boolean }) => (
  <AnimatePresence>
    {isScanning && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="relative w-28 h-28 border-4 border-primary rounded-3xl flex items-center justify-center bg-background shadow-xl"
              animate={{
                borderColor: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--primary))'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Fingerprint className="w-14 h-14 text-primary" />
              <motion.div
                className="absolute inset-0 border-4 border-primary/30 rounded-3xl"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </div>
          <motion.p
            className="text-lg font-medium text-foreground"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Verifieer met Face ID / Touch ID...
          </motion.p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
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
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { isAvailable: biometricAvailable, isRegistered: biometricRegistered, authenticate, register } = useBiometricAuth();

  // Load saved username if biometric is registered
  useEffect(() => {
    const credentials = getBiometricCredentials();
    if (credentials && biometricRegistered) {
      setUsername(credentials.username);
    }
  }, [biometricRegistered]);

  const handleBiometricLogin = async () => {
    const credentials = getBiometricCredentials();
    if (!credentials) {
      toast.error('Geen biometrische gegevens gevonden');
      return;
    }

    setIsBiometricScanning(true);
    setError('');

    try {
      const success = await authenticate();
      if (success) {
        // Use stored credentials to log in
        const loginSuccess = await login(credentials.username, credentials.pincode);
        if (loginSuccess) {
          setShowSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1200);
        } else {
          setError('Login mislukt. Gebruik je pincode.');
        }
      } else {
        setError('Biometrische verificatie geannuleerd');
      }
    } catch {
      setError('Biometrische login mislukt');
    } finally {
      setIsBiometricScanning(false);
    }
  };

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
        // Offer to register biometric if available and not registered
        if (biometricAvailable && !biometricRegistered) {
          try {
            const shouldRegister = window.confirm(
              'Wil je Face ID / Touch ID instellen voor sneller inloggen?'
            );
            if (shouldRegister) {
              const registered = await register(username, pincode);
              if (registered) {
                toast.success('Face ID / Touch ID ingesteld!');
              }
            }
          } catch (err) {
            console.error('Biometric registration skipped:', err);
          }
        }
        
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
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

      {/* Overlays */}
      <BiometricScanAnimation isScanning={isBiometricScanning} />
      <SuccessAnimation show={showSuccess} />

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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

        {/* Biometric Quick Login - Only show if registered */}
        {biometricAvailable && biometricRegistered && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={handleBiometricLogin}
              className="w-full py-5 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/20 flex flex-col items-center gap-3 active:scale-[0.98] active:bg-primary/20 transition-all"
              whileTap={{ scale: 0.97 }}
              disabled={isBiometricScanning}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30"
                animate={{
                  boxShadow: [
                    '0 8px 25px hsl(var(--primary) / 0.25)',
                    '0 12px 35px hsl(var(--primary) / 0.4)',
                    '0 8px 25px hsl(var(--primary) / 0.25)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Fingerprint className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <div className="text-center">
                <p className="font-bold text-foreground">Inloggen met biometrie</p>
                <p className="text-xs text-muted-foreground mt-0.5">Face ID of Touch ID</p>
              </div>
            </motion.button>
            
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">of met pincode</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <motion.div
              className="space-y-2"
              animate={{ scale: focusedField === 'username' ? 1.01 : 1 }}
              transition={{ duration: 0.2 }}
            >
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
                  className="h-11 bg-background/50 border-border focus:border-primary transition-all pr-9"
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
            </motion.div>

            {/* Pincode field */}
            <motion.div
              className="space-y-2"
              animate={{ scale: focusedField === 'pincode' ? 1.01 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Pincode
              </label>
              <div
                onFocus={() => setFocusedField('pincode')}
                onBlur={() => setFocusedField(null)}
              >
                <PinInput value={pincode} onChange={setPincode} />
              </div>
            </motion.div>

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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                size="lg"
                className="w-full h-11 shadow-lg relative overflow-hidden"
                disabled={isLoading}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                {isLoading ? <LoadingSpinner /> : 'Inloggen'}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-6 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-muted-foreground/60">
            Tip: Voeg deze app toe aan je startscherm
          </p>
          <p className="text-xs text-muted-foreground/40">
            Ontwikkeld door <span className="font-medium">ROBERTDEV.NL</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
