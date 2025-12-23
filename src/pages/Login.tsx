import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Car } from 'lucide-react';
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
        toast.success('Welkom terug!', { duration: 1500 });
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* App Name with car icon */}
        <div className="flex flex-col items-center mb-12">
          {/* Car icon with L badge */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
            <div className="relative">
              <Car className="w-20 h-20 text-primary drop-shadow-lg" />
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-black text-sm">L</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Rij<span className="text-primary">Planner</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Rijlessen eenvoudig gepland</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
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
                className="h-12 bg-background/50 border-border focus:border-primary transition-all duration-300"
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
              className="w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-muted-foreground opacity-60">
            Tip: Voeg deze app toe aan je startscherm
          </p>
          <p className="text-xs text-muted-foreground/50">
            Ontwikkeld door <span className="font-medium">ROBERTDEV.NL</span>
          </p>
        </div>
      </div>
    </div>
  );
}
