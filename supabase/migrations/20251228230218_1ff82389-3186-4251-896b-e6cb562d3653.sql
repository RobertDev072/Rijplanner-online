-- Create a helper function to check if user can reset pincode for target user
-- Admins can reset instructor pincodes, instructors can reset student pincodes
CREATE OR REPLACE FUNCTION public.can_reset_pincode_for_user(_target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users current_user_row
    WHERE current_user_row.id = auth.uid()
    AND (
      -- Superadmin can reset anyone
      current_user_row.role = 'superadmin'
      OR
      -- Admin can reset instructors and students in their tenant
      (current_user_row.role = 'admin' AND EXISTS (
        SELECT 1 FROM public.users target
        WHERE target.id = _target_user_id
        AND target.tenant_id = current_user_row.tenant_id
        AND target.role IN ('instructor', 'student')
      ))
      OR
      -- Instructor can reset students in their tenant
      (current_user_row.role = 'instructor' AND EXISTS (
        SELECT 1 FROM public.users target
        WHERE target.id = _target_user_id
        AND target.tenant_id = current_user_row.tenant_id
        AND target.role = 'student'
      ))
    )
  )
$$;

-- Update the users_update policy to allow instructors to update student pincodes
DROP POLICY IF EXISTS "users_update" ON public.users;

CREATE POLICY "users_update" ON public.users
FOR UPDATE
USING (
  -- Users can update their own record
  (id = auth.uid())
  -- Superadmin can update anyone
  OR is_superadmin(auth.uid())
  -- Admin can update users in their tenant
  OR (is_tenant_admin() AND tenant_id = get_user_tenant_id())
  -- Instructors can update students in their tenant (for pincode reset)
  OR can_reset_pincode_for_user(id)
)
WITH CHECK (
  -- Users can update their own record
  (id = auth.uid())
  -- Superadmin can update anyone
  OR is_superadmin(auth.uid())
  -- Admin can update users in their tenant
  OR (is_tenant_admin() AND tenant_id = get_user_tenant_id())
  -- Instructors can update students in their tenant (for pincode reset)
  OR can_reset_pincode_for_user(id)
);