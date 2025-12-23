import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import webpush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  userIds: string[];
  title: string;
  body: string;
  tenantId: string;
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    webpush.setVapidDetails(
      'mailto:notifications@rijplanner.nl',
      vapidPublicKey,
      vapidPrivateKey
    );

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      payload
    );
    
    console.log('Push notification sent successfully to:', subscription.endpoint.substring(0, 50));
    return true;
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    console.error('Error sending push notification:', err.message);
    // If subscription is invalid/expired, return false to mark for deletion
    if (err.statusCode === 404 || err.statusCode === 410) {
      return false;
    }
    return true; // Don't delete on other errors
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userIds, title, body, tenantId }: PushNotificationRequest = await req.json();

    console.log(`Sending push notifications to ${userIds.length} users for tenant ${tenantId}`);

    // Get all push subscriptions for the specified users
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)
      .eq('tenant_id', tenantId);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for users');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

    const payload = JSON.stringify({
      title,
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `lesson-${Date.now()}`,
    });

    const invalidSubscriptions: string[] = [];
    let successCount = 0;

    // Send notifications to all subscriptions
    for (const sub of subscriptions) {
      const success = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        vapidPublicKey,
        vapidPrivateKey
      );
      
      if (success) {
        successCount++;
      } else {
        invalidSubscriptions.push(sub.id);
      }
    }

    // Remove invalid/expired subscriptions
    if (invalidSubscriptions.length > 0) {
      console.log(`Removing ${invalidSubscriptions.length} invalid subscriptions`);
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', invalidSubscriptions);
    }

    console.log(`Successfully sent ${successCount} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        removed: invalidSubscriptions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error in send-push-notification function:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);