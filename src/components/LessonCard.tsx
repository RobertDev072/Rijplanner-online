import React from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Download } from 'lucide-react';
import { Lesson, LessonStatus } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface LessonCardProps {
  lesson: Lesson;
  showActions?: boolean;
  onStatusChange?: (lessonId: string, status: LessonStatus) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: 'In afwachting',
    className: 'status-pending',
  },
  accepted: {
    label: 'Geaccepteerd',
    className: 'status-accepted',
  },
  cancelled: {
    label: 'Geannuleerd',
    className: 'status-cancelled',
  },
};

export function LessonCard({ lesson, showActions = false, onStatusChange }: LessonCardProps) {
  const { getUserById, getCreditsForStudent } = useData();
  const { user } = useAuth();
  const instructor = getUserById(lesson.instructor_id);
  const student = getUserById(lesson.student_id);

  const statusConfig = STATUS_CONFIG[lesson.status];

  const generateICS = () => {
    const startDate = new Date(`${lesson.date}T${lesson.start_time}`);
    const endDate = new Date(startDate.getTime() + lesson.duration_minutes * 60000);

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
DESCRIPTION:Rijles van ${lesson.duration_minutes} minuten
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
    <div className="glass-card rounded-xl p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-semibold">
            {format(new Date(lesson.date), 'EEEE d MMMM', { locale: nl })}
          </span>
        </div>
        <span
          className={cn(
            "px-2 py-1 text-xs font-medium rounded-full border",
            statusConfig.className
          )}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {lesson.start_time} - {lesson.duration_minutes} min
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>
            {user?.role === 'student'
              ? `Instructeur: ${instructor?.name}`
              : `Leerling: ${student?.name}`}
          </span>
        </div>
      </div>

      {showActions && lesson.status === 'pending' && user?.role === 'student' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            className="flex-1"
            onClick={() => onStatusChange?.(lesson.id, 'accepted')}
            disabled={!canAccept()}
          >
            <CheckCircle className="w-4 h-4" />
            Accepteren
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => onStatusChange?.(lesson.id, 'cancelled')}
          >
            <XCircle className="w-4 h-4" />
            Weigeren
          </Button>
        </div>
      )}

      {lesson.status === 'accepted' && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={generateICS}
        >
          <Download className="w-4 h-4" />
          Toevoegen aan agenda
        </Button>
      )}
    </div>
  );
}
