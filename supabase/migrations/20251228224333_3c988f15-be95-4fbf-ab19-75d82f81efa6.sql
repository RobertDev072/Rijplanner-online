-- Drop and recreate the lessons_update policy to allow students to accept/reject their own lessons
DROP POLICY IF EXISTS lessons_update ON public.lessons;

CREATE POLICY "lessons_update" ON public.lessons
  FOR UPDATE
  USING (
    -- Superadmins can update any lesson
    (get_auth_user_role() = 'superadmin')
    -- Admins and instructors can update lessons in their tenant
    OR ((get_auth_user_role() = ANY (ARRAY['admin', 'instructor'])) AND (tenant_id = get_auth_user_tenant_id()))
    -- Students can update (accept/reject) their own lessons
    OR (student_id = auth.uid())
  )
  WITH CHECK (
    -- Superadmins can update any lesson
    (get_auth_user_role() = 'superadmin')
    -- Admins and instructors can update lessons in their tenant
    OR ((get_auth_user_role() = ANY (ARRAY['admin', 'instructor'])) AND (tenant_id = get_auth_user_tenant_id()))
    -- Students can only update status of their own lessons (accept/reject)
    OR (student_id = auth.uid())
  );