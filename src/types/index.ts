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
  created_at: string;
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
  created_at: string;
  instructor?: User;
  student?: User;
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
