import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PinInput } from '@/components/PinInput';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        toast.success('Welkom terug!');
        navigate('/dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
            <img 
              src="/logo.png" 
              alt="RijPlanner" 
              className="w-28 h-28 object-contain relative z-10 drop-shadow-xl"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold text-foreground">RijPlanner</h1>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-center">Rijlessen eenvoudig gepland</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Gebruikersnaam
              </label>
              <Input
                type="text"
                placeholder="Voer je gebruikersnaam in"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Pincode
              </label>
              <PinInput value={pincode} onChange={setPincode} />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-xl border border-destructive/20 animate-scale-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Inloggen...
                </span>
              ) : (
                'Inloggen'
              )}
            </Button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="mt-8 p-4 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/40 shadow-sm">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Demo accounts:</strong><br />
            <span className="text-xs mt-1 inline-block">
              admin / 1234 • instructeur1 / 5678 • leerling1 / 9012
            </span>
          </p>
        </div>

        {/* Install hint for PWA */}
        <p className="text-xs text-muted-foreground text-center mt-6 opacity-60">
          Tip: Voeg deze app toe aan je startscherm voor de beste ervaring
        </p>
      </div>
    </div>
  );
}
