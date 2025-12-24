import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { LessonCard } from "@/components/LessonCard";
import { LessonProgressModal } from "@/components/LessonProgressModal";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { LessonStatus, Lesson } from "@/types";

type FilterType = "all" | LessonStatus;

export default function Lessons() {
  const { user } = useAuth();
  const { lessons } = useData();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // WIJZIGING: Nu mogen zowel admin als instructor deze pagina zien en voortgang invullen
  if (!user || !["admin", "instructor"].includes(user.role)) return null;

  const filteredLessons = filter === "all" ? lessons : lessons.filter((l) => l.status === filter);

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.start_time.localeCompare(a.start_time);
  });

  const counts = {
    all: lessons.length,
    pending: lessons.filter((l) => l.status === "pending").length,
    accepted: lessons.filter((l) => l.status === "accepted").length,
    cancelled: lessons.filter((l) => l.status === "cancelled").length,
  };

  const filters: { value: FilterType; label: string; icon: React.ElementType }[] = [
    { value: "all", label: "Alle", icon: Calendar },
    { value: "pending", label: "Afwachtend", icon: Clock },
    { value: "accepted", label: "Geaccepteerd", icon: CheckCircle },
    { value: "cancelled", label: "Geannuleerd", icon: XCircle },
  ];

  const isLessonPastOrToday = (lesson: Lesson) => {
    const lessonDateTime = new Date(`${lesson.date}T${lesson.start_time}`);
    return lessonDateTime <= new Date();
  };

  return (
    <div className="page-container">
      <Header title="Alle lessen" />

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.value;
          return (
            <Button
              key={f.value}
              variant={isActive ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter(f.value)}
              className="shrink-0"
            >
              <Icon className="w-4 h-4 mr-1" />
              {f.label} ({counts[f.value]})
            </Button>
          );
        })}
      </div>

      {/* Lessons List */}
      {sortedLessons.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Geen lessen gevonden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLessons.map((lesson, index) => {
            const isPastOrToday = isLessonPastOrToday(lesson);
            const canEditProgress = lesson.status === "accepted" && isPastOrToday;

            return (
              <div key={lesson.id} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="relative">
                  <LessonCard lesson={lesson} />

                  {/* Knop alleen voor admin en instructor bij voltooide lessen */}
                  {canEditProgress && (
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" onClick={() => setSelectedLesson(lesson)}>
                        Voortgang invullen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedLesson && (
        <LessonProgressModal
          open={!!selectedLesson}
          onOpenChange={() => setSelectedLesson(null)}
          lessonId={selectedLesson.id}
          studentName={selectedLesson.student_name || "Leerling"}
        />
      )}

      <BottomNav />
    </div>
  );
}
