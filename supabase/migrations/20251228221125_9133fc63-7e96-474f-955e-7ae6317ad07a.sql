-- Update lessons policy to allow admins to create lessons as instructor
DROP POLICY IF EXISTS "lessons_insert" ON public.lessons;

CREATE POLICY "lessons_insert" ON public.lessons
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
  OR
  -- Instructors can create lessons where they are the instructor
  (instructor_id = auth.uid() AND public.user_belongs_to_tenant(tenant_id))
  OR
  -- Admins can create lessons for any instructor in their tenant
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- Update lessons update policy to allow admins to update any lesson in their tenant
DROP POLICY IF EXISTS "lessons_update" ON public.lessons;

CREATE POLICY "lessons_update" ON public.lessons
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
  OR
  instructor_id = auth.uid()
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- Update lessons delete policy
DROP POLICY IF EXISTS "lessons_delete" ON public.lessons;

CREATE POLICY "lessons_delete" ON public.lessons
FOR DELETE USING (
  public.is_superadmin(auth.uid())
  OR
  instructor_id = auth.uid()
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);