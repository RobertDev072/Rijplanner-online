-- Fix lesson_credits_insert policy to allow instructors to add initial credits when creating students
DROP POLICY IF EXISTS "lesson_credits_insert" ON public.lesson_credits;

CREATE POLICY "lesson_credits_insert" 
ON public.lesson_credits 
FOR INSERT 
WITH CHECK (
  is_superadmin(auth.uid()) 
  OR (is_tenant_admin() AND (tenant_id = get_user_tenant_id()))
  OR (is_tenant_admin_or_instructor() AND (tenant_id = get_user_tenant_id()))
);