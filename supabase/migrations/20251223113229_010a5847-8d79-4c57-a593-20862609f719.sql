-- Create enums for user roles and lesson status
CREATE TYPE public.user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE public.lesson_status AS ENUM ('pending', 'accepted', 'cancelled');

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table (with username + pincode auth)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  pincode TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, username)
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  status public.lesson_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_credits table
CREATE TABLE public.lesson_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_credits INTEGER NOT NULL DEFAULT 0,
  used_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_tenant ON public.users(tenant_id);
CREATE INDEX idx_lessons_tenant ON public.lessons(tenant_id);
CREATE INDEX idx_lessons_instructor ON public.lessons(instructor_id);
CREATE INDEX idx_lessons_student ON public.lessons(student_id);
CREATE INDEX idx_lessons_date ON public.lessons(date);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_credits ENABLE ROW LEVEL SECURITY;

-- Create simple policies (allow all for now - app uses custom auth)
CREATE POLICY "Allow all access to tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lesson_credits" ON public.lesson_credits FOR ALL USING (true) WITH CHECK (true);

-- Insert default tenant
INSERT INTO public.tenants (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Rijschool');

-- Insert demo users
INSERT INTO public.users (tenant_id, username, pincode, role, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', '1234', 'admin', 'Jan de Vries'),
  ('00000000-0000-0000-0000-000000000001', 'instructeur1', '5678', 'instructor', 'Peter Jansen'),
  ('00000000-0000-0000-0000-000000000001', 'leerling1', '9012', 'student', 'Lisa Bakker'),
  ('00000000-0000-0000-0000-000000000001', 'leerling2', '3456', 'student', 'Mark Visser');

-- Insert demo credits for students
INSERT INTO public.lesson_credits (tenant_id, student_id, total_credits, used_credits)
SELECT '00000000-0000-0000-0000-000000000001', id, 10, 2
FROM public.users WHERE username = 'leerling1';

INSERT INTO public.lesson_credits (tenant_id, student_id, total_credits, used_credits)
SELECT '00000000-0000-0000-0000-000000000001', id, 5, 0
FROM public.users WHERE username = 'leerling2';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lesson_credits
CREATE TRIGGER update_lesson_credits_updated_at
  BEFORE UPDATE ON public.lesson_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();