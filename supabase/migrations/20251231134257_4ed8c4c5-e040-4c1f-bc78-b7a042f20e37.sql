-- Fix RLS policy to allow instructors to create students
-- Drop the existing insert policy
DROP POLICY IF EXISTS "users_insert" ON public.users;

-- Create new insert policy that allows instructors to create students within their tenant
CREATE POLICY "users_insert" ON public.users
FOR INSERT
WITH CHECK (
  is_superadmin(auth.uid()) 
  OR (is_tenant_admin() AND (tenant_id = get_user_tenant_id()))
  OR (
    -- Instructors can create students within their tenant
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'instructor'::user_role 
      AND u.tenant_id = users.tenant_id
    ) 
    AND role = 'student'::user_role
  )
);