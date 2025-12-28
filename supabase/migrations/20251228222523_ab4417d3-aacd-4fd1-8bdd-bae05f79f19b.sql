-- Drop existing restrictive policies that require exact auth.uid() match
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;

-- Create new RLS policies for users table that work with tenant isolation
-- Users can see all users in their tenant (needed for instructors to see students, etc.)
CREATE POLICY "users_select_own_tenant"
ON public.users
FOR SELECT
USING (
  -- Superadmins can see all
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'superadmin')
  OR
  -- Same tenant users can see each other
  tenant_id IN (SELECT u.tenant_id FROM public.users u WHERE u.id = auth.uid())
  OR
  -- User can see themselves
  id = auth.uid()
);

-- Users can only update their own record
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Drop and recreate tenant policies to allow users to see their own tenant
DROP POLICY IF EXISTS "tenants_select" ON public.tenants;

CREATE POLICY "tenants_select_own"
ON public.tenants
FOR SELECT
USING (
  -- Superadmins can see all
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'superadmin')
  OR
  -- Users can see their own tenant
  id IN (SELECT u.tenant_id FROM public.users u WHERE u.id = auth.uid())
);