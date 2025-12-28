-- Drop all existing policies on users table to fix recursion
DROP POLICY IF EXISTS users_select_own_tenant ON public.users;
DROP POLICY IF EXISTS users_select_for_login ON public.users;
DROP POLICY IF EXISTS users_insert ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS users_delete ON public.users;

-- Create a function to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- Create simple, non-recursive policies for users table

-- SELECT: Users can see their own record, same tenant users, or superadmins can see all
CREATE POLICY "users_select" ON public.users
  FOR SELECT
  USING (
    -- Always allow users to see their own record
    id = auth.uid()
    -- Superadmins can see all users
    OR is_superadmin(auth.uid())
    -- Users in the same tenant can see each other
    OR (tenant_id IS NOT NULL AND tenant_id = get_user_tenant_id())
  );

-- INSERT: Only superadmins and tenant admins can insert
CREATE POLICY "users_insert" ON public.users
  FOR INSERT
  WITH CHECK (
    is_superadmin(auth.uid())
    OR (is_tenant_admin() AND tenant_id = get_user_tenant_id())
  );

-- UPDATE: Users can update their own record, admins can update same tenant users
CREATE POLICY "users_update" ON public.users
  FOR UPDATE
  USING (
    id = auth.uid()
    OR is_superadmin(auth.uid())
    OR (is_tenant_admin() AND tenant_id = get_user_tenant_id())
  )
  WITH CHECK (
    id = auth.uid()
    OR is_superadmin(auth.uid())
    OR (is_tenant_admin() AND tenant_id = get_user_tenant_id())
  );

-- DELETE: Only superadmins and tenant admins can delete
CREATE POLICY "users_delete" ON public.users
  FOR DELETE
  USING (
    is_superadmin(auth.uid())
    OR (is_tenant_admin() AND tenant_id = get_user_tenant_id())
  );