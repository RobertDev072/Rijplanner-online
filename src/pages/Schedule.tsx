import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomTabNav } from '@/components/BottomTabNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentSearch } from '@/components/StudentSearch';
import { VehicleSelect } from '@/components/VehicleSelect';
import { Calendar, Clock, User, Send, AlertCircle, MapPin, Sparkles, CheckCircle2, Car } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { validateNewLesson } from '@/utils/lessonValidation';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

const DURATION_OPTIONS = [
  { value: 45, label: '45 min', subtitle: 'Kort' },
  { value: 60, label: '60 min', subtitle: 'Standaard' },
  { value: 90, label: '90 min', subtitle: 'Lang' },
  { value: 120, label: '120 min', subtitle: 'Extra lang' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStudents, getCreditsForStudent, addLesson, lessons, getVehicleForInstructor, vehicles } = useData();
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [remarks, setRemarks] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'student' | 'details'>('student');

  if (!user || user.role !== 'instructor') return null;

  const students = getStudents();
  const studentCredits = selectedStudent ? getCreditsForStudent(selectedStudent) : 0;
  const selectedStudentData = students.find(s => s.id === selectedStudent);
  
  // Get instructor's assigned vehicle
  const instructorVehicle = getVehicleForInstructor(user.id);
  
  // Get available vehicles for this instructor (their assigned vehicle + unassigned ones)
  const availableVehicles = vehicles.filter(v => 
    !v.instructor_id || v.instructor_id === user.id
  );
  
  // Auto-select instructor's vehicle if available
  React.useEffect(() => {
    if (instructorVehicle && !selectedVehicleId) {
      setSelectedVehicleId(instructorVehicle.id);
    } else if (availableVehicles.length === 1 && !selectedVehicleId) {
      setSelectedVehicleId(availableVehicles[0].id);
    }
  }, [instructorVehicle, availableVehicles, selectedVehicleId]);

  // Auto-advance to details when student is selected
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    if (studentId) {
      setTimeout(() => setStep('details'), 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !date || !time) {
      toast.error('Vul alle velden in');
      return;
    }

    const validation = validateNewLesson(
      user.id,
      selectedStudent,
      date,
      time,
      duration,
      lessons,
      getCreditsForStudent(selectedStudent)
    );

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      await addLesson({
        tenant_id: user.tenant_id,
        instructor_id: user.id,
        student_id: selectedStudent,
        date,
        start_time: time,
        duration: duration,
        status: 'pending',
        remarks: remarks.trim() || null,
        vehicle_id: selectedVehicleId || instructorVehicle?.id || null,
      });

      toast.success('Lesverzoek verstuurd!');
      navigate('/agenda');
    } catch {
      toast.error('Er ging iets mis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedStudent && date && time;

  // Calculate min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-container">
      <Header title="Les inplannen" />

      {/* Progress indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          type="button"
          onClick={() => setStep('student')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
            step === 'student' || selectedStudent
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Leerling</span>
          {selectedStudent && <CheckCircle2 className="w-4 h-4" />}
        </button>
        <div className="h-0.5 flex-1 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: selectedStudent ? '100%' : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <button
          type="button"
          onClick={() => selectedStudent && setStep('details')}
          disabled={!selectedStudent}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
            step === 'details'
              ? "bg-primary text-primary-foreground"
              : selectedStudent
                ? "bg-muted text-foreground hover:bg-muted/80"
                : "bg-muted/50 text-muted-foreground cursor-not-allowed"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Details</span>
        </button>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 'student' ? (
            <motion.div
              key="student"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Selecteer een leerling
                </label>
                <StudentSearch
                  students={students}
                  selectedStudentId={selectedStudent}
                  onSelect={handleStudentSelect}
                  getCredits={getCreditsForStudent}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Selected student compact view */}
              {selectedStudentData && (
                <motion.div variants={itemVariants}>
                  <StudentSearch
                    students={students}
                    selectedStudentId={selectedStudent}
                    onSelect={(id) => {
                      setSelectedStudent(id);
                      if (!id) setStep('student');
                    }}
                    getCredits={getCreditsForStudent}
                  />
                </motion.div>
              )}

              {/* Credit Warning */}
              <AnimatePresence>
                {selectedStudent && studentCredits === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 text-destructive bg-destructive/10 p-4 rounded-2xl border border-destructive/20"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">Deze leerling heeft geen credits. De les kan niet geaccepteerd worden.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date & Time in grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Datum
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={today}
                    placeholder="Selecteer datum"
                    className="h-14 text-base"
                  />
                  {!date && (
                    <p className="text-xs text-muted-foreground">Kies een datum voor de les</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Starttijd
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="Bijv. 09:00"
                    className="h-14 text-base"
                  />
                  {!time && (
                    <p className="text-xs text-muted-foreground">Kies een starttijd</p>
                  )}
                </div>
              </motion.div>

              {/* Duration selection */}
              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Lesduur
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DURATION_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setDuration(option.value)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative p-4 rounded-2xl font-medium transition-all duration-200 text-center",
                        duration === option.value
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="text-lg font-bold block">{option.label}</span>
                      <span className={cn(
                        "text-xs mt-1 block",
                        duration === option.value ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {option.subtitle}
                      </span>
                      {duration === option.value && (
                        <motion.div
                          layoutId="duration-indicator"
                          className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Vehicle selection */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary" />
                  Voertuig
                </label>
                <VehicleSelect
                  vehicles={availableVehicles}
                  selectedVehicleId={selectedVehicleId}
                  onSelect={setSelectedVehicleId}
                  instructorVehicle={instructorVehicle}
                />
              </motion.div>

              {/* Remarks */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Ophaallocatie / Opmerking
                  <span className="text-muted-foreground font-normal text-xs">(optioneel)</span>
                </label>
                <Textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Waar moet de leerling worden opgehaald? Bijv:&#10;• Thuis: Hoofdstraat 123&#10;• Station Centraal&#10;• School (naam)"
                  className="resize-none rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-card focus:border-primary/30 min-h-[120px]"
                  rows={4}
                />
              </motion.div>

              {/* Submit button */}
              <motion.div variants={itemVariants} className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "w-full h-16 text-lg font-semibold rounded-2xl transition-all duration-300",
                    isFormValid && !isSubmitting
                      ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                      : ""
                  )}
                  disabled={isSubmitting || !isFormValid}
                >
                  <motion.div
                    className="flex items-center gap-3"
                    animate={isSubmitting ? { scale: [1, 0.95, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? 'Versturen...' : 'Lesverzoek versturen'}
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <BottomTabNav />
    </div>
  );
}
