import { Lesson, LessonCredits, User } from '@/types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * Export lessons to CSV
 */
export function exportLessonsToCSV(
  lessons: Lesson[],
  users: User[],
  filename: string = 'lessen-export'
): void {
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Onbekend';

  const headers = ['Datum', 'Start tijd', 'Duur (min)', 'Instructeur', 'Leerling', 'Status', 'Aangemaakt'];
  
  const rows = lessons.map((lesson) => [
    format(new Date(lesson.date), 'd MMMM yyyy', { locale: nl }),
    lesson.start_time.slice(0, 5),
    lesson.duration.toString(),
    getUserName(lesson.instructor_id),
    getUserName(lesson.student_id),
    translateStatus(lesson.status),
    format(new Date(lesson.created_at), 'd MMM yyyy HH:mm', { locale: nl }),
  ]);

  downloadCSV(headers, rows, filename);
}

/**
 * Export credits to CSV
 */
export function exportCreditsToCSV(
  credits: LessonCredits[],
  users: User[],
  filename: string = 'credits-export'
): void {
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Onbekend';

  const headers = ['Leerling', 'Totaal credits', 'Gebruikt', 'Beschikbaar', 'Laatst bijgewerkt'];
  
  const rows = credits.map((credit) => [
    getUserName(credit.student_id),
    credit.total_credits.toString(),
    credit.used_credits.toString(),
    (credit.total_credits - credit.used_credits).toString(),
    format(new Date(credit.updated_at), 'd MMM yyyy HH:mm', { locale: nl }),
  ]);

  downloadCSV(headers, rows, filename);
}

/**
 * Export combined report to CSV
 */
export function exportFullReportToCSV(
  lessons: Lesson[],
  credits: LessonCredits[],
  users: User[],
  tenantName: string
): void {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  
  // Export lessons
  exportLessonsToCSV(lessons, users, `${tenantName}-lessen-${dateStr}`);
  
  // Small delay to prevent browser blocking multiple downloads
  setTimeout(() => {
    exportCreditsToCSV(credits, users, `${tenantName}-credits-${dateStr}`);
  }, 500);
}

/**
 * Translate status to Dutch
 */
function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    pending: 'In afwachting',
    accepted: 'Geaccepteerd',
    cancelled: 'Geannuleerd',
  };
  return translations[status] || status;
}

/**
 * Download CSV file
 */
function downloadCSV(headers: string[], rows: string[][], filename: string): void {
  // Escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  // Add BOM for Excel compatibility with special characters
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
