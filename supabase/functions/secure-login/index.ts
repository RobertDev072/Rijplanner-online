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
    console.log("Login attempt for username:", username);

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
      .select("id, username, name, email, role, tenant_id, pincode")
      .ilike("username", username)
      .maybeSingle();

    console.log("User lookup result:", userData ? "Found user" : "No user found", userError);

    if (userError || !userData) {
      console.log("User not found for username:", username);
      return new Response(
        JSON.stringify({ error: "Invalid credentials", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify pincode
    if (userData.pincode !== pincode) {
      console.log("Invalid pincode for user:", username);
      return new Response(
        JSON.stringify({ error: "Invalid credentials", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate email for Supabase Auth (use user's ID to ensure consistency)
    const email = userData.email || `${userData.id}@rijplanner.local`;
    console.log("Using email for auth:", email);

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: pincode,
    });

    let session = signInData?.session;
    let authUserId = signInData?.user?.id;
    console.log("Sign in attempt:", signInError ? "Failed" : "Success", signInError?.message);

    if (signInError) {
      // Auth user doesn't exist, create one with matching ID
      console.log("Creating new auth user with ID:", userData.id);
      
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        id: userData.id, // Use the same ID as the users table
        email,
        password: pincode,
        email_confirm: true,
        user_metadata: {
          user_id: userData.id,
          name: userData.name,
          role: userData.role,
          email_verified: true,
        },
      });

      console.log("Create user result:", signUpError ? signUpError.message : "Success");

      if (signUpError) {
        // If user already exists with different email, try to get existing user
        console.log("Trying to find existing auth user by ID");
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userData.id);
        
        if (existingUser?.user) {
          console.log("Found existing auth user, updating password");
          // Update password if user exists
          await supabaseAdmin.auth.admin.updateUserById(userData.id, {
            password: pincode,
          });
          
          // Try sign in again with the correct email
          const existingEmail = existingUser.user.email || email;
          const { data: retrySignIn, error: retryError } = await supabaseAdmin.auth.signInWithPassword({
            email: existingEmail,
            password: pincode,
          });
          
          if (!retryError) {
            session = retrySignIn.session;
            authUserId = retrySignIn.user?.id;
            console.log("Retry sign in successful");
          } else {
            console.log("Retry sign in failed:", retryError.message);
          }
        }
      } else if (signUpData?.user) {
        authUserId = signUpData.user.id;
        console.log("Auth user created with ID:", authUserId);
        
        // Sign in with new credentials
        const { data: newSignIn, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password: pincode,
        });
        
        if (!newSignInError) {
          session = newSignIn?.session;
          console.log("Sign in after create successful");
        } else {
          console.log("Sign in after create failed:", newSignInError.message);
        }
      }
    }

    // Verify we have a valid session
    if (!session) {
      console.log("No session obtained, returning error");
      return new Response(
        JSON.stringify({ 
          error: "Authentication failed - please try again", 
          success: false 
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Login successful for user:", userData.name, "with auth ID:", session.user?.id);

    // Return success with session tokens and user data from the users table
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.id, // Always use the users table ID
          username: userData.username,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          tenant_id: userData.tenant_id,
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        },
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
