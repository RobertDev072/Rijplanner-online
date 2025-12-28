// PWA Push Notifications - Subscription Management
// Enhanced for reliable background push notifications

import { supabase } from '@/integrations/supabase/client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[Push] Service Worker not supported');
    return null;
  }

  try {
    // Register the service worker with specific scope
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none', // Always check for updates
    });
    
    console.log('[Push] Service Worker registered successfully:', registration.scope);
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('[Push] Service Worker is ready');
    
    return registration;
  } catch (error) {
    console.error('[Push] Service Worker registration failed:', error);
    return null;
  }
}

export async function subscribeToPushNotifications(
  userId: string,
  tenantId: string,
  vapidPublicKey: string
): Promise<boolean> {
  if (!('PushManager' in window)) {
    console.log('[Push] Push notifications not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    console.log('[Push] Service worker is ready for push subscription');
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    console.log('[Push] Existing subscription:', subscription ? 'yes' : 'no');
    
    if (!subscription) {
      // Subscribe to push notifications
      console.log('[Push] Creating new subscription with VAPID key...');
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });
      console.log('[Push] Push subscription created:', subscription.endpoint.substring(0, 50) + '...');
    }

    // Extract keys from subscription
    const subscriptionJson = subscription.toJSON();
    const endpoint = subscriptionJson.endpoint!;
    const p256dh = subscriptionJson.keys?.p256dh || '';
    const auth = subscriptionJson.keys?.auth || '';

    console.log('[Push] Saving subscription to database for user:', userId);

    // Save subscription to database - use upsert with proper conflict handling
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        tenant_id: tenantId,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,endpoint',
      });

    if (error) {
      console.error('[Push] Error saving push subscription:', error);
      return false;
    }

    console.log('[Push] Push subscription saved successfully');
    return true;
  } catch (error) {
    console.error('[Push] Error subscribing to push notifications:', error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(userId: string): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // Remove from database
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint);
      
      console.log('Unsubscribed from push notifications');
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

export async function sendPushNotification(
  userIds: string[],
  title: string,
  body: string,
  tenantId: string
): Promise<boolean> {
  console.log('[Push] Sending push notification to users:', userIds);
  console.log('[Push] Title:', title);
  console.log('[Push] Body:', body);
  console.log('[Push] Tenant:', tenantId);
  
  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: { userIds, title, body, tenantId },
    });

    if (error) {
      console.error('[Push] Error sending push notification:', error);
      return false;
    }

    console.log('[Push] Push notification sent successfully:', data);
    return true;
  } catch (error) {
    console.error('[Push] Error invoking push notification function:', error);
    return false;
  }
}

export function checkPushNotificationSupport(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    // Some browsers/environments can throw (e.g. insecure context)
    return false;
  }
}