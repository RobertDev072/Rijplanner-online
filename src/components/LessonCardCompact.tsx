import React, { useState } from 'react';
import { Clock, User, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Lesson, LessonStatus } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { LessonCard } from './LessonCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LessonCardCompactProps {
  lesson: Lesson;
  showActions?: boolean;
  onStatusChange?: (lessonId: string, status: LessonStatus) => void;
}

const STATUS_DOT = {
  pending: 'bg-warning',
  accepted: 'bg-success',
  cancelled: 'bg-destructive',
  completed: 'bg-primary',
};

export function LessonCardCompact({ lesson, showActions = false, onStatusChange }: LessonCardCompactProps) {
  const { getUserById, getCreditsForStudent } = useData();
  const { user } = useAuth();
  const instructor = getUserById(lesson.instructor_id);
  const student = getUserById(lesson.student_id);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const personName = user?.role === 'student' 
    ? (instructor?.name || 'Instructeur') 
    : (student?.name || 'Leerling');

  const handleStatusChange = async (status: LessonStatus) => {
    setIsUpdating(status);
    await onStatusChange?.(lesson.id, status);
    setIsUpdating(null);
  };

  const canAccept = () => {
    if (user?.role !== 'student') return false;
    const credits = getCreditsForStudent(user.id);
    return credits > 0;
  };

  return (
    <>
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 transition-all",
          "hover:border-primary/30 hover:shadow-sm cursor-pointer active:scale-[0.99]",
          lesson.status === 'pending' && "border-l-4 border-l-warning"
        )}
        onClick={() => !showActions && setShowDetails(true)}
      >
        {/* Time */}
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-lg font-bold text-foreground">{lesson.start_time.slice(0, 5)}</span>
          <span className="text-[10px] text-muted-foreground">{lesson.duration}min</span>
        </div>

        {/* Divider with status dot */}
        <div className="flex flex-col items-center gap-1">
          <div className={cn("w-2.5 h-2.5 rounded-full", STATUS_DOT[lesson.status])} />
          <div className="w-px h-6 bg-border" />
        </div>

        {/* Person info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{personName}</p>
          {lesson.remarks && (
            <p className="text-xs text-muted-foreground truncate">{lesson.remarks}</p>
          )}
        </div>

        {/* Actions for pending lessons OR arrow for details */}
        {showActions && lesson.status === 'pending' && user?.role === 'student' ? (
          <div className="flex gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-success/10 hover:bg-success/20 text-success"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('accepted');
              }}
              disabled={!canAccept() || isUpdating !== null}
            >
              {isUpdating === 'accepted' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('cancelled');
              }}
              disabled={isUpdating !== null}
            >
              {isUpdating === 'cancelled' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
            </Button>
          </div>
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {format(new Date(lesson.date), 'EEEE d MMMM', { locale: nl })}
            </DialogTitle>
          </DialogHeader>
          <LessonCard 
            lesson={lesson} 
            showActions={showActions} 
            onStatusChange={onStatusChange}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
