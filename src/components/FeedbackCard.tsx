import React from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, User, Download, FileText } from 'lucide-react';
import { LessonFeedback, Lesson } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
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

  const downloadPDF = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            {lesson && (
              <>
                <span className="font-semibold text-foreground block">
                  {format(new Date(lesson.date), 'EEEE', { locale: nl })}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(lesson.date), 'd MMMM', { locale: nl })}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Star rating */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={cn(
                'w-4 h-4',
                star <= feedback.rating
                  ? 'fill-warning text-warning'
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>

      {/* Instructor */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <User className="w-4 h-4" />
        <span>{instructor?.name}</span>
        <span className="text-xs">•</span>
        <Calendar className="w-4 h-4" />
        <span>{format(new Date(feedback.created_at), 'd MMM HH:mm', { locale: nl })}</span>
      </div>

      {/* Topics */}
      {feedback.topics_practiced && feedback.topics_practiced.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {feedback.topics_practiced.map(topic => (
            <span
              key={topic}
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {feedback.notes && (
        <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mb-3">
          {feedback.notes}
        </p>
      )}

      {/* Download button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={downloadPDF}
      >
        <Download className="w-4 h-4" />
        Download rapport
      </Button>
    </motion.div>
  );
}