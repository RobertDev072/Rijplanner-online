-- =============================================
-- SECURITY HELPER FUNCTIONS
-- =============================================

-- Function to get the tenant_id of the current authenticated user
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid()
$$;

-- Function to check if user belongs to a specific tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND tenant_id = _tenant_id
  )
$$;

-- Function to get the role of the current authenticated user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- Function to check if current user is admin or instructor in their tenant
CREATE OR REPLACE FUNCTION public.is_tenant_admin_or_instructor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'instructor')
  )
$$;

-- Function to check if current user is tenant admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
$$;

-- =============================================
-- DROP ALL EXISTING POLICIES
-- =============================================

-- Users table
DROP POLICY IF EXISTS "Allow read access to users for login" ON public.users;
DROP POLICY IF EXISTS "Allow insert for user creation" ON public.users;
DROP POLICY IF EXISTS "Allow update for user management" ON public.users;
DROP POLICY IF EXISTS "Allow delete for user management" ON public.users;

-- Tenants table
DROP POLICY IF EXISTS "Allow read access to tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow tenant updates" ON public.tenants;
DROP POLICY IF EXISTS "Allow tenant inserts" ON public.tenants;

-- Lessons table
DROP POLICY IF EXISTS "Allow read access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow delete lessons" ON public.lessons;

-- Lesson credits table
DROP POLICY IF EXISTS "Allow read access to lesson_credits" ON public.lesson_credits;
DROP POLICY IF EXISTS "Allow lesson_credits modifications" ON public.lesson_credits;
DROP POLICY IF EXISTS "Allow lesson_credits updates" ON public.lesson_credits;

-- Lesson feedback table
DROP POLICY IF EXISTS "Allow read access to lesson_feedback" ON public.lesson_feedback;
DROP POLICY IF EXISTS "Allow insert lesson_feedback" ON public.lesson_feedback;
DROP POLICY IF EXISTS "Allow update lesson_feedback" ON public.lesson_feedback;

-- Vehicles table
DROP POLICY IF EXISTS "Allow read access to vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow vehicle modifications" ON public.vehicles;

-- Push subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.push_subscriptions;

-- Feature flags table
DROP POLICY IF EXISTS "Superadmin can manage all feature flags" ON public.feature_flags;

-- Audit logs table
DROP POLICY IF EXISTS "Superadmin can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Impersonation sessions table
DROP POLICY IF EXISTS "Superadmin can manage impersonation sessions" ON public.impersonation_sessions;

-- =============================================
-- NEW SECURE RLS POLICIES
-- =============================================

-- USERS TABLE
-- Allow public read for login (only username check, pincode verified server-side)
CREATE POLICY "users_select_for_login" ON public.users
FOR SELECT USING (
  -- Superadmins can see all users
  public.is_superadmin(auth.uid())
  OR
  -- Users can see themselves
  id = auth.uid()
  OR
  -- Admins/instructors can see users in their tenant
  (public.is_tenant_admin_or_instructor() AND tenant_id = public.get_user_tenant_id())
);

-- Only admins can insert users (in their tenant) or superadmins anywhere
CREATE POLICY "users_insert" ON public.users
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- Users can update themselves, admins can update users in their tenant
CREATE POLICY "users_update" ON public.users
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
  OR
  id = auth.uid()
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- Only admins can delete users in their tenant
CREATE POLICY "users_delete" ON public.users
FOR DELETE USING (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- TENANTS TABLE
-- Users can see their own tenant, superadmins can see all
CREATE POLICY "tenants_select" ON public.tenants
FOR SELECT USING (
  public.is_superadmin(auth.uid())
  OR
  id = public.get_user_tenant_id()
);

-- Only superadmins can create tenants
CREATE POLICY "tenants_insert" ON public.tenants
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
);

-- Admins can update their own tenant, superadmins can update any
CREATE POLICY "tenants_update" ON public.tenants
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin() AND id = public.get_user_tenant_id())
);

-- LESSONS TABLE
-- Students see their lessons, instructors see lessons they teach, admins see all in tenant
CREATE POLICY "lessons_select" ON public.lessons
FOR SELECT USING (
  public.is_superadmin(auth.uid())
  OR
  student_id = auth.uid()
  OR
  instructor_id = auth.uid()
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- Instructors and admins can create lessons in their tenant
CREATE POLICY "lessons_insert" ON public.lessons
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin_or_instructor() AND tenant_id = public.get_user_tenant_id())
);

-- Instructors can update their own lessons, admins can update all in tenant
CREATE POLICY "lessons_update" ON public.lessons
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
  OR
  instructor_id = auth.uid()
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- Instructors can delete their lessons, admins can delete all in tenant
CREATE POLICY "lessons_delete" ON public.lessons
FOR DELETE USING (
  public.is_superadmin(auth.uid())
  OR
  instructor_id = auth.uid()
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- LESSON CREDITS TABLE
-- Students see their credits, admins/instructors see all in tenant
CREATE POLICY "lesson_credits_select" ON public.lesson_credits
FOR SELECT USING (
  public.is_superadmin(auth.uid())
  OR
  student_id = auth.uid()
  OR
  (public.is_tenant_admin_or_instructor() AND tenant_id = public.get_user_tenant_id())
);

-- Only admins can manage credits
CREATE POLICY "lesson_credits_insert" ON public.lesson_credits
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

CREATE POLICY "lesson_credits_update" ON public.lesson_credits
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- LESSON FEEDBACK TABLE
-- Students see their feedback, instructors see feedback they gave, admins see all
CREATE POLICY "lesson_feedback_select" ON public.lesson_feedback
FOR SELECT USING (
  public.is_superadmin(auth.uid())
  OR
  student_id = auth.uid()
  OR
  instructor_id = auth.uid()
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- Instructors can create feedback for their lessons
CREATE POLICY "lesson_feedback_insert" ON public.lesson_feedback
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
  OR
  (instructor_id = auth.uid() AND tenant_id = public.get_user_tenant_id())
);

-- Instructors can update their own feedback
CREATE POLICY "lesson_feedback_update" ON public.lesson_feedback
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
  OR
  instructor_id = auth.uid()
);

-- VEHICLES TABLE
-- Users in tenant can see vehicles
CREATE POLICY "vehicles_select" ON public.vehicles
FOR SELECT USING (
  public.is_superadmin(auth.uid())
  OR
  public.user_belongs_to_tenant(tenant_id)
);

-- Admins can manage vehicles
CREATE POLICY "vehicles_insert" ON public.vehicles
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

CREATE POLICY "vehicles_update" ON public.vehicles
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

CREATE POLICY "vehicles_delete" ON public.vehicles
FOR DELETE USING (
  public.is_superadmin(auth.uid())
  OR
  (public.is_tenant_admin() AND tenant_id = public.get_user_tenant_id())
);

-- PUSH SUBSCRIPTIONS TABLE
-- Users can only manage their own subscriptions
CREATE POLICY "push_subscriptions_select" ON public.push_subscriptions
FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "push_subscriptions_insert" ON public.push_subscriptions
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "push_subscriptions_delete" ON public.push_subscriptions
FOR DELETE USING (
  user_id = auth.uid()
);

-- FEATURE FLAGS TABLE
-- Admins can see flags for their tenant, superadmins see all
CREATE POLICY "feature_flags_select" ON public.feature_flags
FOR SELECT USING (
  public.is_superadmin(auth.uid())
  OR
  public.user_belongs_to_tenant(tenant_id)
);

-- Only superadmins can manage feature flags
CREATE POLICY "feature_flags_insert" ON public.feature_flags
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
);

CREATE POLICY "feature_flags_update" ON public.feature_flags
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
);

CREATE POLICY "feature_flags_delete" ON public.feature_flags
FOR DELETE USING (
  public.is_superadmin(auth.uid())
);

-- AUDIT LOGS TABLE
-- Only superadmins can view, system can insert
CREATE POLICY "audit_logs_select" ON public.audit_logs
FOR SELECT USING (
  public.is_superadmin(auth.uid())
);

-- Allow authenticated users to insert audit logs (for logging their own actions)
CREATE POLICY "audit_logs_insert" ON public.audit_logs
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- IMPERSONATION SESSIONS TABLE
-- Only superadmins can manage
CREATE POLICY "impersonation_sessions_select" ON public.impersonation_sessions
FOR SELECT USING (
  public.is_superadmin(auth.uid())
);

CREATE POLICY "impersonation_sessions_insert" ON public.impersonation_sessions
FOR INSERT WITH CHECK (
  public.is_superadmin(auth.uid())
);

CREATE POLICY "impersonation_sessions_update" ON public.impersonation_sessions
FOR UPDATE USING (
  public.is_superadmin(auth.uid())
);

CREATE POLICY "impersonation_sessions_delete" ON public.impersonation_sessions
FOR DELETE USING (
  public.is_superadmin(auth.uid())
);