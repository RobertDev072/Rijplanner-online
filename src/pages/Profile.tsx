import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomTabNav } from '@/components/BottomTabNav';
import { MobileMenu } from '@/components/MobileMenu';
import { Button } from '@/components/ui/button';
import { CreditsBadge } from '@/components/CreditsBadge';
import { ProfileEditor } from '@/components/ProfileEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { 
  LogOut, 
  Shield, 
  Car, 
  GraduationCap,
  Calendar,
  CheckCircle,
  Crown,
  Edit2,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { getLessonsForUser, getCreditsForStudent, updateUser } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglingTheory, setIsTogglingTheory] = useState(false);

  if (!user) return null;

  const lessons = getLessonsForUser(user.id, user.role);
  const acceptedLessons = lessons.filter(l => l.status === 'accepted').length;
  const pendingLessons = lessons.filter(l => l.status === 'pending').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = async () => {
    setIsEditing(false);
    if (refreshUser) {
      await refreshUser();
    }
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
        return GraduationCap;
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const RoleIcon = getRoleIcon();

  // Swipe gesture for theory toggle
  const swipeX = useMotionValue(0);
  const swipeProgress = useTransform(swipeX, [0, 150], [0, 1]);
  const backgroundColor = useTransform(
    swipeProgress,
    [0, 0.5, 1],
    ['hsl(var(--muted))', 'hsl(var(--warning) / 0.5)', 'hsl(var(--success))']
  );

  const handleTheorySwipe = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100 && !user.theory_passed && !isTogglingTheory) {
      // Swiped right - mark theory as passed
      setIsTogglingTheory(true);
      try {
        const success = await updateUser(user.id, { theory_passed: true });
        if (success) {
          toast({
            title: "Theorie gehaald!",
            description: "Gefeliciteerd met het halen van je theorie-examen!",
          });
          if (refreshUser) {
            await refreshUser();
          }
        }
      } catch (error) {
        console.error('Error updating theory status:', error);
        toast({
          title: "Fout",
          description: "Kon de theorie status niet bijwerken.",
          variant: "destructive",
        });
      } finally {
        setIsTogglingTheory(false);
      }
    }
  };

  const handleTheoryToggleOff = async () => {
    if (!user.theory_passed || isTogglingTheory) return;
    
    setIsTogglingTheory(true);
    try {
      const success = await updateUser(user.id, { theory_passed: false });
      if (success) {
        toast({
          title: "Theorie status gewijzigd",
          description: "Je theorie status is bijgewerkt.",
        });
        if (refreshUser) {
          await refreshUser();
        }
      }
    } catch (error) {
      console.error('Error updating theory status:', error);
    } finally {
      setIsTogglingTheory(false);
    }
  };

  return (
    <div className="page-container">
      <MobileMenu />
      <Header title="Profiel" />

      {isEditing ? (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <ProfileEditor 
            user={user} 
            onClose={() => setIsEditing(false)} 
            onSave={handleSave}
          />
        </div>
      ) : (
        <>
          {/* Profile Card */}
          <div className="glass-card rounded-xl p-6 mb-6 animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RoleIcon className="w-4 h-4" />
                    <span>{getRoleLabel()}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Gebruikersnaam</span>
                <span className="font-medium">@{user.username}</span>
              </div>

              {user.email && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </span>
                  <span className="font-medium text-sm">{user.email}</span>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefoon
                  </span>
                  <span className="font-medium">{user.phone}</span>
                </div>
              )}

              {user.address && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Adres
                  </span>
                  <span className="font-medium text-sm text-right max-w-[60%]">{user.address}</span>
                </div>
              )}

              {user.role === 'student' && (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Lescredits</span>
                    <CreditsBadge credits={getCreditsForStudent(user.id)} />
                  </div>
                  
                  {/* Theory Swipe Toggle */}
                  <div className="py-3 border-b border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-muted-foreground">
                        Theorie examen
                      </Label>
                    </div>
                    
                    {user.theory_passed ? (
                      <div 
                        className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/30 cursor-pointer"
                        onClick={handleTheoryToggleOff}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-success" />
                          <span className="font-medium text-success">Theorie gehaald!</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Tik om te wijzigen</span>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
                        <motion.div
                          className="absolute inset-0 rounded-xl"
                          style={{ backgroundColor }}
                        />
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: 0, right: 150 }}
                          dragElastic={0.1}
                          onDragEnd={handleTheorySwipe}
                          style={{ x: swipeX }}
                          className="relative flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing"
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">Swipe naar rechts</p>
                            <p className="text-xs text-muted-foreground">als je je theorie hebt gehaald</p>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span className="text-xs">→</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!user.email && !user.phone && !user.address && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Klik op het potlood icoon om je profiel aan te vullen
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          {user.role !== 'admin' && user.role !== 'superadmin' && (
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
        </>
      )}

      <BottomTabNav />
    </div>
  );
}
