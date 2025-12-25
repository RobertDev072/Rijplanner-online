import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Car, Fingerprint, Scan, User, Lock, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PinInput } from '@/components/PinInput';
import { toast } from 'sonner';
import { useBiometricAuth, getBiometricUsername } from '@/hooks/useBiometricAuth';

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-primary/20 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        transition={{
          duration: Math.random() * 20 + 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      />
    ))}
  </div>
);

// Animated car road
const AnimatedRoad = () => (
  <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
    <div className="absolute bottom-8 left-0 right-0 h-1 bg-muted-foreground/20" />
    <motion.div
      className="absolute bottom-6"
      initial={{ x: '-10%' }}
      animate={{ x: '110%' }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <Car className="w-8 h-8 text-primary" />
    </motion.div>
    {/* Road dashes */}
    <div className="absolute bottom-8 left-0 right-0 flex gap-4">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="w-8 h-0.5 bg-muted-foreground/30"
          initial={{ x: 0 }}
          animate={{ x: -100 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  </div>
);

// Glowing orbs
const GlowingOrbs = () => (
  <>
    <motion.div
      className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.5, 0.3, 0.5],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2,
      }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  </>
);

// Loading spinner with car
const LoadingSpinner = () => (
  <div className="flex items-center gap-3">
    <motion.div
      className="relative w-6 h-6"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-0 border-2 border-primary-foreground/30 rounded-full" />
      <div className="absolute inset-0 border-2 border-primary-foreground border-t-transparent rounded-full" />
    </motion.div>
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      Inloggen...
    </motion.span>
  </div>
);

// Biometric scan animation
const BiometricScanAnimation = ({ isScanning }: { isScanning: boolean }) => (
  <AnimatePresence>
    {isScanning && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative flex flex-col items-center gap-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="relative w-32 h-32 border-4 border-primary rounded-3xl flex items-center justify-center bg-background"
              animate={{
                borderColor: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--primary))'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Fingerprint className="w-16 h-16 text-primary" />
              <motion.div
                className="absolute inset-0 border-4 border-primary/50 rounded-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          </div>
          <motion.p
            className="text-lg font-medium text-foreground"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Scan je gezicht of vingerafdruk...
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <motion.div
            className="w-24 h-24 bg-success rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 10 }}
          >
            <CheckCircle2 className="w-12 h-12 text-success-foreground" />
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

  // Check for saved biometric username
  useEffect(() => {
    const savedUsername = getBiometricUsername();
    if (savedUsername && biometricRegistered) {
      setUsername(savedUsername);
    }
  }, [biometricRegistered]);

  const handleBiometricLogin = async () => {
    const savedUsername = getBiometricUsername();
    if (!savedUsername) {
      toast.error('Geen biometrische gegevens gevonden');
      return;
    }

    setIsBiometricScanning(true);
    setError('');

    try {
      const success = await authenticate();
      if (success) {
        // Get the pincode from localStorage (stored during registration)
        const storedPincode = localStorage.getItem('biometric_pincode');
        if (storedPincode) {
          const loginSuccess = await login(savedUsername, storedPincode);
          if (loginSuccess) {
            setShowSuccess(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          } else {
            setError('Biometrische login mislukt. Gebruik je pincode.');
          }
        } else {
          setError('Biometrische login mislukt. Gebruik je pincode.');
        }
      } else {
        setError('Biometrische verificatie mislukt');
      }
    } catch {
      setError('Biometrische login mislukt. Probeer het opnieuw.');
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
          const shouldRegister = window.confirm('Wil je Face ID / Touch ID instellen voor sneller inloggen?');
          if (shouldRegister) {
            const registered = await register(username);
            if (registered) {
              localStorage.setItem('biometric_pincode', pincode);
              toast.success('Biometrische login ingesteld!');
            }
          }
        }
        
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
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

      {/* Biometric scan overlay */}
      <BiometricScanAnimation isScanning={isBiometricScanning} />
      
      {/* Success overlay */}
      <SuccessAnimation show={showSuccess} />

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* App Logo */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="relative mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {/* Glow behind car */}
            <motion.div
              className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1.5, 1.7, 1.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative">
              <motion.div
                animate={{ 
                  rotateY: [0, 10, 0, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Car className="w-20 h-20 text-primary drop-shadow-lg" />
              </motion.div>
              
              {/* L badge */}
              <motion.div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 20px hsl(var(--primary) / 0.5)',
                    '0 0 40px hsl(var(--primary) / 0.8)',
                    '0 0 20px hsl(var(--primary) / 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-primary-foreground font-black text-sm">L</span>
              </motion.div>
              
              {/* Sparkle effect */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-accent" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1
            className="text-3xl font-bold text-foreground tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Rij<span className="text-primary">Planner</span>
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Rijlessen eenvoudig gepland
          </motion.p>
        </motion.div>

        {/* Biometric Quick Login */}
        {biometricAvailable && biometricRegistered && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={handleBiometricLogin}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 flex flex-col items-center gap-3 hover:border-primary/40 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isBiometricScanning}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 0 0 hsl(var(--primary) / 0)',
                    '0 0 0 10px hsl(var(--primary) / 0.1)',
                    '0 0 0 0 hsl(var(--primary) / 0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Scan className="w-8 h-8 text-primary" />
              </motion.div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Face ID / Touch ID</p>
                <p className="text-xs text-muted-foreground">Snel inloggen met biometrie</p>
              </div>
            </motion.button>
            
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">of gebruik pincode</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <motion.div
              className="space-y-2"
              animate={{
                scale: focusedField === 'username' ? 1.02 : 1,
              }}
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
                  className="h-12 bg-background/50 border-border focus:border-primary transition-all duration-300 pr-10"
                />
                <AnimatePresence>
                  {username.length > 0 && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
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
              animate={{
                scale: focusedField === 'pincode' ? 1.02 : 1,
              }}
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
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 shadow-lg transition-all duration-300 relative overflow-hidden group"
                disabled={isLoading}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={isLoading ? {} : { x: '100%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                />
                {isLoading ? <LoadingSpinner /> : 'Inloggen'}
              </Button>
            </motion.div>
          </form>

          {/* Biometric setup hint */}
          {biometricAvailable && !biometricRegistered && (
            <motion.p
              className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Fingerprint className="w-3 h-3" />
              Face ID / Touch ID beschikbaar na eerste login
            </motion.p>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-muted-foreground opacity-60">
            Tip: Voeg deze app toe aan je startscherm
          </p>
          <p className="text-xs text-muted-foreground/50">
            Ontwikkeld door <span className="font-medium">ROBERTDEV.NL</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
