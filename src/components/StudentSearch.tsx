import React, { useState, useMemo, useRef } from 'react';
import { User } from '@/types';
import { Input } from '@/components/ui/input';
import { CreditsBadge } from '@/components/CreditsBadge';
import { Search, X, ChevronRight, Users, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StudentSearchProps {
  students: User[];
  selectedStudentId: string;
  onSelect: (studentId: string) => void;
  getCredits: (studentId: string) => number;
}

type FilterType = 'all' | 'with-credits' | 'no-credits';

export function StudentSearch({ students, selectedStudentId, onSelect, getCredits }: StudentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    let result = students;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        student =>
          student.name.toLowerCase().includes(query) ||
          student.username.toLowerCase().includes(query) ||
          student.phone?.toLowerCase().includes(query)
      );
    }

    // Apply credit filter
    if (filter === 'with-credits') {
      result = result.filter(student => getCredits(student.id) > 0);
    } else if (filter === 'no-credits') {
      result = result.filter(student => getCredits(student.id) === 0);
    }

    // Sort: students with credits first, then alphabetically
    return result.sort((a, b) => {
      const creditsA = getCredits(a.id);
      const creditsB = getCredits(b.id);
      if (creditsA > 0 && creditsB === 0) return -1;
      if (creditsA === 0 && creditsB > 0) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [students, searchQuery, filter, getCredits]);

  const studentsWithCredits = useMemo(() => 
    students.filter(s => getCredits(s.id) > 0).length
  , [students, getCredits]);

  const selectedStudentData = students.find(s => s.id === selectedStudentId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Alle leerlingen', count: students.length },
    { value: 'with-credits', label: 'Met credits', count: studentsWithCredits },
    { value: 'no-credits', label: 'Zonder credits', count: students.length - studentsWithCredits },
  ];

  return (
    <div className="space-y-4">
      {/* Selected student preview */}
      <AnimatePresence mode="wait">
        {selectedStudentData ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-4 border-2 border-primary bg-primary/5"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                <AvatarImage src={selectedStudentData.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                  {getInitials(selectedStudentData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate text-lg">{selectedStudentData.name}</p>
                <p className="text-sm text-muted-foreground">@{selectedStudentData.username}</p>
              </div>
              <div className="flex items-center gap-3">
                <CreditsBadge credits={getCredits(selectedStudentData.id)} size="lg" showLabel={false} />
                <button
                  type="button"
                  onClick={() => onSelect('')}
                  className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Zoek op naam, gebruikersnaam of telefoon..."
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
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFilter(option.value)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                          filter === option.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {option.label}
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs",
                          filter === option.value
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {option.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{filteredStudents.length} {filteredStudents.length === 1 ? 'leerling' : 'leerlingen'}</span>
              </div>
              {searchQuery && (
                <span className="text-xs">Zoekterm: "{searchQuery}"</span>
              )}
            </div>

            {/* Student list */}
            <div className="space-y-2 max-h-[50vh] md:max-h-[400px] overflow-y-auto rounded-2xl">
              <AnimatePresence>
                {filteredStudents.map((student, index) => {
                  const credits = getCredits(student.id);
                  const hasCredits = credits > 0;

                  return (
                    <motion.button
                      key={student.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.02, duration: 0.2 }}
                      onClick={() => onSelect(student.id)}
                      className={cn(
                        "w-full glass-card p-4 text-left flex items-center gap-4 transition-all duration-200 active:scale-[0.98]",
                        !hasCredits && "opacity-60"
                      )}
                    >
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={student.avatar_url || undefined} />
                        <AvatarFallback className={cn(
                          "font-semibold",
                          hasCredits ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{student.name}</p>
                        <p className="text-sm text-muted-foreground truncate">@{student.username}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <CreditsBadge credits={credits} size="sm" showLabel={false} />
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {filteredStudents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Geen leerlingen gevonden</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Probeer een andere zoekterm</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
