import React, { useState } from 'react';
import { Clock, User, ChevronRight, CheckCircle, XCircle, Loader2, Phone, MapPin, Mail, MessageCircle, GraduationCap, Car } from 'lucide-react';
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

const STATUS_LABEL = {
  pending: 'In afwachting',
  accepted: 'Bevestigd',
  cancelled: 'Geannuleerd',
  completed: 'Voltooid',
};

export function LessonCardCompact({ lesson, showActions = false, onStatusChange }: LessonCardCompactProps) {
  const { getUserById, getCreditsForStudent, getVehicleById, getVehicleForInstructor } = useData();
  const { user } = useAuth();
  const instructor = getUserById(lesson.instructor_id);
  const student = getUserById(lesson.student_id);
  const vehicle = lesson.vehicle_id 
    ? getVehicleById(lesson.vehicle_id) 
    : getVehicleForInstructor(lesson.instructor_id);
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

  const openWhatsApp = (phone: string, name: string) => {
    // Clean phone number - remove spaces, dashes, etc.
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    // If it starts with 0, replace with +31 (Netherlands)
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+31' + cleanPhone.slice(1);
    }
    // If it doesn't start with +, add +31
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+31' + cleanPhone;
    }
    
    const message = encodeURIComponent(`Hoi ${name.split(' ')[0] || 'daar'}, betreft mijn rijles op ${format(new Date(lesson.date), 'd MMMM', { locale: nl })} om ${lesson.start_time.slice(0, 5)}.`);
    window.open(`https://wa.me/${cleanPhone.replace('+', '')}?text=${message}`, '_blank');
  };

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <>
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 transition-all",
          "hover:border-primary/30 hover:shadow-sm cursor-pointer active:scale-[0.99]",
          lesson.status === 'pending' && "border-l-4 border-l-warning"
        )}
        onClick={() => setShowDetails(true)}
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

        {/* WhatsApp button for students to contact instructor */}
        {user?.role === 'student' && instructor?.phone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openWhatsApp(instructor.phone!, instructor.name || 'Instructeur');
            }}
            className="p-2 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors shrink-0"
            title="WhatsApp instructeur"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        )}

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
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{format(new Date(lesson.date), 'EEEE d MMMM', { locale: nl })}</span>
              <span className="text-muted-foreground font-normal">•</span>
              <span className="text-primary">{lesson.start_time.slice(0, 5)}</span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-2 h-2 rounded-full", STATUS_DOT[lesson.status])} />
            <span className="text-sm font-medium">{STATUS_LABEL[lesson.status]}</span>
            <span className="text-sm text-muted-foreground">• {lesson.duration} minuten</span>
          </div>

          {/* Instructor view: Student details */}
          {isInstructor && student && (
            <div className="space-y-3">
              {/* Student header */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {student.avatar_url ? (
                    <img 
                      src={student.avatar_url} 
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{student.name}</p>
                  <p className="text-sm text-muted-foreground">Leerling</p>
                </div>
                {/* WhatsApp button */}
                {student.phone && (
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(student.phone!, student.name || 'Leerling');
                    }}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Student contact info */}
              <div className="space-y-2">
                {student.phone && (
                  <a 
                    href={`tel:${student.phone}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm">{student.phone}</span>
                  </a>
                )}
                {student.email && (
                  <a 
                    href={`mailto:${student.email}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm truncate">{student.email}</span>
                  </a>
                )}
                {student.address && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm">{student.address}</span>
                  </div>
                )}
              </div>

              {/* Theory status */}
              <div className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg text-sm",
                student.theory_passed 
                  ? "bg-success/10 text-success" 
                  : "bg-warning/10 text-warning"
              )}>
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium">
                  {student.theory_passed ? 'Theorie gehaald' : 'Theorie nog niet gehaald'}
                </span>
              </div>

              {/* Vehicle info */}
              {vehicle && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <Car className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{vehicle.brand} {vehicle.model}</span>
                  <span className="text-xs text-muted-foreground font-mono">{vehicle.license_plate}</span>
                </div>
              )}

              {/* Pickup location / Remarks */}
              {lesson.remarks && (
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Ophaallocatie</p>
                    <p className="text-sm">{lesson.remarks}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student view: Show regular lesson card */}
          {!isInstructor && (
            <LessonCard 
              lesson={lesson} 
              showActions={showActions} 
              onStatusChange={onStatusChange}
            />
          )}

          {/* Instructor actions */}
          {isInstructor && (
            <div className="pt-2 border-t border-border mt-3">
              <LessonCard 
                lesson={lesson} 
                showActions={false} 
                onStatusChange={onStatusChange}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
