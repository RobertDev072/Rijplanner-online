import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, pincode } = await req.json();

    if (!username || !pincode) {
      return new Response(
        JSON.stringify({ error: "Username and pincode are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify credentials
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, username, name, email, role, tenant_id")
      .ilike("username", username)
      .eq("pincode", pincode)
      .maybeSingle();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate email for Supabase Auth
    const email = userData.email || `${userData.id}@rijplanner.local`;

    // Try to sign in or create auth user
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: pincode,
    });

    let session = signInData?.session;

    if (signInError) {
      // Try to create auth user if doesn't exist
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: pincode,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          user_id: userData.id,
          name: userData.name,
          role: userData.role,
        },
      });

      if (!signUpError && signUpData?.user) {
        // Update the users table to set the id to match auth user
        // This ensures RLS policies work correctly
        const oldId = userData.id;
        const newId = signUpData.user.id;

        // Update user ID to match Supabase Auth ID
        if (oldId !== newId) {
          await supabaseAdmin
            .from("users")
            .update({ id: newId })
            .eq("id", oldId);
        }

        // Sign in with new credentials
        const { data: newSignIn } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password: pincode,
        });
        session = newSignIn?.session;
      }
    }

    // Return success with session tokens
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: session?.user?.id || userData.id,
          username: userData.username,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          tenant_id: userData.tenant_id,
        },
        session: session ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        } : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
