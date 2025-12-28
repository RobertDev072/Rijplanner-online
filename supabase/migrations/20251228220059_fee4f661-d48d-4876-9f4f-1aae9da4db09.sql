-- Add policy to allow anonymous users to check credentials during login
-- This is necessary because users need to verify username/pincode before they have a session
CREATE POLICY "users_anonymous_login_check" ON public.users
FOR SELECT 
TO anon
USING (true);

-- Note: This policy allows SELECT for login verification
-- The actual authentication happens via Supabase Auth which then restricts access properly