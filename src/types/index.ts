export type UserRole = 'admin' | 'instructor' | 'student' | 'superadmin';

export type LessonStatus = 'pending' | 'accepted' | 'cancelled' | 'completed';

export type TenantStatus = 'active' | 'trial' | 'suspended';

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  user_limit: number;
  trial_ends_at?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  whatsapp_number?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  tenant_id: string | null;
  username: string;
  pincode: string;
  role: UserRole;
  name: string;
  avatar_url?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  theory_passed?: boolean;
  theory_passed_at?: string | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  tenant_id: string;
  brand: string;
  model: string;
  license_plate: string;
  instructor_id: string | null;
  created_at: string;
  updated_at: string;
  instructor?: User;
}

export interface Lesson {
  id: string;
  tenant_id: string;
  instructor_id: string;
  student_id: string;
  date: string;
  start_time: string;
  duration: number;
  status: LessonStatus;
  remarks?: string | null;
  vehicle_id?: string | null;
  created_at: string;
  instructor?: User;
  student?: User;
  vehicle?: Vehicle;
}

export interface LessonCredits {
  id: string;
  tenant_id: string;
  student_id: string;
  total_credits: number;
  used_credits: number;
  created_at: string;
  updated_at: string;
}

export interface LessonFeedback {
  id: string;
  lesson_id: string;
  tenant_id: string;
  instructor_id: string;
  student_id: string;
  rating: number;
  notes: string | null;
  topics_practiced: string[] | null;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  tenant_id: string;
  feature_key: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  target_name?: string | null;
  details?: unknown;
  ip_address?: string | null;
  tenant_id?: string | null;
  created_at: string;
}

export interface ImpersonationSession {
  id: string;
  superadmin_id: string;
  impersonated_user_id: string;
  started_at: string;
  ended_at?: string | null;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Available feature flags
export const AVAILABLE_FEATURES = [
  { key: 'push_notifications', label: 'Push Notificaties', description: 'Stuur push notificaties naar gebruikers' },
  { key: 'lesson_feedback', label: 'Les Feedback', description: 'Instructeurs kunnen feedback geven na lessen' },
  { key: 'vehicle_management', label: 'Voertuigbeheer', description: 'Beheer voertuigen en koppel aan instructeurs' },
  { key: 'whatsapp_integration', label: 'WhatsApp Integratie', description: 'Stuur berichten via WhatsApp' },
  { key: 'csv_export', label: 'CSV Export', description: 'Exporteer data naar CSV bestanden' },
  { key: 'theory_tracking', label: 'Theorie Tracking', description: 'Houd theorie voortgang bij' },
] as const;
