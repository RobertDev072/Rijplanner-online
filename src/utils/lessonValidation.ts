import { Lesson } from '@/types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Check if a new lesson overlaps with existing lessons for the same instructor
 */
export function checkInstructorAvailability(
  instructorId: string,
  date: string,
  startTime: string,
  duration: number,
  existingLessons: Lesson[],
  excludeLessonId?: string
): ValidationResult {
  // Parse start time to minutes
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const newStartMinutes = startHour * 60 + startMinute;
  const newEndMinutes = newStartMinutes + duration;

  // Filter lessons for the same instructor on the same date
  const instructorLessons = existingLessons.filter(
    (l) =>
      l.instructor_id === instructorId &&
      l.date === date &&
      l.status !== 'cancelled' &&
      l.id !== excludeLessonId
  );

  for (const lesson of instructorLessons) {
    const [lessonHour, lessonMinute] = lesson.start_time.split(':').map(Number);
    const lessonStartMinutes = lessonHour * 60 + lessonMinute;
    const lessonEndMinutes = lessonStartMinutes + lesson.duration;

    // Check for overlap
    if (
      (newStartMinutes >= lessonStartMinutes && newStartMinutes < lessonEndMinutes) ||
      (newEndMinutes > lessonStartMinutes && newEndMinutes <= lessonEndMinutes) ||
      (newStartMinutes <= lessonStartMinutes && newEndMinutes >= lessonEndMinutes)
    ) {
      const formattedTime = `${lesson.start_time.slice(0, 5)} - ${formatTime(lessonEndMinutes)}`;
      return {
        valid: false,
        error: `Instructeur heeft al een les op ${formattedTime}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Check if a new lesson overlaps with existing lessons for the same student
 */
export function checkStudentAvailability(
  studentId: string,
  date: string,
  startTime: string,
  duration: number,
  existingLessons: Lesson[],
  excludeLessonId?: string
): ValidationResult {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const newStartMinutes = startHour * 60 + startMinute;
  const newEndMinutes = newStartMinutes + duration;

  const studentLessons = existingLessons.filter(
    (l) =>
      l.student_id === studentId &&
      l.date === date &&
      l.status !== 'cancelled' &&
      l.id !== excludeLessonId
  );

  for (const lesson of studentLessons) {
    const [lessonHour, lessonMinute] = lesson.start_time.split(':').map(Number);
    const lessonStartMinutes = lessonHour * 60 + lessonMinute;
    const lessonEndMinutes = lessonStartMinutes + lesson.duration;

    if (
      (newStartMinutes >= lessonStartMinutes && newStartMinutes < lessonEndMinutes) ||
      (newEndMinutes > lessonStartMinutes && newEndMinutes <= lessonEndMinutes) ||
      (newStartMinutes <= lessonStartMinutes && newEndMinutes >= lessonEndMinutes)
    ) {
      const formattedTime = `${lesson.start_time.slice(0, 5)} - ${formatTime(lessonEndMinutes)}`;
      return {
        valid: false,
        error: `Leerling heeft al een les op ${formattedTime}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Check if student has enough credits
 */
export function checkStudentCredits(
  availableCredits: number,
  requiredCredits: number = 1
): ValidationResult {
  if (availableCredits < requiredCredits) {
    return {
      valid: false,
      error: `Leerling heeft onvoldoende credits (${availableCredits} beschikbaar, ${requiredCredits} nodig)`,
    };
  }
  return { valid: true };
}

/**
 * Format minutes to HH:MM time string
 */
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Run all validations for a new lesson
 */
export function validateNewLesson(
  instructorId: string,
  studentId: string,
  date: string,
  startTime: string,
  duration: number,
  existingLessons: Lesson[],
  availableCredits: number
): ValidationResult {
  // Check credits first
  const creditsCheck = checkStudentCredits(availableCredits);
  if (!creditsCheck.valid) return creditsCheck;

  // Check instructor availability
  const instructorCheck = checkInstructorAvailability(
    instructorId,
    date,
    startTime,
    duration,
    existingLessons
  );
  if (!instructorCheck.valid) return instructorCheck;

  // Check student availability
  const studentCheck = checkStudentAvailability(
    studentId,
    date,
    startTime,
    duration,
    existingLessons
  );
  if (!studentCheck.valid) return studentCheck;

  return { valid: true };
}
