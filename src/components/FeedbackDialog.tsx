import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Lesson } from '@/types';

const TOPICS = [
  'Koppeling',
  'Sturen',
  'Schakelen',
  'Voorrang',
  'Rotondes',
  'Parkeren',
  'Invoegen',
  'Spiegels',
  'Snelweg',
  'Bijzondere verrichtingen',
  'Zelfstandig rijden',
  'Gevaarherkenning',
];

interface FeedbackDialogProps {
  lesson: Lesson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FeedbackDialog({ lesson, open, onOpenChange, onSuccess }: FeedbackDialogProps) {
  const { user } = useAuth();
  const { addFeedback } = useData();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error('Geef eerst een beoordeling');
      return;
    }

    setIsSubmitting(true);

    try {
      await addFeedback({
        lesson_id: lesson.id,
        tenant_id: lesson.tenant_id,
        instructor_id: user.id,
        student_id: lesson.student_id,
        rating,
        notes: notes || null,
        topics_practiced: selectedTopics.length > 0 ? selectedTopics : null,
      });

      setIsSuccess(true);
      toast.success('Feedback opgeslagen!');
      
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        // Reset form
        setRating(0);
        setNotes('');
        setSelectedTopics([]);
        setIsSuccess(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Kon feedback niet opslaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentName = lesson.student?.name || 'Leerling';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto rounded-3xl p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Feedback opgeslagen!</h3>
              <p className="text-muted-foreground">
                De voortgang van {studentName} is bijgewerkt.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader className="p-6 pb-4 border-b border-border/50">
                <DialogTitle className="text-xl">Les Feedback</DialogTitle>
                <DialogDescription>
                  Geef feedback voor de les met {studentName}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Rating Stars */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Beoordeling
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 rounded-lg transition-colors"
                      >
                        <Star
                          className={cn(
                            "w-10 h-10 transition-all duration-200",
                            (hoveredRating || rating) >= star
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Topics */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Geoefende onderwerpen</label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((topic) => (
                      <motion.button
                        key={topic}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTopic(topic)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                          selectedTopics.includes(topic)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50"
                        )}
                      >
                        {topic}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Notities
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Opmerkingen over de les, aandachtspunten..."
                    className="rounded-xl min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-border/50">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || rating === 0}
                  className="w-full h-12 rounded-xl text-base"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    'Feedback opslaan'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
