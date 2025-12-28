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
    const body = await req.json();
    const rawUsername = body?.username;
    const rawPincode = body?.pincode;

    const username = String(rawUsername ?? '').trim();
    const pincode = String(rawPincode ?? '').trim();

    console.log("Login attempt for username:", username);

    if (!username || !pincode) {
      return new Response(
        JSON.stringify({ error: "Username and pincode are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize PINs (keep leading zeros)
    const normalizedPin = pincode.replace(/\D/g, '').slice(0, 4).padStart(4, '0');

    if (normalizedPin.length !== 4) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key to bypass RLS (admin operations)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Separate anon client for sign-in (GoTrue can behave differently with service-role keys)
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const signInWithRetry = async (email: string, password: string) => {
      // Password updates can be briefly eventual-consistent; retry a couple times
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
        if (!error && data?.session) return { session: data.session, error: null };
        if (attempt < 3) await new Promise((r) => setTimeout(r, 200));
        if (attempt === 3) return { session: null, error };
      }
      return { session: null, error: null };
    };

    // Verify credentials - fetch user from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, username, name, email, role, tenant_id, pincode")
      .ilike("username", username)
      .maybeSingle();

    console.log(
      "User lookup result:",
      userData ? `Found: ${userData.name}` : "No user found",
      userError?.message
    );

    if (userError || !userData) {
      console.log("User not found for username:", username);
      return new Response(
        JSON.stringify({ error: "Invalid credentials", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const storedPin = String(userData.pincode ?? '').trim().replace(/\D/g, '').slice(0, 4).padStart(4, '0');

    // Verify pincode (normalized, keeps leading zeros)
    if (storedPin !== normalizedPin) {
      console.log("Invalid pincode for user:", username);
      return new Response(
        JSON.stringify({ error: "Invalid credentials", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetUserId = userData.id;
    const email = `${targetUserId}@rijplanner.local`;
    console.log("Target user ID:", targetUserId, "Email:", email);

    // Check if auth user exists with this ID
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    console.log("Existing auth user check:", existingAuthUser?.user ? "Found" : "Not found");

    let session = null;

    if (existingAuthUser?.user) {
      // Auth user exists with correct ID - update password and sign in
      console.log("Auth user exists with correct ID, updating password");
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        password: normalizedPin,
        email: email,
        user_metadata: {
          user_id: userData.id,
          name: userData.name,
          role: userData.role,
          email_verified: true,
        },
      });

      if (updateError) {
        console.log("Password update failed:", updateError.message);
      }

      // Sign in (anon client) + retry for eventual consistency
      const { session: signInSession, error: signInError } = await signInWithRetry(email, normalizedPin);

      if (!signInError && signInSession) {
        session = signInSession;
        console.log("Sign in successful");
      } else {
        console.log("Sign in failed:", signInError?.message);
      }
    } else {
      // Check if there's a mismatched auth user (same email but different ID)
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const mismatchedUser = users?.users?.find(u => 
        u.email?.includes(userData.id) || 
        u.user_metadata?.user_id === userData.id
      );
      
      if (mismatchedUser && mismatchedUser.id !== targetUserId) {
        console.log("Found mismatched auth user, deleting:", mismatchedUser.id);
        await supabaseAdmin.auth.admin.deleteUser(mismatchedUser.id);
      }

      // Create new auth user with the SAME ID as users table
      console.log("Creating new auth user with ID:", targetUserId);
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        id: targetUserId,
        email,
        password: normalizedPin,
        email_confirm: true,
        user_metadata: {
          user_id: userData.id,
          name: userData.name,
          role: userData.role,
          email_verified: true,
        },
      });

      if (createError) {
        console.log("Create user error:", createError.message);

        // If creation failed because ID already exists, try signing in
        const { session: retrySession, error: retryError } = await signInWithRetry(email, normalizedPin);

        if (!retryError && retrySession) {
          session = retrySession;
          console.log("Retry sign in successful");
        } else {
          console.log("Retry sign in also failed:", retryError?.message);
        }
      } else if (createData?.user) {
        console.log("Auth user created successfully with ID:", createData.user.id);

        const { session: signInSession, error: signInError } = await signInWithRetry(email, normalizedPin);

        if (!signInError && signInSession) {
          session = signInSession;
          console.log("Sign in after create successful");
        } else {
          console.log("Sign in after create failed:", signInError?.message);
        }
      }
    }

    // Verify we have a session
    if (!session) {
      console.log("No session obtained");
      return new Response(
        JSON.stringify({ 
          error: "Authentication failed - please try again", 
          success: false 
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the session user ID matches our target user ID
    if (session.user?.id !== targetUserId) {
      console.log("WARNING: Session user ID mismatch!", session.user?.id, "vs", targetUserId);
    }

    console.log("Login successful for user:", userData.name, "Auth ID:", session.user?.id);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: targetUserId, // Always return the users table ID
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
