-- Add ai_insights JSONB column to users table for AI progress analysis
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS ai_insights JSONB DEFAULT NULL;

-- Add index for better query performance on ai_insights
CREATE INDEX IF NOT EXISTS idx_users_ai_insights ON public.users USING GIN (ai_insights) WHERE ai_insights IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.users.ai_insights IS 'AI-generated insights including overall_score, top_weaknesses, and estimated_lessons_to_exam';