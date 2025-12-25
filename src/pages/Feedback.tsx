import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { FeedbackCard } from '@/components/FeedbackCard';
import { MobileMenu } from '@/components/MobileMenu';
import { FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Feedback() {
  const { user } = useAuth();
  const { getFeedbackForStudent, lessons, feedback } = useData();

  if (!user) return null;

  const studentFeedback = user.role === 'student' 
    ? getFeedbackForStudent(user.id)
    : feedback;

  // Calculate average rating
  const averageRating = studentFeedback.length > 0
    ? studentFeedback.reduce((sum, f) => sum + f.rating, 0) / studentFeedback.length
    : 0;

  // Get all topics practiced
  const allTopics = studentFeedback
    .flatMap(f => f.topics_practiced || [])
    .reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedTopics = Object.entries(allTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="page-container">
      <MobileMenu />
      <Header title="Mijn Feedback" />

      {/* Stats */}
      {studentFeedback.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Gemiddelde</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {averageRating.toFixed(1)}/5
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-medium">Totaal</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {studentFeedback.length} lessen
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Topics */}
      {sortedTopics.length > 0 && (
        <div className="mb-6">
          <h3 className="section-title">Meest geoefend</h3>
          <div className="flex flex-wrap gap-2">
            {sortedTopics.map(([topic, count]) => (
              <div
                key={topic}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-accent/10 text-accent flex items-center gap-2"
              >
                {topic}
                <span className="text-xs bg-accent/20 px-1.5 py-0.5 rounded-full">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback list */}
      <h3 className="section-title">
        <FileText className="w-4 h-4 text-primary" />
        Lesrapporten
      </h3>

      {studentFeedback.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Geen feedback</h4>
          <p className="text-sm text-muted-foreground">
            Je hebt nog geen feedback ontvangen voor voltooide lessen
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {studentFeedback
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map(fb => {
              const lesson = lessons.find(l => l.id === fb.lesson_id);
              return (
                <FeedbackCard key={fb.id} feedback={fb} lesson={lesson} />
              );
            })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}