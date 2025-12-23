import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Car, Gauge, Key, Milestone, CircleDot } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-login-navy via-login-navy-light to-login-navy flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated car icons floating in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left car */}
        <div className="absolute top-[10%] left-[8%] animate-float-slow opacity-20">
          <Car className="w-12 h-12 text-login-amber" />
        </div>
        
        {/* Top right gauge */}
        <div className="absolute top-[15%] right-[12%] animate-float-delayed opacity-15">
          <Gauge className="w-10 h-10 text-login-amber-light" />
        </div>
        
        {/* Middle left key */}
        <div className="absolute top-[40%] left-[5%] animate-float opacity-20">
          <Key className="w-8 h-8 text-login-amber" />
        </div>
        
        {/* Middle right milestone */}
        <div className="absolute top-[35%] right-[8%] animate-float-slow opacity-15">
          <Milestone className="w-10 h-10 text-login-amber-light" />
        </div>
        
        {/* Bottom left */}
        <div className="absolute bottom-[20%] left-[15%] animate-float-delayed opacity-20">
          <CircleDot className="w-8 h-8 text-login-amber" />
        </div>
        
        {/* Bottom right car */}
        <div className="absolute bottom-[15%] right-[10%] animate-float opacity-15">
          <Car className="w-14 h-14 text-login-amber-light" />
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-login-navy/80 via-transparent to-login-navy/40" />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* App Name with car icon */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-3 animate-slide-down">
            <Car className="w-8 h-8 text-login-amber" />
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Rij<span className="text-login-amber">Planner</span>
            </h1>
          </div>
          <p className="text-login-muted text-sm tracking-wide animate-fade-in-delayed">
            Rijlessen eenvoudig gepland
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/90">
                Gebruikersnaam
              </label>
              <Input
                type="text"
                placeholder="Voer je gebruikersnaam in"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-login-amber focus:ring-login-amber/20 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/90">
                Pincode
              </label>
              <PinInput value={pincode} onChange={setPincode} />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-scale-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-login-amber hover:bg-login-amber-light text-login-navy font-semibold shadow-lg hover:shadow-login-amber/25 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-login-navy/30 border-t-login-navy rounded-full animate-spin" />
                  Inloggen...
                </span>
              ) : (
                'Inloggen'
              )}
            </Button>
          </form>
        </div>

        {/* Install hint for PWA */}
        <p className="text-xs text-login-muted text-center mt-8 opacity-60">
          Tip: Voeg deze app toe aan je startscherm
        </p>
      </div>
    </div>
  );
}
