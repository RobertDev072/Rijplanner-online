import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileMenu } from "@/components/MobileMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Search,
  Filter,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Star,
  Car,
  User,
  MapPin,
  Download,
  BarChart3,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonStatus, Lesson } from "@/types";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { exportLessonsToCSV } from "@/utils/csvExport";

type FilterType = "all" | LessonStatus;

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  trend?: string;
  onClick?: () => void;
  isActive?: boolean;
}

function StatCard({ icon: Icon, label, value, color, trend, onClick, isActive }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card p-4 text-left transition-all duration-200 w-full",
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-success font-medium">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </button>
  );
}

interface LessonItemProps {
  lesson: Lesson;
  onClick: () => void;
}

function LessonItem({ lesson, onClick }: LessonItemProps) {
  const { getUserById, getVehicleById, getFeedbackForLesson } = useData();
  const instructor = getUserById(lesson.instructor_id);
  const student = getUserById(lesson.student_id);
  const vehicle = lesson.vehicle_id ? getVehicleById(lesson.vehicle_id) : undefined;
  const feedback = getFeedbackForLesson(lesson.id);

  const lessonDate = parseISO(lesson.date);
  const isLessonToday = isToday(lessonDate);
  const isLessonTomorrow = isTomorrow(lessonDate);
  const isLessonPast = isPast(lessonDate);

  const statusConfig = {
    pending: {
      label: "In afwachting",
      icon: Clock,
      color: "bg-warning/10 text-warning border-warning/20",
      dotColor: "bg-warning",
    },
    accepted: {
      label: "Bevestigd",
      icon: CheckCircle2,
      color: "bg-success/10 text-success border-success/20",
      dotColor: "bg-success",
    },
    cancelled: {
      label: "Geannuleerd",
      icon: XCircle,
      color: "bg-destructive/10 text-destructive border-destructive/20",
      dotColor: "bg-destructive",
    },
    completed: {
      label: "Voltooid",
      icon: Award,
      color: "bg-primary/10 text-primary border-primary/20",
      dotColor: "bg-primary",
    },
  };

  const config = statusConfig[lesson.status];
  const StatusIcon = config.icon;

  return (
    <button
      onClick={onClick}
      className="glass-card p-4 w-full text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] group"
    >
      <div className="flex items-start gap-4">
        {/* Date badge */}
        <div className={cn(
          "w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0",
          isLessonToday ? "bg-primary text-primary-foreground" :
          isLessonTomorrow ? "bg-accent text-accent-foreground" :
          isLessonPast ? "bg-muted text-muted-foreground" :
          "bg-muted text-foreground"
        )}>
          <span className="text-lg font-bold leading-none">{format(lessonDate, 'd')}</span>
          <span className="text-[10px] uppercase font-medium">{format(lessonDate, 'MMM', { locale: nl })}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">
              {lesson.start_time.slice(0, 5)}
            </span>
            <span className="text-xs text-muted-foreground">• {lesson.duration} min</span>
            {isLessonToday && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                Vandaag
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-accent" />
              <span className="truncate">{student?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">{instructor?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
              config.color
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
              {config.label}
            </div>

            {/* Vehicle */}
            {vehicle && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                <Car className="w-3 h-3" />
                {vehicle.license_plate}
              </div>
            )}

            {/* Feedback indicator */}
            {feedback && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">
                <Star className="w-3 h-3 fill-current" />
                {feedback.rating}/5
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </button>
  );
}

export default function Lessons() {
  const { user } = useAuth();
  const { lessons, getUserById, getVehicleById, getFeedbackForLesson, users } = useData();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  if (!user || (user.role !== "admin" && user.role !== "instructor")) return null;

  // Stats
  const counts = useMemo(() => ({
    all: lessons.length,
    pending: lessons.filter((l) => l.status === "pending").length,
    accepted: lessons.filter((l) => l.status === "accepted").length,
    completed: lessons.filter((l) => l.status === "completed").length,
    cancelled: lessons.filter((l) => l.status === "cancelled").length,
  }), [lessons]);

  // Filter and search
  const filteredLessons = useMemo(() => {
    let result = filter === "all" ? lessons : lessons.filter((l) => l.status === filter);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((lesson) => {
        const instructor = getUserById(lesson.instructor_id);
        const student = getUserById(lesson.student_id);
        return (
          instructor?.name.toLowerCase().includes(query) ||
          student?.name.toLowerCase().includes(query) ||
          lesson.date.includes(query) ||
          lesson.remarks?.toLowerCase().includes(query)
        );
      });
    }

    return result.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.start_time.localeCompare(a.start_time);
    });
  }, [lessons, filter, searchQuery, getUserById]);

  // Today's lessons count
  const todayLessons = lessons.filter(l => isToday(parseISO(l.date)) && l.status !== 'cancelled').length;

  const handleExport = () => {
    exportLessonsToCSV(lessons, users);
    toast.success("Lessen geëxporteerd naar CSV!", {
      icon: <Download className="w-4 h-4" />,
    });
  };

  const selectedLessonData = selectedLesson ? {
    instructor: getUserById(selectedLesson.instructor_id),
    student: getUserById(selectedLesson.student_id),
    vehicle: selectedLesson.vehicle_id ? getVehicleById(selectedLesson.vehicle_id) : undefined,
    feedback: getFeedbackForLesson(selectedLesson.id),
  } : null;

  return (
    <MobileLayout title="Lessen Overzicht">
      <MobileMenu />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={Calendar}
          label="Totaal lessen"
          value={counts.all}
          color="bg-gradient-to-br from-primary to-primary/70"
          onClick={() => setFilter("all")}
          isActive={filter === "all"}
        />
        <StatCard
          icon={Clock}
          label="In afwachting"
          value={counts.pending}
          color="bg-gradient-to-br from-warning to-warning/70"
          onClick={() => setFilter("pending")}
          isActive={filter === "pending"}
        />
        <StatCard
          icon={CheckCircle2}
          label="Bevestigd"
          value={counts.accepted}
          color="bg-gradient-to-br from-success to-success/70"
          onClick={() => setFilter("accepted")}
          isActive={filter === "accepted"}
        />
        <StatCard
          icon={Award}
          label="Voltooid"
          value={counts.completed}
          color="bg-gradient-to-br from-accent to-accent/70"
          trend={counts.completed > 0 ? `${Math.round((counts.completed / counts.all) * 100)}%` : undefined}
          onClick={() => setFilter("completed")}
          isActive={filter === "completed"}
        />
      </div>

      {/* Today highlight */}
      {todayLessons > 0 && (
        <div className="glass-card p-4 mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Vandaag</p>
              <p className="text-sm text-muted-foreground">
                {todayLessons} {todayLessons === 1 ? 'les' : 'lessen'} gepland
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>
      )}

      {/* Search and actions */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek leerling, instructeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-muted/50 border-0"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn("rounded-xl", showFilters && "bg-primary text-primary-foreground")}
        >
          <Filter className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleExport}
          className="rounded-xl"
          title="Exporteer naar CSV"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="glass-card p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Filter op status
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all" as FilterType, label: "Alle", icon: Calendar },
              { value: "pending" as FilterType, label: "Afwachtend", icon: Clock },
              { value: "accepted" as FilterType, label: "Bevestigd", icon: CheckCircle2 },
              { value: "completed" as FilterType, label: "Voltooid", icon: Award },
              { value: "cancelled" as FilterType, label: "Geannuleerd", icon: XCircle },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = filter === f.value;
              return (
                <Button
                  key={f.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-full gap-1.5",
                    isActive && "shadow-lg shadow-primary/25"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                  <span className="text-xs opacity-70">({counts[f.value]})</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredLessons.length} {filteredLessons.length === 1 ? 'les' : 'lessen'} gevonden
        </p>
        {filter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs"
          >
            Reset filter
          </Button>
        )}
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Geen lessen gevonden</h4>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Probeer een andere zoekopdracht" : "Er zijn nog geen lessen"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              onClick={() => {
                setSelectedLesson(lesson);
                toast.info(`${getUserById(lesson.student_id)?.name} - ${format(parseISO(lesson.date), 'd MMM', { locale: nl })}`, {
                  icon: <CheckCircle2 className="w-4 h-4 text-success" />,
                  duration: 2000,
                });
              }}
            />
          ))}
        </div>
      )}

      {/* Lesson Detail Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-md mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Les Details
            </DialogTitle>
          </DialogHeader>

          {selectedLesson && selectedLessonData && (
            <div className="space-y-4">
              {/* Date and time */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex flex-col items-center justify-center",
                  isToday(parseISO(selectedLesson.date)) 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                )}>
                  <span className="text-2xl font-bold leading-none">
                    {format(parseISO(selectedLesson.date), 'd')}
                  </span>
                  <span className="text-xs uppercase">
                    {format(parseISO(selectedLesson.date), 'MMM', { locale: nl })}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {format(parseISO(selectedLesson.date), 'EEEE', { locale: nl })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLesson.start_time.slice(0, 5)} • {selectedLesson.duration} minuten
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Leerling</p>
                    <p className="font-medium text-foreground">{selectedLessonData.student?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Instructeur</p>
                    <p className="font-medium text-foreground">{selectedLessonData.instructor?.name}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              {selectedLessonData.vehicle && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <Car className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedLessonData.vehicle.brand} {selectedLessonData.vehicle.model}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedLessonData.vehicle.license_plate}
                    </p>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedLesson.remarks && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{selectedLesson.remarks}</p>
                </div>
              )}

              {/* Feedback */}
              {selectedLessonData.feedback && (
                <div className="p-4 bg-warning/5 rounded-xl border border-warning/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Award className="w-4 h-4 text-warning" />
                      Feedback
                    </p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={cn(
                            'w-4 h-4',
                            star <= selectedLessonData.feedback!.rating
                              ? 'fill-warning text-warning'
                              : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {selectedLessonData.feedback.topics_practiced && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {selectedLessonData.feedback.topics_practiced.map(topic => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {selectedLessonData.feedback.notes && (
                    <p className="text-sm text-muted-foreground">{selectedLessonData.feedback.notes}</p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="pt-2 border-t border-border">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  selectedLesson.status === 'pending' && "bg-warning/10 text-warning",
                  selectedLesson.status === 'accepted' && "bg-success/10 text-success",
                  selectedLesson.status === 'completed' && "bg-primary/10 text-primary",
                  selectedLesson.status === 'cancelled' && "bg-destructive/10 text-destructive",
                )}>
                  {selectedLesson.status === 'pending' && <Clock className="w-4 h-4" />}
                  {selectedLesson.status === 'accepted' && <CheckCircle2 className="w-4 h-4" />}
                  {selectedLesson.status === 'completed' && <Award className="w-4 h-4" />}
                  {selectedLesson.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                  {selectedLesson.status === 'pending' && "In afwachting"}
                  {selectedLesson.status === 'accepted' && "Bevestigd"}
                  {selectedLesson.status === 'completed' && "Voltooid"}
                  {selectedLesson.status === 'cancelled' && "Geannuleerd"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
