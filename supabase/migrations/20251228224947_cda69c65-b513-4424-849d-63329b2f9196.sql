-- Fix 1: Update users_select policy to restrict students from seeing other students' PII
-- Students should only see their own record, admins/instructors can see all users in their tenant

DROP POLICY IF EXISTS "users_select" ON public.users;

CREATE POLICY "users_select" ON public.users
FOR SELECT
USING (
  -- Users can always see their own record
  (id = auth.uid())
  -- Superadmins can see all users
  OR is_superadmin(auth.uid())
  -- Admins and instructors can see all users in their tenant (needed for lesson management)
  OR (
    is_tenant_admin_or_instructor()
    AND tenant_id IS NOT NULL 
    AND tenant_id = get_user_tenant_id()
  )
);

-- Fix 2: Update push_subscriptions to ensure only the owner can access their own subscription keys
-- The current policy is already correct (user_id = auth.uid()), but let's add service role access for server-side operations

-- First, ensure the existing policies are secure (they already are, but let's make sure)
DROP POLICY IF EXISTS "push_subscriptions_select" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_insert" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_delete" ON public.push_subscriptions;

CREATE POLICY "push_subscriptions_select" ON public.push_subscriptions
FOR SELECT
USING (
  user_id = auth.uid()
  OR is_superadmin(auth.uid())
);

CREATE POLICY "push_subscriptions_insert" ON public.push_subscriptions
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "push_subscriptions_delete" ON public.push_subscriptions
FOR DELETE
USING (
  user_id = auth.uid()
);

-- Add UPDATE policy for push_subscriptions (was missing)
CREATE POLICY "push_subscriptions_update" ON public.push_subscriptions
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());