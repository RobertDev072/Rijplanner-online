import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { LessonCard } from '@/components/LessonCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Agenda() {
  const { user } = useAuth();
  const { getLessonsForUser, updateLessonStatus } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!user) return null;

  const lessons = getLessonsForUser(user.id, user.role);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayLessons = lessons
    .filter(l => l.date === selectedDateStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const getLessonCountForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return lessons.filter(l => l.date === dateStr && l.status !== 'cancelled').length;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  return (
    <div className="page-container">
      <Header title="Agenda" />

      {/* Week Navigation */}
      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold">
            {format(weekStart, 'MMMM yyyy', { locale: nl })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const lessonCount = getLessonCountForDay(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center py-2 rounded-lg transition-all duration-200",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isToday
                    ? "bg-accent/10 text-accent"
                    : "hover:bg-muted"
                )}
              >
                <span className="text-xs font-medium uppercase">
                  {format(day, 'EEE', { locale: nl })}
                </span>
                <span className="text-lg font-bold">{format(day, 'd')}</span>
                {lessonCount > 0 && (
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1",
                      isSelected ? "bg-primary-foreground" : "bg-accent"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day */}
      <div className="mb-4">
        <h3 className="section-title">
          {format(selectedDate, "EEEE d MMMM", { locale: nl })}
        </h3>
      </div>

      {/* Day Lessons */}
      {dayLessons.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Geen lessen op deze dag</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayLessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              showActions={user.role === 'student'}
              onStatusChange={updateLessonStatus}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
