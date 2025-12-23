import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-elevated">
            <Car className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">RijPlanner</h1>
          <p className="text-muted-foreground mt-1">Rijlessen eenvoudig gepland</p>
        </div>

        {/* Login Form */}
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
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Pincode
            </label>
            <PinInput value={pincode} onChange={setPincode} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Inloggen...' : 'Inloggen'}
          </Button>
        </form>

        /* {/* /* {/* Demo hint */}
        <div className="mt-8 p-4 bg-muted rounded-xl">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Demo accounts:</strong><br />
            admin / 1234<br />
            instructeur1 / 5678<br />
            leerling1 / 9012
          </p>
        </div> */ */} */
      </div>
    </div>
  );
}
