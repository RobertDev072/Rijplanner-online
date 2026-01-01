import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { 
  CalendarOff, 
  Plus, 
  Trash2, 
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO, isBefore, startOfDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UnavailabilityPeriod {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export default function Availability() {
  const { user } = useAuth();
  const [unavailability, setUnavailability] = useState<UnavailabilityPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('23:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const today = startOfDay(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch unavailability periods
  const fetchUnavailability = async () => {
    if (!user?.tenant_id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('instructor_availability')
        .select('*')
        .eq('instructor_id', user.id)
        .eq('tenant_id', user.tenant_id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      setUnavailability(data || []);
    } catch (error) {
      console.error('Error fetching unavailability:', error);
      toast.error('Kon beschikbaarheid niet laden');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnavailability();
  }, [user]);

  const handleAddUnavailability = async () => {
    if (!selectedDate || !user?.tenant_id) return;
    
    if (startTime >= endTime) {
      toast.error('Eindtijd moet na starttijd zijn');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('instructor_availability')
        .insert({
          tenant_id: user.tenant_id,
          instructor_id: user.id,
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
        });
      
      if (error) throw error;
      
      toast.success('Afwezigheid toegevoegd');
      setSelectedDate(null);
      setStartTime('06:00');
      setEndTime('23:00');
      fetchUnavailability();
    } catch (error: any) {
      console.error('Error adding unavailability:', error);
      toast.error('Kon afwezigheid niet toevoegen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAddFullDay = async (date: Date) => {
    if (!user?.tenant_id) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if already has full day unavailability
    const existing = unavailability.find(u => u.date === dateStr && u.start_time === '06:00' && u.end_time === '23:00');
    if (existing) {
      // Remove it
      handleDelete(existing.id);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('instructor_availability')
        .insert({
          tenant_id: user.tenant_id,
          instructor_id: user.id,
          date: dateStr,
          start_time: '06:00',
          end_time: '23:00',
        });
      
      if (error) throw error;
      toast.success('Hele dag afwezig gemarkeerd');
      fetchUnavailability();
    } catch (error) {
      console.error('Error adding unavailability:', error);
      toast.error('Kon afwezigheid niet toevoegen');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('instructor_availability')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Afwezigheid verwijderd');
      setDeleteId(null);
      fetchUnavailability();
    } catch (error) {
      console.error('Error deleting unavailability:', error);
      toast.error('Kon afwezigheid niet verwijderen');
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const getUnavailabilityForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return unavailability.filter(u => u.date === dateStr);
  };

  const isFullDayUnavailable = (date: Date) => {
    const periods = getUnavailabilityForDate(date);
    return periods.some(p => p.start_time === '06:00' && p.end_time === '23:00');
  };

  const hasPartialUnavailability = (date: Date) => {
    const periods = getUnavailabilityForDate(date);
    return periods.length > 0 && !isFullDayUnavailable(date);
  };

  if (!user) return null;

  return (
    <MobileLayout title="Beschikbaarheid">
      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Tik op een dag om hele dag afwezig te markeren, of selecteer specifieke uren.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Week Navigation */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek('prev')}
            className="rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <span className="font-bold text-lg">{format(weekStart, 'MMMM', { locale: nl })}</span>
            <span className="text-muted-foreground ml-2">{format(weekStart, 'yyyy')}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek('next')}
            className="rounded-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, new Date());
            const isPast = isBefore(day, today);
            const isSunday = day.getDay() === 0;
            const isUnavailable = isFullDayUnavailable(day);
            const hasPartial = hasPartialUnavailability(day);
            const dayPeriods = getUnavailabilityForDate(day);

            return (
              <button
                key={idx}
                onClick={() => {
                  if (isPast || isSunday) return;
                  handleQuickAddFullDay(day);
                }}
                disabled={isPast || isSunday}
                className={cn(
                  "flex flex-col items-center py-2 px-1 rounded-xl transition-all relative",
                  "touch-manipulation active:scale-95",
                  isPast && "opacity-40 cursor-not-allowed",
                  isSunday && "opacity-30 cursor-not-allowed",
                  isToday && !isUnavailable && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  isUnavailable && "bg-destructive/20 text-destructive",
                  hasPartial && !isUnavailable && "bg-warning/20 text-warning",
                  !isUnavailable && !hasPartial && !isPast && !isSunday && "hover:bg-muted"
                )}
              >
                <span className="text-[10px] font-medium uppercase opacity-70">
                  {format(day, 'EEE', { locale: nl })}
                </span>
                <span className="text-lg font-bold">{format(day, 'd')}</span>
                
                {/* Status indicator */}
                {isUnavailable && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                    <CalendarOff className="w-2.5 h-2.5 text-destructive-foreground" />
                  </div>
                )}
                {hasPartial && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning flex items-center justify-center">
                    <Clock className="w-2.5 h-2.5 text-warning-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-success/20 border border-success/30" />
            <span className="text-muted-foreground">Beschikbaar</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-warning/20 border border-warning/30" />
            <span className="text-muted-foreground">Deels afwezig</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30" />
            <span className="text-muted-foreground">Hele dag</span>
          </div>
        </div>
      </div>

      {/* Week Details - Unavailability list for this week */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground">Deze week</h3>
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {weekDays.map(day => {
              const periods = getUnavailabilityForDate(day);
              if (periods.length === 0) return null;
              
              return (
                <motion.div
                  key={format(day, 'yyyy-MM-dd')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {periods.map(period => (
                    <div
                      key={period.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        period.start_time === '06:00' && period.end_time === '23:00'
                          ? "bg-destructive/10"
                          : "bg-warning/10"
                      )}>
                        <CalendarOff className={cn(
                          "w-5 h-5",
                          period.start_time === '06:00' && period.end_time === '23:00'
                            ? "text-destructive"
                            : "text-warning"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {format(parseISO(period.date), 'EEEE d MMM', { locale: nl })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {period.start_time === '06:00' && period.end_time === '23:00' 
                            ? 'Hele dag' 
                            : `${period.start_time.slice(0, 5)} - ${period.end_time.slice(0, 5)}`}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(period.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!isLoading && weekDays.every(day => getUnavailabilityForDate(day).length === 0) && (
          <Card className="p-4 text-center rounded-xl">
            <Check className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Volledig beschikbaar deze week</p>
          </Card>
        )}
      </div>

      {/* Add specific hours */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Specifieke uren toevoegen
        </h3>

        <div className="glass-card rounded-2xl p-4 space-y-4">
          {/* Quick day select */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, idx) => {
              const isPast = isBefore(day, today);
              const isSunday = day.getDay() === 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isPast || isSunday) return;
                    setSelectedDate(isSelected ? null : day);
                  }}
                  disabled={isPast || isSunday}
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium transition-all",
                    isPast || isSunday 
                      ? "opacity-30 cursor-not-allowed" 
                      : "hover:bg-muted",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, 'EEE', { locale: nl })}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-3 border-t border-border/50"
            >
              <p className="text-sm">
                <span className="text-muted-foreground">Afwezig op </span>
                <strong>{format(selectedDate, 'EEEE d MMMM', { locale: nl })}</strong>
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Van</label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tot</label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full h-11 rounded-xl"
                onClick={handleAddUnavailability}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Toevoegen
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Afwezigheid verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze afwezigheid wilt verwijderen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
}
