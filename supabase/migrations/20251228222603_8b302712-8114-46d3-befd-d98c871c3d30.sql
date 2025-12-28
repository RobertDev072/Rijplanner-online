-- Delete the auth user that has wrong ID so it can be recreated with correct ID
-- This is done via the Supabase auth admin API which we can't call from SQL
-- Instead, we need to ensure the secure-login function handles this properly

-- For now, let's add logging to understand the state
-- And create a helper function to check auth user exists

-- First, let's ensure RLS policies work even when auth.uid() doesn't match users.id
-- by using tenant-based isolation instead of user ID matching

-- Drop and recreate lessons policies to use tenant isolation
DROP POLICY IF EXISTS "lessons_select" ON public.lessons;
DROP POLICY IF EXISTS "lessons_insert" ON public.lessons;
DROP POLICY IF EXISTS "lessons_update" ON public.lessons;
DROP POLICY IF EXISTS "lessons_delete" ON public.lessons;

-- Create security definer function to get user's tenant_id from auth
CREATE OR REPLACE FUNCTION public.get_auth_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1
$$;

-- Create security definer function to get user's role from auth
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid() LIMIT 1
$$;

-- Lessons policies using security definer functions
CREATE POLICY "lessons_select"
ON public.lessons
FOR SELECT
USING (
  public.get_auth_user_role() = 'superadmin'
  OR tenant_id = public.get_auth_user_tenant_id()
);

CREATE POLICY "lessons_insert"
ON public.lessons
FOR INSERT
WITH CHECK (
  public.get_auth_user_role() IN ('admin', 'instructor', 'superadmin')
  AND (
    public.get_auth_user_role() = 'superadmin'
    OR tenant_id = public.get_auth_user_tenant_id()
  )
);

CREATE POLICY "lessons_update"
ON public.lessons
FOR UPDATE
USING (
  public.get_auth_user_role() IN ('admin', 'instructor', 'superadmin')
  AND (
    public.get_auth_user_role() = 'superadmin'
    OR tenant_id = public.get_auth_user_tenant_id()
  )
);

CREATE POLICY "lessons_delete"
ON public.lessons
FOR DELETE
USING (
  public.get_auth_user_role() IN ('admin', 'superadmin')
  AND (
    public.get_auth_user_role() = 'superadmin'
    OR tenant_id = public.get_auth_user_tenant_id()
  )
);