import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { CreditsBadge } from '@/components/CreditsBadge';
import { 
  User, 
  LogOut, 
  Shield, 
  Car, 
  GraduationCap,
  Calendar,
  CheckCircle,
  Crown
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getLessonsForUser, getCreditsForStudent } = useData();

  if (!user) return null;

  const lessons = getLessonsForUser(user.id, user.role);
  const acceptedLessons = lessons.filter(l => l.status === 'accepted').length;
  const pendingLessons = lessons.filter(l => l.status === 'pending').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'superadmin':
        return Crown;
      case 'admin':
        return Shield;
      case 'instructor':
        return Car;
      case 'student':
        return GraduationCap;
      default:
        return User;
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'superadmin':
        return 'Super Administrator';
      case 'admin':
        return 'Beheerder';
      case 'instructor':
        return 'Instructeur';
      case 'student':
        return 'Leerling';
      default:
        return 'Gebruiker';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="page-container">
      <Header title="Profiel" />

      {/* Profile Card */}
      <div className="glass-card rounded-xl p-6 mb-6 animate-slide-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RoleIcon className="w-4 h-4" />
              <span>{getRoleLabel()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Gebruikersnaam</span>
            <span className="font-medium">@{user.username}</span>
          </div>

          {user.role === 'student' && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Lescredits</span>
              <CreditsBadge credits={getCreditsForStudent(user.id)} />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {user.role !== 'admin' && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-xl p-4 text-center animate-slide-up">
            <Calendar className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{pendingLessons}</p>
            <p className="text-sm text-muted-foreground">In afwachting</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center animate-slide-up">
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{acceptedLessons}</p>
            <p className="text-sm text-muted-foreground">Geaccepteerd</p>
          </div>
        </div>
      )}

      {/* Logout */}
      <Button
        variant="destructive"
        size="lg"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        Uitloggen
      </Button>

      <BottomNav />
    </div>
  );
}
