import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode as encodeBase64Url, decode as decodeBase64Url } from "https://deno.land/std@0.190.0/encoding/base64url.ts";

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

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Helper to convert Uint8Array to ArrayBuffer for encoding
function uint8ToBuffer(arr: Uint8Array): ArrayBuffer {
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

// Convert base64url VAPID keys to JWK format for WebCrypto
function vapidKeysToJwk(publicKeyBase64: string, privateKeyBase64: string): { publicJwk: JsonWebKey; privateJwk: JsonWebKey } {
  const publicKeyBytes = decodeBase64Url(publicKeyBase64);
  const privateKeyBytes = decodeBase64Url(privateKeyBase64);
  
  // Public key is 65 bytes: 0x04 prefix + 32 bytes X + 32 bytes Y
  const x = encodeBase64Url(uint8ToBuffer(publicKeyBytes.slice(1, 33)));
  const y = encodeBase64Url(uint8ToBuffer(publicKeyBytes.slice(33, 65)));
  const d = encodeBase64Url(uint8ToBuffer(privateKeyBytes));
  
  const publicJwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x,
    y,
  };
  
  const privateJwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x,
    y,
    d,
  };
  
  return { publicJwk, privateJwk };
}

// Create VAPID JWT token
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKey: CryptoKey
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };
  
  const headerBytes = new TextEncoder().encode(JSON.stringify(header));
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const headerB64 = encodeBase64Url(uint8ToBuffer(headerBytes));
  const payloadB64 = encodeBase64Url(uint8ToBuffer(payloadBytes));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  // Convert DER signature to raw format (64 bytes: r + s)
  const signatureBytes = new Uint8Array(signature);
  let rawSignature: Uint8Array;
  
  if (signatureBytes.length === 64) {
    rawSignature = signatureBytes;
  } else {
    // DER format: need to extract r and s
    rawSignature = derToRaw(signatureBytes);
  }
  
  const signatureB64 = encodeBase64Url(uint8ToBuffer(rawSignature));
  return `${unsignedToken}.${signatureB64}`;
}

// Convert DER signature to raw format
function derToRaw(der: Uint8Array): Uint8Array {
  const raw = new Uint8Array(64);
  
  // DER format: 0x30 [length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  let offset = 2; // Skip 0x30 and length
  
  // Read r
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature");
  offset++;
  const rLen = der[offset];
  offset++;
  let rStart = offset;
  let rActualLen = rLen;
  
  // Skip leading zero if present (for positive number representation)
  if (der[rStart] === 0x00 && rLen > 32) {
    rStart++;
    rActualLen--;
  }
  
  // Copy r (right-padded to 32 bytes)
  const rOffset = 32 - rActualLen;
  raw.set(der.slice(rStart, rStart + rActualLen), rOffset);
  offset += rLen;
  
  // Read s
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature");
  offset++;
  const sLen = der[offset];
  offset++;
  let sStart = offset;
  let sActualLen = sLen;
  
  // Skip leading zero if present
  if (der[sStart] === 0x00 && sLen > 32) {
    sStart++;
    sActualLen--;
  }
  
  // Copy s (right-padded to 32 bytes)
  const sOffset = 32 - sActualLen;
  raw.set(der.slice(sStart, sStart + sActualLen), 32 + sOffset);
  
  return raw;
}

// Encrypt payload using aes128gcm (RFC 8291)
async function encryptPayload(
  payload: string,
  subscriptionP256dh: string,
  subscriptionAuth: string
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);
  
  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  
  // Export local public key
  const localPublicKeyRaw = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyRaw);
  
  // Import subscriber's public key
  const subscriberKeyBytes = decodeBase64Url(subscriptionP256dh);
  const subscriberKey = await crypto.subtle.importKey(
    "raw",
    uint8ToBuffer(subscriberKeyBytes),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  
  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberKey },
    localKeyPair.privateKey,
    256
  );
  
  // Get auth secret
  const authSecret = decodeBase64Url(subscriptionAuth);
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Create info for key derivation
  const keyInfo = new Uint8Array([
    ...encoder.encode("WebPush: info\0"),
    ...subscriberKeyBytes,
    ...localPublicKey,
  ]);
  
  // Derive IKM (Input Key Material) using HKDF
  const ikmKey = await crypto.subtle.importKey(
    "raw",
    uint8ToBuffer(authSecret),
    "HKDF",
    false,
    ["deriveBits"]
  );
  
  const ikm = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(sharedSecret), info: keyInfo },
    ikmKey,
    256
  );
  
  // Derive CEK (Content Encryption Key) and nonce
  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
  
  const prkForContent = await crypto.subtle.importKey(
    "raw",
    ikm,
    "HKDF",
    false,
    ["deriveBits"]
  );
  
  const cek = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: cekInfo },
    prkForContent,
    128
  );
  
  const nonce = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: nonceInfo },
    prkForContent,
    96
  );
  
  // Import CEK for AES-GCM
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cek,
    "AES-GCM",
    false,
    ["encrypt"]
  );
  
  // Add padding (RFC 8291 requires delimiter byte 0x02)
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 0x02; // Delimiter
  
  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(nonce), tagLength: 128 },
    aesKey,
    paddedPayload
  );
  
  // Build encrypted content (RFC 8188 aes128gcm)
  const recordSize = 4096;
  const header = new Uint8Array(21 + localPublicKey.length);
  header.set(salt, 0); // 16 bytes salt
  header[16] = (recordSize >> 24) & 0xff;
  header[17] = (recordSize >> 16) & 0xff;
  header[18] = (recordSize >> 8) & 0xff;
  header[19] = recordSize & 0xff;
  header[20] = localPublicKey.length;
  header.set(localPublicKey, 21);
  
  const encrypted = new Uint8Array(header.length + ciphertext.byteLength);
  encrypted.set(header);
  encrypted.set(new Uint8Array(ciphertext), header.length);
  
  return { encrypted, salt, localPublicKey };
}

// Send web push notification using native fetch
async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string
): Promise<{ success: boolean; statusCode?: number }> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    // Convert VAPID keys to JWK and import
    const { privateJwk } = vapidKeysToJwk(vapidPublicKey, vapidPrivateKey);
    
    const privateKey = await crypto.subtle.importKey(
      "jwk",
      privateJwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );
    
    // Create VAPID JWT
    const jwt = await createVapidJwt(audience, subject, privateKey);
    
    // Encrypt payload
    const { encrypted } = await encryptPayload(
      payload,
      subscription.p256dh,
      subscription.auth
    );
    
    // Build Authorization header
    const authorization = `vapid t=${jwt}, k=${vapidPublicKey}`;
    
    // Send push request - convert to ArrayBuffer for body
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Authorization": authorization,
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400", // 24 hours
        "Urgency": "high",
      },
      body: uint8ToBuffer(encrypted),
    });
    
    console.log(`Push response status: ${response.status} for endpoint: ${subscription.endpoint.substring(0, 60)}...`);
    
    if (response.status === 201 || response.status === 200) {
      return { success: true, statusCode: response.status };
    }
    
    // Log error response
    const errorText = await response.text();
    console.error(`Push failed with status ${response.status}: ${errorText}`);
    
    return { success: false, statusCode: response.status };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      throw new Error('VAPID keys not configured');
    }

    console.log('VAPID keys loaded successfully');
    console.log(`VAPID public key length: ${vapidPublicKey.length}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userIds, title, body, tenantId }: PushNotificationRequest = await req.json();

    console.log(`Sending push notifications to ${userIds.length} users for tenant ${tenantId}`);
    console.log(`Title: "${title}", Body: "${body}"`);

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
      console.log('No push subscriptions found for users:', userIds);
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
      console.log(`Sending to subscription ${sub.id} for user ${sub.user_id}`);
      
      const result = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        vapidPublicKey,
        vapidPrivateKey,
        'mailto:notifications@rijplanner.nl'
      );
      
      if (result.success) {
        successCount++;
        console.log(`✅ Successfully sent to subscription ${sub.id}`);
      } else {
        console.log(`❌ Failed to send to subscription ${sub.id}, status: ${result.statusCode}`);
        // Mark for deletion if subscription is invalid/expired (404 or 410)
        if (result.statusCode === 404 || result.statusCode === 410) {
          invalidSubscriptions.push(sub.id);
        }
      }
    }

    // Remove invalid/expired subscriptions
    if (invalidSubscriptions.length > 0) {
      console.log(`Removing ${invalidSubscriptions.length} invalid subscriptions`);
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', invalidSubscriptions);
      
      if (deleteError) {
        console.error('Error deleting invalid subscriptions:', deleteError);
      }
    }

    console.log(`✅ Successfully sent ${successCount}/${subscriptions.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        total: subscriptions.length,
        removed: invalidSubscriptions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
