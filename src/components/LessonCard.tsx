import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, XCircle, Download, Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { Lesson, LessonStatus } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, differenceInHours, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const { getUserById, getCreditsForStudent, cancelLesson } = useData();
  const { user } = useAuth();
  const instructor = getUserById(lesson.instructor_id);
  const student = getUserById(lesson.student_id);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isSwipedOut, setIsSwipedOut] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

  // Calculate hours until lesson
  const getLessonDateTime = () => {
    return parseISO(`${lesson.date}T${lesson.start_time}`);
  };

  const getHoursUntilLesson = () => {
    const lessonTime = getLessonDateTime();
    return differenceInHours(lessonTime, new Date());
  };

  // Check if student can cancel (must be 24+ hours before)
  const canStudentCancel = () => {
    if (user?.role !== 'student') return false;
    if (lesson.status === 'cancelled') return false;
    const hoursUntil = getHoursUntilLesson();
    return hoursUntil >= 24;
  };

  // Check if instructor can cancel
  const canInstructorCancel = () => {
    if (user?.role !== 'instructor') return false;
    return lesson.status !== 'cancelled' && lesson.instructor_id === user.id;
  };

  // Check if it's within 24 hours (instructor decides on refund)
  const isWithin24Hours = () => {
    return getHoursUntilLesson() < 24;
  };

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

  const handleCancelClick = () => {
    // If instructor and lesson is accepted and within 24h, show refund dialog
    if (user?.role === 'instructor' && lesson.status === 'accepted' && isWithin24Hours()) {
      setShowRefundDialog(true);
    } else {
      setShowCancelDialog(true);
    }
  };

  const handleConfirmCancel = async (refundCredits: boolean = true) => {
    setIsCancelling(true);
    try {
      // Instructor always gets refund option, student cancelling 24h+ always refunds
      const shouldRefund = user?.role === 'instructor' ? refundCredits : true;
      await cancelLesson(lesson.id, shouldRefund && lesson.status === 'accepted');
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setShowRefundDialog(false);
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
DESCRIPTION:Rijles van ${lesson.duration} minuten${lesson.remarks ? `\\nOpmerking: ${lesson.remarks}` : ''}
LOCATION:${lesson.remarks || ''}
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

      <div className="flex gap-4 text-sm text-muted-foreground mb-3">
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

      {/* Remarks / Pickup location */}
      {lesson.remarks && (
        <div className="flex items-start gap-2 bg-muted/30 rounded-lg px-3 py-2 mb-3 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-muted-foreground">{lesson.remarks}</span>
        </div>
      )}

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

      {/* Cancel button for instructor */}
      {canInstructorCancel() && (
        <Button
          size="sm"
          variant="destructive"
          className="w-full gap-2"
          onClick={handleCancelClick}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Les annuleren
        </Button>
      )}

      {/* Cancel button for student (only 24h+ before) */}
      {user?.role === 'student' && lesson.status === 'accepted' && canStudentCancel() && (
        <Button
          size="sm"
          variant="destructive"
          className="w-full gap-2"
          onClick={handleCancelClick}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Les annuleren
        </Button>
      )}

      {/* Warning for student within 24h */}
      {user?.role === 'student' && lesson.status === 'accepted' && !canStudentCancel() && getHoursUntilLesson() > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span>Annuleren binnen 24 uur niet mogelijk</span>
        </div>
      )}

      {lesson.status === 'accepted' && (
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2 mt-2"
          onClick={generateICS}
        >
          <Download className="w-4 h-4" />
          Toevoegen aan agenda
        </Button>
      )}

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Les annuleren</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze les wilt annuleren?
              {lesson.status === 'accepted' && ' De credit wordt teruggeboekt.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Terug</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmCancel(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ja, annuleren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refund decision dialog (instructor within 24h) */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Credit terugboeken?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze les is binnen 24 uur. Wil je de credit terugboeken naar de leerling?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Terug</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => handleConfirmCancel(false)}
              disabled={isCancelling}
            >
              Annuleren zonder terugboeking
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleConfirmCancel(true)}
              disabled={isCancelling}
            >
              Annuleren + credit terug
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  // Swipeable card for pending lessons
  if (canSwipe) {
    return (
      <div className="relative overflow-hidden rounded-2xl touch-pan-y">
        {/* Background indicators */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-start pl-6 rounded-2xl pointer-events-none"
          style={{ backgroundColor: bgReject }}
        >
          <motion.div style={{ scale: rejectIconScale, opacity: rejectIconOpacity }}>
            <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center shadow-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-end pr-6 rounded-2xl pointer-events-none"
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
          className="glass-card p-4 relative z-10 will-change-transform"
          style={{ 
            x, 
            opacity, 
            scale,
            touchAction: 'pan-y',
          }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          dragSnapToOrigin
          onDragEnd={handleDragEnd}
          dragTransition={{ 
            bounceStiffness: 300, 
            bounceDamping: 30 
          }}
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