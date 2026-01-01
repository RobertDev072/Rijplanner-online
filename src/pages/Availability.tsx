import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Info
} from 'lucide-react';
import { format, addDays, startOfDay, isAfter, isBefore, parseISO } from 'date-fns';
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('23:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      
      // Filter to only show future dates
      const today = format(new Date(), 'yyyy-MM-dd');
      const futureData = (data || []).filter(d => d.date >= today);
      setUnavailability(futureData);
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
    
    // Validate times
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
      setSelectedDate(undefined);
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

  // Date constraints: only future dates, no Sundays
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 365);

  // Check if a date already has unavailability
  const getUnavailabilityForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return unavailability.filter(u => u.date === dateStr);
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
              Registreer hier wanneer je <strong>niet</strong> beschikbaar bent. 
              Leerlingen kunnen geen lessen boeken tijdens deze periodes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Add new unavailability */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarOff className="w-5 h-5 text-primary" />
          Afwezigheid toevoegen
        </h2>

        <Card className="p-4 rounded-2xl">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={nl}
            disabled={(date) => 
              isBefore(date, today) || 
              isAfter(date, maxDate) || 
              date.getDay() === 0
            }
            fromDate={today}
            toDate={maxDate}
            modifiers={{
              unavailable: (date) => getUnavailabilityForDate(date).length > 0,
            }}
            modifiersClassNames={{
              unavailable: 'bg-destructive/10 text-destructive',
            }}
            className={cn("w-full pointer-events-auto")}
          />
        </Card>

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="glass-card rounded-2xl p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Afwezig op <strong>{format(selectedDate, 'EEEE d MMMM', { locale: nl })}</strong>
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    Van
                  </label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    Tot
                  </label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger className="rounded-xl">
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
                className="w-full mt-4 h-12 rounded-xl"
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
                    <Plus className="w-5 h-5 mr-2" />
                    Afwezigheid toevoegen
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Existing unavailability list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Geplande afwezigheid</h2>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : unavailability.length === 0 ? (
          <Card className="p-6 text-center rounded-2xl">
            <CalendarOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Geen afwezigheid gepland</p>
          </Card>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {unavailability.map((period) => (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <CalendarOff className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {format(parseISO(period.date), 'EEEE d MMMM', { locale: nl })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {period.start_time.slice(0, 5)} - {period.end_time.slice(0, 5)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(period.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Afwezigheid verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze afwezigheid wilt verwijderen? Leerlingen kunnen dan weer lessen boeken op dit moment.
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
