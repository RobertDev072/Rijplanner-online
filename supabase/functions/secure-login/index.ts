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

    // Return user data (excluding sensitive pincode in response)
    const { pincode: _removed, ...safeUser } = user;

    console.log(`User ${user.username} logged in successfully`);

    return new Response(
      JSON.stringify({ user: safeUser }),
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
