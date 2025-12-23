import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
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

const SWIPE_THRESHOLD = 100;

export function LessonCard({ lesson, showActions = false, onStatusChange }: LessonCardProps) {
  const { getUserById, getCreditsForStudent } = useData();
  const { user } = useAuth();
  const instructor = getUserById(lesson.instructor_id);
  const student = getUserById(lesson.student_id);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isSwipedOut, setIsSwipedOut] = useState(false);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  
  // Background colors based on swipe direction
  const bgAccept = useTransform(x, [0, SWIPE_THRESHOLD], ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.2)']);
  const bgReject = useTransform(x, [-SWIPE_THRESHOLD, 0], ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0)']);
  
  // Icon scales
  const acceptIconScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1.2]);
  const rejectIconScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1.2, 0.5]);
  const acceptIconOpacity = useTransform(x, [0, 50, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const rejectIconOpacity = useTransform(x, [-SWIPE_THRESHOLD, -50, 0], [1, 0.5, 0]);

  const statusConfig = STATUS_CONFIG[lesson.status];
  const canSwipe = showActions && lesson.status === 'pending' && user?.role === 'student';

  const handleStatusChange = async (status: LessonStatus) => {
    setIsUpdating(status);
    await onStatusChange?.(lesson.id, status);
    setIsUpdating(null);
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const swipe = info.offset.x;
    const velocity = info.velocity.x;
    
    if (swipe > SWIPE_THRESHOLD || velocity > 500) {
      // Swiped right - Accept
      if (canAccept()) {
        setIsSwipedOut(true);
        await handleStatusChange('accepted');
      }
    } else if (swipe < -SWIPE_THRESHOLD || velocity < -500) {
      // Swiped left - Reject
      setIsSwipedOut(true);
      await handleStatusChange('cancelled');
    }
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

  if (isSwipedOut) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="overflow-hidden"
      />
    );
  }

  const cardContent = (
    <>
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

      {/* Swipe hint for pending lessons */}
      {canSwipe && (
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground py-2 border-t border-border/50">
          <span className="flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-destructive" />
            ← Swipe om te weigeren
          </span>
          <span className="flex items-center gap-1">
            Swipe om te accepteren →
            <CheckCircle className="w-3.5 h-3.5 text-success" />
          </span>
        </div>
      )}

      {/* Fallback buttons (shown if swipe not available or for non-students) */}
      {showActions && lesson.status === 'pending' && user?.role === 'student' && !canSwipe && (
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
    </>
  );

  // Swipeable card for pending lessons
  if (canSwipe) {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background indicators */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-start pl-6 rounded-2xl"
          style={{ backgroundColor: bgReject }}
        >
          <motion.div style={{ scale: rejectIconScale, opacity: rejectIconOpacity }}>
            <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center shadow-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-end pr-6 rounded-2xl"
          style={{ backgroundColor: bgAccept }}
        >
          <motion.div style={{ scale: acceptIconScale, opacity: acceptIconOpacity }}>
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </motion.div>

        {/* Swipeable card */}
        <motion.div
          className="glass-card p-4 relative z-10 cursor-grab active:cursor-grabbing"
          style={{ x, opacity, scale }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.98 }}
        >
          {cardContent}
        </motion.div>
      </div>
    );
  }

  // Regular card for non-swipeable states
  return (
    <motion.div 
      className="glass-card p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {cardContent}
    </motion.div>
  );
}
