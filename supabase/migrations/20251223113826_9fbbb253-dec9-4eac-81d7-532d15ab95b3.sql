-- Make tenant_id nullable for superadmin users
ALTER TABLE public.users ALTER COLUMN tenant_id DROP NOT NULL;

-- Create superadmin user
INSERT INTO public.users (username, pincode, role, name, tenant_id) 
VALUES ('superadmin', '0000', 'superadmin', 'Super Administrator', NULL);