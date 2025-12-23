import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditsBadge } from '@/components/CreditsBadge';
import { Calendar, Clock, User, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DURATION_OPTIONS = [45, 60, 90, 120];

export default function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStudents, getCreditsForStudent, addLesson } = useData();
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== 'instructor') return null;

  const students = getStudents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !date || !time) {
      toast.error('Vul alle velden in');
      return;
    }

    const studentCredits = getCreditsForStudent(selectedStudent);
    if (studentCredits === 0) {
      toast.error('Deze leerling heeft geen credits meer');
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
      });

      toast.success('Lesverzoek verstuurd!');
      navigate('/agenda');
    } catch {
      toast.error('Er ging iets mis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const studentCredits = selectedStudent ? getCreditsForStudent(selectedStudent) : 0;

  return (
    <div className="page-container">
      <Header title="Les inplannen" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Leerling
          </label>
          <div className="grid grid-cols-1 gap-2">
            {students.map(student => {
              const credits = getCreditsForStudent(student.id);
              const isSelected = selectedStudent === student.id;

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudent(student.id)}
                  className={cn(
                    "glass-card rounded-xl p-4 text-left transition-all duration-200",
                    isSelected
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">@{student.username}</p>
                    </div>
                    <CreditsBadge credits={credits} size="sm" showLabel={false} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credit Warning */}
        {selectedStudent && studentCredits === 0 && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Deze leerling heeft geen credits. De les kan niet geaccepteerd worden.</span>
          </div>
        )}

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Datum
          </label>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Tijd
          </label>
          <Input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Duur
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={cn(
                  "py-3 rounded-lg font-medium transition-all duration-200",
                  duration === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || !selectedStudent || !date || !time}
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? 'Versturen...' : 'Lesverzoek versturen'}
        </Button>
      </form>

      <BottomNav />
    </div>
  );
}
