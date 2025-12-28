-- Remove the insecure anonymous login policy
DROP POLICY IF EXISTS "users_anonymous_login_check" ON public.users;

-- Add explicit deny policies for audit logs modifications
CREATE POLICY "audit_logs_no_update" ON public.audit_logs
FOR UPDATE USING (false);

CREATE POLICY "audit_logs_no_delete" ON public.audit_logs
FOR DELETE USING (false);

-- Add tenant delete policy (superadmin only)
CREATE POLICY "tenants_delete" ON public.tenants
FOR DELETE USING (
  public.is_superadmin(auth.uid())
);

-- Add lesson_progress delete policy
CREATE POLICY "lesson_progress_delete" ON public.lesson_progress
FOR DELETE USING (
  public.is_superadmin(auth.uid())
  OR
  (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND tenant_id = lesson_progress.tenant_id
  ))
);

-- Update audit_logs insert to be more restrictive (only for logging own actions)
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;

CREATE POLICY "audit_logs_insert" ON public.audit_logs
FOR INSERT WITH CHECK (
  -- Superadmins can insert audit logs
  public.is_superadmin(auth.uid())
  OR
  -- Users can only log their own actions
  actor_id = auth.uid()
);