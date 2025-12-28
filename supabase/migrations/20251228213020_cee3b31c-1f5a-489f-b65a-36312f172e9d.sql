-- Create enum for tenant status
CREATE TYPE public.tenant_status AS ENUM ('active', 'trial', 'suspended');

-- Add status and user_limit columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN status public.tenant_status NOT NULL DEFAULT 'active',
ADD COLUMN user_limit integer NOT NULL DEFAULT 50,
ADD COLUMN trial_ends_at timestamp with time zone;

-- Create feature_flags table for per-tenant feature toggles
CREATE TABLE public.feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, feature_key)
);

-- Create audit_logs table for critical action tracking
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid NOT NULL,
  actor_name text NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  target_name text,
  details jsonb,
  ip_address text,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create impersonation_sessions table
CREATE TABLE public.impersonation_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  superadmin_id uuid NOT NULL,
  impersonated_user_id uuid NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS on all new tables
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = _user_id
      AND role = 'superadmin'
  )
$$;

-- RLS Policies for feature_flags (superadmin only for write, tenant users can read their own)
CREATE POLICY "Superadmin can manage all feature flags"
ON public.feature_flags
FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for audit_logs (superadmin only)
CREATE POLICY "Superadmin can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (true);

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for impersonation_sessions (superadmin only)
CREATE POLICY "Superadmin can manage impersonation sessions"
ON public.impersonation_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_feature_flags_tenant_id ON public.feature_flags(tenant_id);
CREATE INDEX idx_impersonation_sessions_superadmin ON public.impersonation_sessions(superadmin_id);

-- Add trigger for updated_at on feature_flags
CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();