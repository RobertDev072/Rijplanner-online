import React from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import { Lesson, LessonStatus } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useState } from 'react';

interface LessonCardProps {
  lesson: Lesson;
  showActions?: boolean;
  onStatusChange?: (lessonId: string, status: LessonStatus) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: 'In afwachting',
    className: 'status-pending',
    dotColor: 'bg-warning',
  },
  accepted: {
    label: 'Bevestigd',
    className: 'status-accepted',
    dotColor: 'bg-success',
  },
  cancelled: {
    label: 'Geannuleerd',
    className: 'status-cancelled',
    dotColor: 'bg-destructive',
  },
};

export function LessonCard({ lesson, showActions = false, onStatusChange }: LessonCardProps) {
  const { getUserById, getCreditsForStudent } = useData();
  const { user } = useAuth();
  const instructor = getUserById(lesson.instructor_id);
  const student = getUserById(lesson.student_id);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const statusConfig = STATUS_CONFIG[lesson.status];

  const handleStatusChange = async (status: LessonStatus) => {
    setIsUpdating(status);
    await onStatusChange?.(lesson.id, status);
    setIsUpdating(null);
  };

  const generateICS = () => {
    const startDate = new Date(`${lesson.date}T${lesson.start_time}`);
    const endDate = new Date(startDate.getTime() + lesson.duration * 60000);

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RijPlanner//NL
BEGIN:VEVENT
UID:${lesson.id}@rijplanner
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Rijles met ${user?.role === 'student' ? instructor?.name : student?.name}
DESCRIPTION:Rijles van ${lesson.duration} minuten
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rijles-${lesson.date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const canAccept = () => {
    if (user?.role !== 'student') return false;
    const credits = getCreditsForStudent(user.id);
    return credits > 0;
  };

  return (
    <div className="glass-card p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground block">
              {format(new Date(lesson.date), 'EEEE', { locale: nl })}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(new Date(lesson.date), 'd MMMM', { locale: nl })}
            </span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
          statusConfig.className
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
          {statusConfig.label}
        </div>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-medium">{lesson.start_time}</span>
          <span className="text-xs">• {lesson.duration} min</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 flex-1">
          <User className="w-4 h-4 text-accent" />
          <span className="font-medium truncate">
            {user?.role === 'student' ? instructor?.name : student?.name}
          </span>
        </div>
      </div>

      {showActions && lesson.status === 'pending' && user?.role === 'student' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-success hover:bg-success/90 text-white"
            onClick={() => handleStatusChange('accepted')}
            disabled={!canAccept() || isUpdating !== null}
          >
            {isUpdating === 'accepted' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Accepteren
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => handleStatusChange('cancelled')}
            disabled={isUpdating !== null}
          >
            {isUpdating === 'cancelled' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Weigeren
          </Button>
        </div>
      )}

      {lesson.status === 'accepted' && (
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2"
          onClick={generateICS}
        >
          <Download className="w-4 h-4" />
          Toevoegen aan agenda
        </Button>
      )}
    </div>
  );
}
