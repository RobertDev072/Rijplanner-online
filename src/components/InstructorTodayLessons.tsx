import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, Car, MessageCircle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Lesson } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface InstructorTodayLessonsProps {
  lessons: Lesson[];
}

export function InstructorTodayLessons({ lessons }: InstructorTodayLessonsProps) {
  const { getUserById, getVehicleById, getVehicleForInstructor } = useData();

  if (lessons.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h4 className="font-semibold text-foreground mb-1">Vrije dag!</h4>
        <p className="text-sm text-muted-foreground">Geen lessen gepland voor vandaag</p>
      </div>
    );
  }

  const handleWhatsApp = (student: { name: string; phone?: string | null }) => {
    if (!student.phone) return;
    
    const message = encodeURIComponent(`Hoi ${student.name.split(' ')[0]}, `);
    const cleanPhone = student.phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('0') ? `31${cleanPhone.slice(1)}` : cleanPhone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Documents checklist for student
  const getDocumentStatus = (student: { theory_passed?: boolean }) => {
    const docs = [
      { label: 'Theorie behaald', done: student.theory_passed ?? false },
    ];
    return docs;
  };

  return (
    <div className="space-y-4">
      {lessons.map((lesson, index) => {
        const student = getUserById(lesson.student_id);
        const vehicle = lesson.vehicle_id 
          ? getVehicleById(lesson.vehicle_id) 
          : getVehicleForInstructor(lesson.instructor_id);
        
        if (!student) return null;

        const endTime = new Date(`${lesson.date}T${lesson.start_time}`);
        endTime.setMinutes(endTime.getMinutes() + lesson.duration);
        const endTimeStr = format(endTime, 'HH:mm');
        const docs = getDocumentStatus(student);
        const allDocsDone = docs.every(d => d.done);

        return (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "glass-card overflow-hidden",
              lesson.status === 'pending' && "border-l-4 border-l-warning",
              lesson.status === 'accepted' && "border-l-4 border-l-success"
            )}
          >
            {/* Header with time and student */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between mb-3">
                {/* Lesson number badge */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{student.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">{lesson.start_time.slice(0, 5)}</span>
                      <span className="mx-1">→</span>
                      <span className="font-medium">{endTimeStr}</span>
                      <span className="text-xs ml-1">({lesson.duration} min)</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full",
                  lesson.status === 'pending' && "bg-warning/10 text-warning",
                  lesson.status === 'accepted' && "bg-success/10 text-success"
                )}>
                  {lesson.status === 'pending' ? 'In afwachting' : 'Bevestigd'}
                </div>
              </div>

              {/* Pickup location */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Ophalen bij</span>
                    <span className="text-foreground font-medium text-sm">
                      {lesson.remarks || student.address || 'Geen adres opgegeven'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle info */}
              {vehicle && (
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 mb-3 text-sm">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{vehicle.brand} {vehicle.model}</span>
                  <span className="text-muted-foreground font-mono text-xs ml-auto">{vehicle.license_plate}</span>
                </div>
              )}

              {/* Documents checklist */}
              <div className="bg-muted/30 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Documenten</span>
                  {allDocsDone ? (
                    <CheckCircle2 className="w-4 h-4 text-success ml-auto" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warning ml-auto" />
                  )}
                </div>
                <div className="space-y-1.5">
                  {docs.map((doc) => (
                    <div key={doc.label} className="flex items-center gap-2 text-sm">
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center",
                        doc.done ? "bg-success" : "bg-muted"
                      )}>
                        {doc.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={cn(
                        doc.done ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {doc.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp button */}
              {student.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366]"
                  onClick={() => handleWhatsApp(student)}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp sturen
                </Button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
