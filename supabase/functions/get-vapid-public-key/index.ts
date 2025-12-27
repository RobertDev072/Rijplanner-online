// Supabase Edge Function: get-vapid-public-key
// Returns the VAPID public key to the client (safe to expose)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");

    return new Response(
      JSON.stringify({ publicKey: publicKey ?? null }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ publicKey: null }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
