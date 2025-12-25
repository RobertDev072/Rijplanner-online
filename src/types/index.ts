export type UserRole = 'admin' | 'instructor' | 'student' | 'superadmin';

export type LessonStatus = 'pending' | 'accepted' | 'cancelled' | 'completed';

export interface Tenant {
  id: string;
  name: string;
  created_at: string;
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
