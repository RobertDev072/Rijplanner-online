import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarPlus, 
  Clock, 
  User, 
  CreditCard, 
  ChevronRight,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';
import { format, addDays, isBefore, isAfter, startOfDay, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Lesson, User as UserType } from '@/types';

const AVAILABLE_TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

const DURATION_OPTIONS = [
  { value: 60, label: '1 uur' },
  { value: 90, label: '1,5 uur' },
  { value: 120, label: '2 uur' },
];

type BookingStep = 'select-date' | 'select-time' | 'confirm';

export default function BookLesson() {
  const { user } = useAuth();
  const { getInstructors, lessons, addLesson, getStudentCredits } = useData();
  
  const [step, setStep] = useState<BookingStep>('select-date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unavailability, setUnavailability] = useState<any[]>([]);

  const instructors = getInstructors();
  const credits = user ? getStudentCredits(user.id) : null;
  const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;

  // Fetch unavailability for selected instructor
  React.useEffect(() => {
    const fetchUnavailability = async () => {
      if (!selectedInstructor || !user?.tenant_id) return;
      
      const { data } = await supabase
        .from('instructor_availability')
        .select('*')
        .eq('instructor_id', selectedInstructor)
        .eq('tenant_id', user.tenant_id);
      
      setUnavailability(data || []);
    };
    
    fetchUnavailability();
  }, [selectedInstructor, user?.tenant_id]);

  // Calculate available dates (next 90 days, excluding Sundays)
  const dateConstraints = useMemo(() => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 90);
    
    return {
      fromDate: today,
      toDate: maxDate,
      disabled: (date: Date) => {
        // Disable Sundays
        if (date.getDay() === 0) return true;
        // Disable past dates
        if (isBefore(date, today)) return true;
        // Disable dates beyond 90 days
        if (isAfter(date, maxDate)) return true;
        return false;
      }
    };
  }, []);

  // Check if a time slot is available
  const getAvailableTimes = useMemo(() => {
    if (!selectedDate || !selectedInstructor) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Get existing lessons for this instructor on this date
    const instructorLessons = lessons.filter(
      l => l.instructor_id === selectedInstructor && 
           l.date === dateStr && 
           l.status !== 'cancelled'
    );
    
    // Get unavailability periods for this date
    const dayUnavailability = unavailability.filter(u => u.date === dateStr);
    
    return AVAILABLE_TIMES.filter(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const slotStart = hours * 60 + minutes;
      const slotEnd = slotStart + selectedDuration;
      
      // Check against existing lessons
      for (const lesson of instructorLessons) {
        const [lh, lm] = lesson.start_time.split(':').map(Number);
        const lessonStart = lh * 60 + lm;
        const lessonEnd = lessonStart + lesson.duration;
        
        // Check for overlap
        if (slotStart < lessonEnd && slotEnd > lessonStart) {
          return false;
        }
      }
      
      // Check against unavailability
      for (const u of dayUnavailability) {
        const [ush, usm] = u.start_time.split(':').map(Number);
        const [ueh, uem] = u.end_time.split(':').map(Number);
        const unavailStart = ush * 60 + usm;
        const unavailEnd = ueh * 60 + uem;
        
        if (slotStart < unavailEnd && slotEnd > unavailStart) {
          return false;
        }
      }
      
      return true;
    });
  }, [selectedDate, selectedInstructor, selectedDuration, lessons, unavailability]);

  // Check if a date has available slots
  const isDateAvailable = (date: Date): boolean => {
    if (!selectedInstructor) return true;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if fully unavailable
    const dayUnavail = unavailability.filter(u => u.date === dateStr);
    const totalUnavailMinutes = dayUnavail.reduce((acc, u) => {
      const [sh, sm] = u.start_time.split(':').map(Number);
      const [eh, em] = u.end_time.split(':').map(Number);
      return acc + ((eh * 60 + em) - (sh * 60 + sm));
    }, 0);
    
    // If unavailable for more than 16 hours, mark as unavailable
    if (totalUnavailMinutes >= 16 * 60) return false;
    
    return true;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (date) {
      setStep('select-time');
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedDate || !selectedTime || !selectedInstructor) return;
    
    if (availableCredits < 1) {
      toast.error('Je hebt niet genoeg credits om een les te boeken');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      await addLesson({
        tenant_id: user.tenant_id!,
        instructor_id: selectedInstructor,
        student_id: user.id,
        date: dateStr,
        start_time: selectedTime,
        duration: selectedDuration,
        status: 'pending',
        created_by: user.id,
        remarks: remarks || null,
      });
      
      toast.success('Lesverzoek verzonden!', {
        description: 'Je instructeur ontvangt een melding en kan het verzoek accepteren.'
      });
      
      // Reset form
      setStep('select-date');
      setSelectedDate(undefined);
      setSelectedTime('');
      setRemarks('');
      
    } catch (error: any) {
      console.error('Error booking lesson:', error);
      toast.error('Kon les niet boeken', {
        description: error.message || 'Probeer het opnieuw'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInstructorData = instructors.find(i => i.id === selectedInstructor);

  if (!user) return null;

  return (
    <MobileLayout title="Les Boeken">
      {/* Credits Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Beschikbare credits</p>
              <p className="text-2xl font-bold text-foreground">{availableCredits}</p>
            </div>
          </div>
          {availableCredits < 3 && (
            <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 px-2.5 py-1.5 rounded-full">
              <Info className="w-3.5 h-3.5" />
              Bijna op
            </div>
          )}
        </div>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['select-date', 'select-time', 'confirm'].map((s, idx) => (
          <React.Fragment key={s}>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step === s || ['select-time', 'confirm'].indexOf(step) >= idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {idx + 1}
            </div>
            {idx < 2 && (
              <div className={cn(
                "flex-1 h-0.5 rounded-full transition-all",
                ['select-time', 'confirm'].indexOf(step) > idx
                  ? "bg-primary"
                  : "bg-muted"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Instructor & Date */}
        {step === 'select-date' && (
          <motion.div
            key="step-date"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Kies je instructeur
            </h2>
            
            <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger className="h-14 rounded-xl text-base">
                <SelectValue placeholder="Selecteer een instructeur" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map(instructor => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      {instructor.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedInstructor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2 mt-6">
                  <CalendarPlus className="w-5 h-5 text-primary" />
                  Kies een datum
                </h2>
                
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Beschikbaar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Niet beschikbaar</span>
                  </div>
                </div>

                <Card className="p-4 rounded-2xl">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={nl}
                    disabled={dateConstraints.disabled}
                    fromDate={dateConstraints.fromDate}
                    toDate={dateConstraints.toDate}
                    modifiers={{
                      available: (date) => isDateAvailable(date) && !dateConstraints.disabled(date),
                    }}
                    modifiersClassNames={{
                      available: 'bg-success/10 text-success hover:bg-success/20',
                    }}
                    className="w-full"
                  />
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Select Time */}
        {step === 'select-time' && selectedDate && (
          <motion.div
            key="step-time"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('select-date')}
              className="mb-2"
            >
              ← Terug
            </Button>

            <div className="glass-card rounded-2xl p-4 mb-4">
              <p className="text-sm text-muted-foreground">Geselecteerde datum</p>
              <p className="text-lg font-semibold">
                {format(selectedDate, "EEEE d MMMM yyyy", { locale: nl })}
              </p>
            </div>

            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Kies een duur
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={selectedDuration === option.value ? "default" : "outline"}
                  onClick={() => {
                    setSelectedDuration(option.value);
                    setSelectedTime('');
                  }}
                  className="h-12 rounded-xl"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <h2 className="text-lg font-semibold flex items-center gap-2 mt-6">
              <Clock className="w-5 h-5 text-primary" />
              Beschikbare tijden
            </h2>

            {getAvailableTimes.length === 0 ? (
              <Card className="p-6 text-center rounded-2xl">
                <p className="text-muted-foreground">
                  Geen beschikbare tijden op deze dag
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {getAvailableTimes.map(time => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="h-12 rounded-xl text-base"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}

            {selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  className="w-full h-14 rounded-xl text-base mt-4"
                  onClick={() => setStep('confirm')}
                >
                  Doorgaan
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && selectedDate && selectedTime && (
          <motion.div
            key="step-confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('select-time')}
              className="mb-2"
            >
              ← Terug
            </Button>

            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Bevestig je boeking
            </h2>

            <Card className="p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instructeur</p>
                  <p className="font-semibold">{selectedInstructorData?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarPlus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Datum</p>
                  <p className="font-semibold">
                    {format(selectedDate, "EEEE d MMMM", { locale: nl })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tijd</p>
                  <p className="font-semibold">
                    {selectedTime} - {DURATION_OPTIONS.find(d => d.value === selectedDuration)?.label}
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <label className="text-sm font-medium">Opmerkingen (optioneel)</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Bijv. ophaaladres of specifieke wensen..."
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                Je instructeur ontvangt een melding en kan het verzoek accepteren of weigeren. 
                Er wordt pas een credit afgetrokken bij acceptatie.
              </p>
            </div>

            <Button
              className="w-full h-14 rounded-xl text-base"
              onClick={handleSubmit}
              disabled={isSubmitting || availableCredits < 1}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Verzoek verzenden
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}
