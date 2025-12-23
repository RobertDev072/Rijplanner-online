export type UserRole = 'admin' | 'instructor' | 'student';

export type LessonStatus = 'pending' | 'accepted' | 'cancelled';

export interface Tenant {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  username: string;
  pincode: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  tenant_id: string;
  instructor_id: string;
  student_id: string;
  date: string;
  start_time: string;
  duration_minutes: number;
  status: LessonStatus;
  notes?: string;
  created_at: string;
  instructor?: User;
  student?: User;
}

export interface LessonRequest {
  id: string;
  lesson_id: string;
  status: LessonStatus;
  created_at: string;
  responded_at?: string;
  lesson?: Lesson;
}

export interface LessonCredits {
  id: string;
  tenant_id: string;
  student_id: string;
  credits: number;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
