import React from 'react';
import { Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function Header({ title, showLogo = false }: HeaderProps) {
  const { user } = useAuth();

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Beheerder';
      case 'instructor':
        return 'Instructeur';
      case 'student':
        return 'Leerling';
      default:
        return '';
    }
  };

  return (
    <header className="mb-6">
      {showLogo && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Car className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">RijPlanner</h1>
            <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
          </div>
        </div>
      )}
      {title && (
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      )}
    </header>
  );
}
