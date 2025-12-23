-- Add remarks column to lessons table for pickup location / notes
ALTER TABLE public.lessons 
ADD COLUMN remarks TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.lessons.remarks IS 'Opmerking of ophaallocatie voor de les';