-- Add WhatsApp number column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN whatsapp_number TEXT DEFAULT NULL;