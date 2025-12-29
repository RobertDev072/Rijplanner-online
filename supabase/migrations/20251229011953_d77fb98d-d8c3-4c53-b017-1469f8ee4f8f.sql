-- Drop existing select policy
DROP POLICY IF EXISTS "users_select" ON public.users;

-- Create new select policy that allows:
-- 1. Users to see their own record
-- 2. Superadmins to see all users
-- 3. Admins/instructors to see all users in their tenant
-- 4. Students to see instructors and admins in their tenant (to display instructor names on lessons)
CREATE POLICY "users_select" ON public.users
FOR SELECT USING (
  (id = auth.uid()) -- Can always see yourself
  OR is_superadmin(auth.uid()) -- Superadmins see all
  OR (is_tenant_admin_or_instructor() AND tenant_id IS NOT NULL AND tenant_id = get_user_tenant_id()) -- Admins/instructors see their tenant
  OR (
    -- Students can see instructors and admins in their tenant
    tenant_id = get_user_tenant_id() 
    AND role IN ('instructor', 'admin')
  )
);