import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { LessonCard } from '@/components/LessonCard';
import { CreditsBadge } from '@/components/CreditsBadge';
import { Users, GraduationCap, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

function StatCard({ icon: Icon, label, value, color }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { getInstructors, getStudents, getLessonsForUser, getCreditsForStudent, updateLessonStatus } = useData();

  if (!user) return null;

  const lessons = getLessonsForUser(user.id, user.role);
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingLessons = lessons
    .filter(l => l.date >= today && l.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
  const pendingLessons = lessons.filter(l => l.status === 'pending');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Goedemorgen';
    if (hour < 18) return 'Goedemiddag';
    return 'Goedenavond';
  };

  return (
    <div className="page-container">
      <Header showLogo />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {user.name.split(' ')[0]}!
        </h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: nl })}
        </p>
      </div>

      {/* Admin Stats */}
      {user.role === 'admin' && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            icon={Users}
            label="Instructeurs"
            value={getInstructors().length}
            color="bg-primary"
          />
          <StatCard
            icon={GraduationCap}
            label="Leerlingen"
            value={getStudents().length}
            color="bg-accent"
          />
          <StatCard
            icon={Calendar}
            label="Geplande lessen"
            value={upcomingLessons.length}
            color="bg-success"
          />
          <StatCard
            icon={Clock}
            label="In afwachting"
            value={pendingLessons.length}
            color="bg-warning"
          />
        </div>
      )}

      {/* Student Credits */}
      {user.role === 'student' && (
        <div className="glass-card rounded-xl p-4 mb-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jouw lescredits</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                Beschikbaar voor nieuwe lessen
              </p>
            </div>
            <CreditsBadge credits={getCreditsForStudent(user.id)} size="lg" />
          </div>
        </div>
      )}

      {/* Pending Lessons for Student */}
      {user.role === 'student' && pendingLessons.length > 0 && (
        <div className="mb-6">
          <h3 className="section-title">Lesverzoeken</h3>
          <div className="space-y-3">
            {pendingLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                showActions
                onStatusChange={updateLessonStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Lessons */}
      <div>
        <h3 className="section-title">
          {user.role === 'admin' ? 'Alle geplande lessen' : 'Komende lessen'}
        </h3>
        {upcomingLessons.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Geen geplande lessen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingLessons.slice(0, 5).map((lesson, index) => (
              <div key={lesson.id} style={{ animationDelay: `${index * 50}ms` }}>
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
