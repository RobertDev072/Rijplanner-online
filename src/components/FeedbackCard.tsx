import React from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, User, Download, FileText, Clock, ChevronRight } from 'lucide-react';
import { LessonFeedback, Lesson } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface FeedbackCardProps {
  feedback: LessonFeedback;
  lesson?: Lesson;
}

export function FeedbackCard({ feedback, lesson }: FeedbackCardProps) {
  const { getUserById } = useData();
  const instructor = getUserById(feedback.instructor_id);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const downloadPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create simple text-based report
    const lessonDate = lesson ? format(new Date(lesson.date), 'd MMMM yyyy', { locale: nl }) : 'Onbekend';
    const lessonTime = lesson?.start_time?.slice(0, 5) || '';
    
    const content = `
LESRAPPORT
==========

Datum: ${lessonDate}
Tijd: ${lessonTime}
Duur: ${lesson?.duration || 60} minuten
Instructeur: ${instructor?.name || 'Onbekend'}

BEOORDELING: ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)} (${feedback.rating}/5)

${feedback.topics_practiced && feedback.topics_practiced.length > 0 ? `
GEOEFENDE ONDERWERPEN:
${feedback.topics_practiced.map(t => `• ${t}`).join('\n')}
` : ''}
${feedback.notes ? `
OPMERKINGEN:
${feedback.notes}
` : ''}

---
Gegenereerd op ${format(new Date(), 'd MMMM yyyy HH:mm', { locale: nl })}
    `.trim();

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lesrapport-${lessonDate.replace(/\s/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-success';
    if (rating >= 3) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="glass-card overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
    >
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Date icon */}
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center">
            {lesson ? (
              <>
                <span className="text-xs font-medium text-primary uppercase">
                  {format(new Date(lesson.date), 'MMM', { locale: nl })}
                </span>
                <span className="text-xl font-bold text-primary leading-none">
                  {format(new Date(lesson.date), 'd')}
                </span>
              </>
            ) : (
              <FileText className="w-6 h-6 text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {lesson && (
                <span className="font-semibold text-foreground">
                  {format(new Date(lesson.date), 'EEEE', { locale: nl })}
                </span>
              )}
              <span className={cn("font-bold text-sm", getRatingColor(feedback.rating))}>
                {feedback.rating}/5
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {lesson && (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lesson.start_time.slice(0, 5)}</span>
                  <span>•</span>
                  <span>{lesson.duration} min</span>
                </>
              )}
            </div>
          </div>

          {/* Rating stars and arrow */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={cn(
                    'w-4 h-4',
                    star <= feedback.rating
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground/20'
                  )}
                />
              ))}
            </div>
            <ChevronRight className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )} />
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
          {/* Instructor */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={instructor?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {instructor ? getInitials(instructor.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{instructor?.name || 'Onbekend'}</p>
              <p className="text-xs text-muted-foreground">Instructeur</p>
            </div>
          </div>

          {/* Topics */}
          {feedback.topics_practiced && feedback.topics_practiced.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Geoefende onderwerpen</p>
              <div className="flex flex-wrap gap-1.5">
                {feedback.topics_practiced.map(topic => (
                  <span
                    key={topic}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {feedback.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Opmerkingen</p>
              <p className="text-sm text-foreground bg-muted/30 rounded-xl p-3">
                {feedback.notes}
              </p>
            </div>
          )}

          {/* Download button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 rounded-xl h-11"
            onClick={downloadPDF}
          >
            <Download className="w-4 h-4" />
            Download rapport
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
