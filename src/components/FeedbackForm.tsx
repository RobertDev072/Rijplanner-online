import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lesson } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface FeedbackFormProps {
  lesson: Lesson;
  onClose: () => void;
  onSuccess: () => void;
}

const TOPICS = [
  'Starten & stoppen',
  'Schakelen',
  'Bochten',
  'Voorrang',
  'Rotondes',
  'Invoegen',
  'Parkeren',
  'Achteruit rijden',
  'Spiegelen',
  'Snelheid aanpassen',
];

export function FeedbackForm({ lesson, onClose, onSuccess }: FeedbackFormProps) {
  const { user } = useAuth();
  const { addFeedback, getUserById } = useData();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const student = getUserById(lesson.student_id);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Geef een beoordeling');
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      const success = await addFeedback({
        lesson_id: lesson.id,
        tenant_id: lesson.tenant_id,
        instructor_id: user.id,
        student_id: lesson.student_id,
        rating,
        notes: notes.trim() || null,
        topics_practiced: selectedTopics.length > 0 ? selectedTopics : null,
      });

      if (success) {
        toast.success('Feedback opgeslagen');
        onSuccess();
      } else {
        toast.error('Kon feedback niet opslaan');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Feedback geven</h2>
              <p className="text-sm text-muted-foreground">
                {student?.name} • {format(new Date(lesson.date), 'd MMMM', { locale: nl })}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Beoordeling *</label>
              <div className="flex gap-2 justify-center py-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'w-10 h-10 transition-colors',
                        (hoverRating || rating) >= star
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Geoefende onderwerpen</label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      selectedTopics.includes(topic)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Opmerkingen</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Hoe ging de les? Aandachtspunten?"
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Feedback versturen
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}