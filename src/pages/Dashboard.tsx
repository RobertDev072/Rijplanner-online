import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/MobileLayout';
import { LessonCard } from '@/components/LessonCard';
import { LessonCardCompact } from '@/components/LessonCardCompact';
import { CreditsBadge } from '@/components/CreditsBadge';
import { InstallPWA } from '@/components/InstallPWA';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { PageSkeleton } from '@/components/PageSkeleton';
import { InstructorTodayLessons } from '@/components/InstructorTodayLessons';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Users, GraduationCap, Calendar, Clock, Building2, Sparkles, ArrowRight, CalendarDays, ChevronDown, ChevronUp, List, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  registerServiceWorker,
  subscribeToPushNotifications,
  requestPushPermission,
  checkPushNotificationSupport
} from '@/utils/pushNotifications';
import { Header } from '@/components/Header';
import { BottomTabNav } from '@/components/BottomTabNav';
import { Button } from '@/components/ui/button';

function StatCard({ icon: Icon, label, value, color }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  color: string;
}) {
  return (
    <div className="glass-card p-4">
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
  const {
    getInstructors,
    getStudents,
    getLessonsForUser,
    getCreditsForStudent,
    getStudentsWithLowCredits,
    updateLessonStatus,
    isLoading,
  } = useData();
  const navigate = useNavigate();
  const [compactView, setCompactView] = useState(true);
  const [showAllPending, setShowAllPending] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  // Register service worker and subscribe to push notifications
  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        if (!user || !user.tenant_id || !checkPushNotificationSupport()) return;

        // Register service worker
        await registerServiceWorker();

        // Request permission
        const granted = await requestPushPermission();
        if (!granted) return;

        // Fetch VAPID public key from server
        const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
        if (error) return;

        const vapidPublicKey = (data as { publicKey?: string | null } | null)?.publicKey ?? null;
        if (!vapidPublicKey) return;

        await subscribeToPushNotifications(user.id, user.tenant_id, vapidPublicKey);
      } catch {
        // Never crash the dashboard because of push setup
        return;
      }
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
      <MobileLayout showLogo>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-muted-foreground text-sm font-medium mb-1">{getGreeting()}</p>
          <h2 className="text-2xl font-bold text-foreground">
            {user.name.split(' ')[0]} 👋
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 cursor-pointer group tap-highlight"
          onClick={() => navigate('/tenants')}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-lg">Rijscholen beheren</h3>
              <p className="text-sm text-muted-foreground">Bekijk en beheer alle rijscholen</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </motion.div>
      </MobileLayout>
    );
  }

  if (isLoading) {
    return (
      <MobileLayout showLogo>
        <PageSkeleton type="dashboard" />
      </MobileLayout>
    );
  }

  const lessons = getLessonsForUser(user.id, user.role);
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingLessons = lessons
    .filter(l => l.date >= today && l.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
  const pendingLessons = lessons.filter(l => l.status === 'pending');
  
  // Today's lessons for instructor
  const todayLessons = lessons
    .filter(l => l.date === today && l.status !== 'cancelled')
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <MobileLayout showLogo>
      <UpdatePrompt />

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-muted-foreground text-sm font-medium mb-1">{getGreeting()}</p>
        <h2 className="text-2xl font-bold text-foreground">
          {user.name.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE d MMMM", { locale: nl })}
        </p>
      </motion.div>

      {/* PWA Install Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <InstallPWA />
      </motion.div>

      {/* Instructor Today's Lessons */}
      {user.role === 'instructor' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="section-title mb-3">
            <CalendarDays className="w-4 h-4 text-primary" />
            Lessen vandaag
            {todayLessons.length > 0 && (
              <span className="ml-auto text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {todayLessons.length} {todayLessons.length === 1 ? 'les' : 'lessen'}
              </span>
            )}
          </h3>
          <InstructorTodayLessons lessons={todayLessons} />
        </motion.div>
      )}

      {/* Admin Stats */}
      {user.role === 'admin' && (
        <>
          {/* Low Credits Warning */}
          {getStudentsWithLowCredits().length > 0 && (
            <div
              className="glass-card p-4 mb-6 border-l-4 border-warning bg-warning/5 cursor-pointer hover:bg-warning/10 transition-colors"
              onClick={() => navigate('/credits')}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-warning" />
                Lage credits waarschuwing
              </h3>
              <div className="space-y-2">
                {getStudentsWithLowCredits().slice(0, 3).map(({ student, credits }) => (
                  <div key={student.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{student.name}</span>
                    <span
                      className={cn(
                        "font-medium px-2 py-0.5 rounded-full text-xs",
                        credits === 0 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                      )}
                    >
                      {credits} credits
                    </span>
                  </div>
                ))}
                {getStudentsWithLowCredits().length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    + {getStudentsWithLowCredits().length - 3} meer...
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard
              icon={Users}
              label="Instructeurs"
              value={getInstructors().length}
              color="bg-gradient-to-br from-primary to-primary/70"
            />
            <StatCard
              icon={GraduationCap}
              label="Leerlingen"
              value={getStudents().length}
              color="bg-gradient-to-br from-accent to-accent/70"
            />
            <StatCard
              icon={Calendar}
              label="Geplande lessen"
              value={upcomingLessons.length}
              color="bg-gradient-to-br from-success to-success/70"
            />
            <StatCard
              icon={Clock}
              label="In afwachting"
              value={pendingLessons.length}
              color="bg-gradient-to-br from-warning to-warning/70"
            />
          </div>
        </>
      )}

      {/* Student Credits */}
      {user.role === 'student' && (
        <div className="glass-card p-5 mb-6 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Jouw lescredits</p>
                <p className="text-xs text-muted-foreground">Beschikbaar voor lessen</p>
              </div>
            </div>
            <CreditsBadge credits={getCreditsForStudent(user.id)} size="lg" />
          </div>
        </div>
      )}

      {/* Pending Lessons for Student */}
      {user.role === 'student' && pendingLessons.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title mb-0">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              Lesverzoeken
              <span className="ml-2 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
                {pendingLessons.length} nieuw
              </span>
            </h3>
          </div>
          <div className="space-y-2">
            {(showAllPending ? pendingLessons : pendingLessons.slice(0, 3)).map((lesson) => (
              <LessonCardCompact 
                key={lesson.id}
                lesson={lesson} 
                showActions 
                onStatusChange={updateLessonStatus} 
              />
            ))}
          </div>
          {pendingLessons.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground"
              onClick={() => setShowAllPending(!showAllPending)}
            >
              {showAllPending ? (
                <>Minder tonen <ChevronUp className="w-4 h-4 ml-1" /></>
              ) : (
                <>Alle {pendingLessons.length} tonen <ChevronDown className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Upcoming Lessons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">
            <Calendar className="w-4 h-4 text-primary" />
            {user.role === 'admin' ? 'Alle geplande lessen' : 'Komende lessen'}
            {upcomingLessons.length > 0 && (
              <span className="ml-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {upcomingLessons.length}
              </span>
            )}
          </h3>
          {upcomingLessons.length > 3 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setCompactView(!compactView)}
            >
              {compactView ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>
          )}
        </div>
        {upcomingLessons.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Geen lessen gepland</h4>
            <p className="text-sm text-muted-foreground">Je hebt momenteel geen komende lessen</p>
          </div>
        ) : (
          <div className={cn("space-y-2", !compactView && "space-y-3")}>
            <AnimatePresence mode="wait">
              {(showAllUpcoming ? upcomingLessons : upcomingLessons.slice(0, 5)).map((lesson) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {compactView ? (
                    <LessonCardCompact lesson={lesson} onStatusChange={updateLessonStatus} />
                  ) : (
                    <LessonCard lesson={lesson} onStatusChange={updateLessonStatus} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        {upcomingLessons.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground"
            onClick={() => setShowAllUpcoming(!showAllUpcoming)}
          >
            {showAllUpcoming ? (
              <>Minder tonen <ChevronUp className="w-4 h-4 ml-1" /></>
            ) : (
              <>Alle {upcomingLessons.length} tonen <ChevronDown className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        )}
      </div>

      {/* Onboarding Flow for new users */}
      <OnboardingFlow />
    </MobileLayout>
  );
}
