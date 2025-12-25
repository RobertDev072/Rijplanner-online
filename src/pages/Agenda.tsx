import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { MobileMenu } from '@/components/MobileMenu';
import { LessonCard } from '@/components/LessonCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  pending: {
    bg: 'bg-warning',
    light: 'bg-warning/20',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  accepted: {
    bg: 'bg-success',
    light: 'bg-success/20',
    text: 'text-success',
    border: 'border-success/30',
  },
  cancelled: {
    bg: 'bg-destructive',
    light: 'bg-destructive/20',
    text: 'text-destructive',
    border: 'border-destructive/30',
  },
  completed: {
    bg: 'bg-primary',
    light: 'bg-primary/20',
    text: 'text-primary',
    border: 'border-primary/30',
  },
};

export default function Agenda() {
  const { user } = useAuth();
  const { getLessonsForUser, updateLessonStatus } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!user) return null;

  const lessons = getLessonsForUser(user.id, user.role);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Filter out cancelled lessons for the main view
  const activeLessons = lessons.filter(l => l.status !== 'cancelled');
  
  const dayLessons = activeLessons
    .filter(l => l.date === selectedDateStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const getLessonsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return activeLessons.filter(l => l.date === dateStr);
  };

  const getStatusDotsForDay = (date: Date) => {
    const dayLessons = getLessonsForDay(date);
    const statuses = {
      pending: dayLessons.filter(l => l.status === 'pending').length,
      accepted: dayLessons.filter(l => l.status === 'accepted').length,
    };
    return statuses;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  // Count by status for legend
  const pendingCount = dayLessons.filter(l => l.status === 'pending').length;
  const acceptedCount = dayLessons.filter(l => l.status === 'accepted').length;

  return (
    <div className="page-container">
      <MobileMenu />
      <Header title="Agenda" />

      {/* Week Navigation */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigateWeek('prev')}
            className="rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <span className="font-bold text-lg">
              {format(weekStart, 'MMMM', { locale: nl })}
            </span>
            <span className="text-muted-foreground ml-2">
              {format(weekStart, 'yyyy')}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigateWeek('next')}
            className="rounded-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week Days with Status Dots */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const statuses = getStatusDotsForDay(day);
            const hasLessons = statuses.pending + statuses.accepted > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center py-2 px-1 rounded-xl transition-colors duration-200 relative touch-manipulation active:scale-95",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : isToday
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <span className="text-[10px] font-medium uppercase opacity-70">
                  {format(day, 'EEE', { locale: nl })}
                </span>
                <span className="text-lg font-bold">{format(day, 'd')}</span>
                
                {/* Status dots */}
                {hasLessons && (
                  <div className="flex gap-0.5 mt-1">
                    {statuses.accepted > 0 && (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground" : STATUS_COLORS.accepted.bg
                      )} />
                    )}
                    {statuses.pending > 0 && (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground/70" : STATUS_COLORS.pending.bg
                      )} />
                    )}
                  </div>
                )}

                {/* Today indicator */}
                {isToday && !isSelected && (
                  <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Bevestigd</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">In afwachting</span>
          </div>
        </div>
      </div>

      {/* Selected Day Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title mb-0">
            <Calendar className="w-4 h-4 text-primary" />
            {format(selectedDate, "EEEE d MMMM", { locale: nl })}
          </h3>
        </div>
        
        {/* Day summary badges */}
        {dayLessons.length > 0 && (
          <div className="flex gap-2 mt-3">
            {acceptedCount > 0 && (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                STATUS_COLORS.accepted.light, STATUS_COLORS.accepted.text
              )}>
                <CheckCircle className="w-3 h-3" />
                {acceptedCount} bevestigd
              </div>
            )}
            {pendingCount > 0 && (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                STATUS_COLORS.pending.light, STATUS_COLORS.pending.text
              )}>
                <Clock className="w-3 h-3" />
                {pendingCount} wachtend
              </div>
            )}
          </div>
        )}
      </div>

      {/* Day Lessons */}
      <div key={selectedDateStr}>
        {dayLessons.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Geen lessen</h4>
            <p className="text-sm text-muted-foreground">
              Er zijn geen lessen gepland op deze dag
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayLessons.map((lesson) => (
              <div key={lesson.id}>
                <LessonCard
                  lesson={lesson}
                  showActions={user.role === 'student'}
                  onStatusChange={updateLessonStatus}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
