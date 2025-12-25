-- Create lesson_feedback table for instructor feedback after completed lessons
CREATE TABLE public.lesson_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL UNIQUE,
  tenant_id UUID NOT NULL,
  instructor_id UUID NOT NULL,
  student_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  topics_practiced TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (matching our auth model)
CREATE POLICY "Allow read access to lesson_feedback" 
ON public.lesson_feedback FOR SELECT 
USING (true);

CREATE POLICY "Allow insert lesson_feedback" 
ON public.lesson_feedback FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update lesson_feedback" 
ON public.lesson_feedback FOR UPDATE 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_lesson_feedback_lesson_id ON public.lesson_feedback(lesson_id);
CREATE INDEX idx_lesson_feedback_student_id ON public.lesson_feedback(student_id);