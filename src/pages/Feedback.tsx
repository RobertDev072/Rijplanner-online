import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MobileLayout } from '@/components/MobileLayout';
import { FeedbackCard } from '@/components/FeedbackCard';
import { FileText, TrendingUp, Star, Filter, Search, X, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Feedback() {
  const { user } = useAuth();
  const { getFeedbackForStudent, lessons, feedback } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  if (!user) return null;

  const studentFeedback = user.role === 'student' 
    ? getFeedbackForStudent(user.id)
    : feedback;

  // Filtered and sorted feedback
  const filteredFeedback = useMemo(() => {
    let result = [...studentFeedback];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(fb => {
        const lesson = lessons.find(l => l.id === fb.lesson_id);
        return (
          fb.notes?.toLowerCase().includes(query) ||
          fb.topics_practiced?.some(t => t.toLowerCase().includes(query)) ||
          lesson?.remarks?.toLowerCase().includes(query)
        );
      });
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      result = result.filter(fb => fb.rating === rating);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [studentFeedback, searchQuery, ratingFilter, sortOption, lessons]);

  // Calculate average rating
  const averageRating = studentFeedback.length > 0
    ? studentFeedback.reduce((sum, f) => sum + f.rating, 0) / studentFeedback.length
    : 0;

  // Get rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    studentFeedback.forEach(fb => {
      dist[fb.rating as keyof typeof dist]++;
    });
    return dist;
  }, [studentFeedback]);

  // Get all topics practiced
  const allTopics = studentFeedback
    .flatMap(f => f.topics_practiced || [])
    .reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedTopics = Object.entries(allTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const ratingOptions: { value: RatingFilter; label: string; count: number }[] = [
    { value: 'all', label: 'Alle', count: studentFeedback.length },
    { value: '5', label: '5 ★', count: ratingDistribution[5] },
    { value: '4', label: '4 ★', count: ratingDistribution[4] },
    { value: '3', label: '3 ★', count: ratingDistribution[3] },
    { value: '2', label: '2 ★', count: ratingDistribution[2] },
    { value: '1', label: '1 ★', count: ratingDistribution[1] },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Nieuwste eerst' },
    { value: 'oldest', label: 'Oudste eerst' },
    { value: 'highest', label: 'Hoogste score' },
    { value: 'lowest', label: 'Laagste score' },
  ];

  return (
    <MobileLayout title="Mijn Feedback">

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stats Cards */}
        {studentFeedback.length > 0 && (
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium">Gemiddelde</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={cn(
                        'w-3.5 h-3.5',
                        star <= Math.round(averageRating)
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-xs font-medium">Totaal</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{studentFeedback.length}</span>
                  <span className="text-muted-foreground">lessen</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">met feedback</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Topics */}
        {sortedTopics.length > 0 && (
          <motion.div variants={itemVariants}>
            <h3 className="section-title mb-3">
              <Sparkles className="w-4 h-4 text-accent" />
              Meest geoefend
            </h3>
            <div className="flex flex-wrap gap-2">
              {sortedTopics.map(([topic, count], index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-4 py-2 rounded-2xl text-sm font-medium bg-accent/10 text-accent flex items-center gap-2 hover:bg-accent/15 transition-colors cursor-default"
                >
                  {topic}
                  <span className="text-xs bg-accent/20 px-2 py-0.5 rounded-full font-semibold">{count}x</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Zoek in feedback..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-base rounded-2xl bg-muted/50 border-0 focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors",
                  showFilters ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Filter className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3"
              >
                {/* Rating filter */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {ratingOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRatingFilter(option.value)}
                      disabled={option.count === 0 && option.value !== 'all'}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                        ratingFilter === option.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : option.count === 0 && option.value !== 'all'
                            ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {option.label}
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        ratingFilter === option.value
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sort options */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortOption(option.value)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                        sortOption === option.value
                          ? "bg-secondary text-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        option.value === 'oldest' || option.value === 'lowest' ? "rotate-180" : ""
                      )} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results count */}
        <motion.div variants={itemVariants} className="flex items-center justify-between text-sm text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{filteredFeedback.length} {filteredFeedback.length === 1 ? 'rapport' : 'rapporten'}</span>
          </div>
          {searchQuery && (
            <span className="text-xs">Zoekterm: "{searchQuery}"</span>
          )}
        </motion.div>

        {/* Feedback list */}
        <motion.div variants={itemVariants}>
          {filteredFeedback.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">
                {studentFeedback.length === 0 ? 'Geen feedback' : 'Geen resultaten'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {studentFeedback.length === 0
                  ? 'Je hebt nog geen feedback ontvangen voor voltooide lessen'
                  : 'Pas je zoekopdracht of filters aan'
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredFeedback.map((fb, index) => {
                  const lesson = lessons.find(l => l.id === fb.lesson_id);
                  return (
                    <motion.div
                      key={fb.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <FeedbackCard feedback={fb} lesson={lesson} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </MobileLayout>
  );
}
