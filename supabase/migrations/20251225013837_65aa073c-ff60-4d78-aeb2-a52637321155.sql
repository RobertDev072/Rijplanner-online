-- Add theory_passed field to users table
ALTER TABLE public.users 
ADD COLUMN theory_passed boolean NOT NULL DEFAULT false;

-- Add theory_passed_at timestamp to track when theory was passed
ALTER TABLE public.users 
ADD COLUMN theory_passed_at timestamp with time zone DEFAULT NULL;