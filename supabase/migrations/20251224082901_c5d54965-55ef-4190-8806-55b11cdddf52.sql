-- Add secondary_color column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN secondary_color TEXT DEFAULT '#10B981';