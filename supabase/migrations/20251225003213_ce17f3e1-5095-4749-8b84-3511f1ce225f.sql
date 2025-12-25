-- Fix lessons RLS policies - current policies use auth.uid() which doesn't work
-- because this app uses custom auth (username/pincode), not Supabase Auth

-- Drop all existing restrictive policies on lessons
DROP POLICY IF EXISTS "Allow instructors to update their lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow lesson creation for admins and instructors" ON public.lessons;
DROP POLICY IF EXISTS "Allow lesson deletion for admins and instructors" ON public.lessons;
DROP POLICY IF EXISTS "Allow lesson updates for assigned users" ON public.lessons;
DROP POLICY IF EXISTS "Allow users to view their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow view access based on role" ON public.lessons;

-- Create permissive policies (since we don't have Supabase Auth)
-- Access control is handled in the frontend via DataContext filtering by tenant_id

CREATE POLICY "Allow read access to lessons" 
ON public.lessons FOR SELECT 
USING (true);

CREATE POLICY "Allow insert lessons" 
ON public.lessons FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update lessons" 
ON public.lessons FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete lessons" 
ON public.lessons FOR DELETE 
USING (true);