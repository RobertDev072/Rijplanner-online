import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { LessonCard } from '@/components/LessonCard';
import { CreditsBadge } from '@/components/CreditsBadge';
import { InstallPWA } from '@/components/InstallPWA';
import { Users, GraduationCap, Calendar, Clock, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  registerServiceWorker, 
  subscribeToPushNotifications, 
  requestPushPermission,
  checkPushNotificationSupport 
} from '@/utils/pushNotifications';

function StatCard({ icon: Icon, label, value, color, delay = 0 }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  color: string;
  delay?: number;
}) {
  return (
    <div 
      className="glass-card p-4 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className={cn("stat-icon", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { getInstructors, getStudents, getLessonsForUser, getCreditsForStudent, getStudentsWithLowCredits, updateLessonStatus, isLoading } = useData();
  const navigate = useNavigate();

  // Register service worker and subscribe to push notifications
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (!user || !checkPushNotificationSupport()) return;
      
      // Register service worker
      await registerServiceWorker();
      
      // Request permission
      const granted = await requestPushPermission();
      if (!granted) return;
      
      // Get VAPID public key
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey || !user.tenant_id) return;
      
      // Subscribe to push notifications
      await subscribeToPushNotifications(user.id, user.tenant_id, vapidPublicKey);
    };
    
    setupPushNotifications();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Goedemorgen';
    if (hour < 18) return 'Goedemiddag';
    return 'Goedenavond';
  };

  if (!user) return null;

  // Superadmin dashboard
  if (user.role === 'superadmin') {
    return (
      <div className="page-container">
        <Header showLogo />
        
        <div className="mb-8 animate-slide-up">
          <p className="text-muted-foreground text-sm font-medium mb-1">{getGreeting()}</p>
          <h2 className="text-2xl font-bold text-foreground">
            {user.name.split(' ')[0]} 👋
          </h2>
        </div>

        <div 
          className="glass-card p-6 cursor-pointer group animate-slide-up"
          style={{ animationDelay: '100ms' }}
          onClick={() => navigate('/tenants')}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-lg">Rijscholen beheren</h3>
              <p className="text-sm text-muted-foreground">Bekijk en beheer alle rijscholen</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <Header showLogo />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const lessons = getLessonsForUser(user.id, user.role);
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingLessons = lessons
    .filter(l => l.date >= today && l.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
  const pendingLessons = lessons.filter(l => l.status === 'pending');

  return (
    <div className="page-container">
      <Header showLogo />

      {/* Greeting */}
      <div className="mb-6 animate-slide-up">
        <p className="text-muted-foreground text-sm font-medium mb-1">{getGreeting()}</p>
        <h2 className="text-2xl font-bold text-foreground">
          {user.name.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE d MMMM", { locale: nl })}
        </p>
      </div>

      {/* PWA Install Prompt */}
      <div className="mb-6">
        <InstallPWA />
      </div>

      {/* Admin Stats */}
      {user.role === 'admin' && (
        <>
          {/* Low Credits Warning */}
          {getStudentsWithLowCredits().length > 0 && (
            <div className="glass-card p-4 mb-6 border-l-4 border-warning bg-warning/5 animate-slide-up">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-warning" />
                Lage credits waarschuwing
              </h3>
              <div className="space-y-2">
                {getStudentsWithLowCredits().map(({ student, credits }) => (
                  <div key={student.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{student.name}</span>
                    <span className={cn(
                      "font-medium px-2 py-0.5 rounded-full text-xs",
                      credits === 0 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                    )}>
                      {credits} credits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard
              icon={Users}
              label="Instructeurs"
              value={getInstructors().length}
              color="bg-gradient-to-br from-primary to-primary/70"
              delay={50}
            />
            <StatCard
              icon={GraduationCap}
              label="Leerlingen"
              value={getStudents().length}
              color="bg-gradient-to-br from-accent to-accent/70"
              delay={100}
            />
            <StatCard
              icon={Calendar}
              label="Geplande lessen"
              value={upcomingLessons.length}
              color="bg-gradient-to-br from-success to-success/70"
              delay={150}
            />
            <StatCard
              icon={Clock}
              label="In afwachting"
              value={pendingLessons.length}
              color="bg-gradient-to-br from-warning to-warning/70"
              delay={200}
            />
          </div>
        </>
      )}

      {/* Student Credits */}
      {user.role === 'student' && (
        <div 
          className="glass-card p-5 mb-6 animate-slide-up bg-gradient-to-br from-primary/5 to-transparent"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Jouw lescredits</p>
                <p className="text-xs text-muted-foreground">
                  Beschikbaar voor lessen
                </p>
              </div>
            </div>
            <CreditsBadge credits={getCreditsForStudent(user.id)} size="lg" />
          </div>
        </div>
      )}

      {/* Pending Lessons for Student */}
      {user.role === 'student' && pendingLessons.length > 0 && (
        <div className="mb-6">
          <h3 className="section-title">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            Lesverzoeken
            <span className="ml-auto text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
              {pendingLessons.length} nieuw
            </span>
          </h3>
          <div className="space-y-3">
            {pendingLessons.map((lesson, index) => (
              <div key={lesson.id} style={{ animationDelay: `${(index + 1) * 50}ms` }}>
                <LessonCard
                  lesson={lesson}
                  showActions
                  onStatusChange={updateLessonStatus}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Lessons */}
      <div>
        <h3 className="section-title">
          <Calendar className="w-4 h-4 text-primary" />
          {user.role === 'admin' ? 'Alle geplande lessen' : 'Komende lessen'}
        </h3>
        {upcomingLessons.length === 0 ? (
          <div className="glass-card p-8 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Geen lessen gepland</h4>
            <p className="text-sm text-muted-foreground">Je hebt momenteel geen komende lessen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingLessons.slice(0, 5).map((lesson, index) => (
              <div 
                key={lesson.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${(index + 1) * 50}ms` }}
              >
                <LessonCard lesson={lesson} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
