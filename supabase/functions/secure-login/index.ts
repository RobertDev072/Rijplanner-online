/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, pincode } = await req.json();

    if (!username || !pincode) {
      return new Response(
        JSON.stringify({ error: "Gebruikersnaam en pincode zijn vereist" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize pincode - trim and ensure 4 digits
    const normalizedPincode = pincode.toString().trim().padStart(4, '0');

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find user by username (case-insensitive) and pincode
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .ilike("username", username.trim())
      .eq("pincode", normalizedPincode)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Er ging iets mis bij het inloggen" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Ongeldige gebruikersnaam of pincode" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a synthetic email for Supabase Auth based on user id
    const authEmail = `${user.id}@rijplanner.local`;
    const authPassword = `${user.id}-${normalizedPincode}-secure`;

    // Try to sign in first
    let session = null;
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (signInError) {
      console.log("Sign in failed, trying to create auth user:", signInError.message);
      
      // Create auth user if doesn't exist
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        password: authPassword,
        user_metadata: { user_id: user.id },
        email_confirm: true,
      });

      if (signUpError) {
        console.error("Failed to create auth user:", signUpError);
        // User might already exist with different password, try to update it
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = userList?.users?.find(u => u.email === authEmail);
        
        if (existingAuthUser) {
          // Update the password
          await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
            password: authPassword,
          });
          
          // Try signing in again
          const { data: retrySignIn, error: retryError } = await supabaseAdmin.auth.signInWithPassword({
            email: authEmail,
            password: authPassword,
          });
          
          if (retryError) {
            console.error("Retry sign in failed:", retryError);
            return new Response(
              JSON.stringify({ error: "Authenticatie mislukt" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          session = retrySignIn.session;
        }
      } else {
        // Sign in with newly created user
        const { data: newSignIn } = await supabaseAdmin.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        session = newSignIn?.session;
      }
    } else {
      session = signInData.session;
    }

    // Check if auth user id matches the users table id, if not update it
    if (session?.user?.id && session.user.id !== user.id) {
      console.log(`Auth user ID mismatch: ${session.user.id} vs ${user.id}, recreating...`);
      
      // Delete old auth user and create new one with correct ID
      await supabaseAdmin.auth.admin.deleteUser(session.user.id);
      
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        id: user.id,
        email: authEmail,
        password: authPassword,
        user_metadata: { user_id: user.id },
        email_confirm: true,
      });
      
      if (!createError) {
        const { data: finalSignIn } = await supabaseAdmin.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        session = finalSignIn?.session;
      }
    }

    // Return user data and session
    const { pincode: _removed, ...safeUser } = user;

    console.log(`User ${user.username} logged in successfully with auth session`);

    return new Response(
      JSON.stringify({ 
        user: safeUser,
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
      JSON.stringify({ error: "Er ging iets mis. Probeer het opnieuw." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
