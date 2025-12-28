// Service Worker for RijPlanner Push Notifications
// Version: 2.0.0 - Enhanced for background push notifications

const CACHE_VERSION = 'v2';
const CACHE_NAME = `rijplanner-${CACHE_VERSION}`;

// Install event - activate immediately for faster updates
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  // Skip waiting to activate new service worker immediately
  self.skipWaiting();
});

// Activate event - claim all clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('rijplanner-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Take control of all clients immediately
      clients.claim(),
    ])
  );
});

// Listen for skip waiting message from the app
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message, activating new service worker...');
    self.skipWaiting();
  }
});

// Handle push notifications - THIS IS THE KEY FOR BACKGROUND NOTIFICATIONS
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received!');
  console.log('[SW] Push event data:', event.data ? 'present' : 'empty');

  // Default notification data
  let notificationData = {
    title: 'RijPlanner',
    body: 'Je hebt een nieuwe melding',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'rijplanner-notification-' + Date.now(),
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };

  // Parse the push data if present
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[SW] Push payload:', JSON.stringify(payload));
      
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        data: {
          url: payload.url || '/agenda',
          timestamp: Date.now(),
          ...payload.data,
        },
      };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      // Try to get text if JSON fails
      try {
        const text = event.data.text();
        console.log('[SW] Push text:', text);
        notificationData.body = text;
      } catch (textError) {
        console.error('[SW] Error getting push text:', textError);
      }
    }
  }

  // Notification options with enhanced features
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    renotify: true, // Vibrate/alert even if replacing existing notification
    requireInteraction: false, // Auto-dismiss after a while
    vibrate: [200, 100, 200], // Vibration pattern
    data: notificationData.data,
    actions: [
      { action: 'open', title: 'Bekijken', icon: '/logo.png' },
      { action: 'close', title: 'Sluiten' },
    ],
  };

  console.log('[SW] Showing notification:', notificationData.title, options);

  // CRITICAL: Use waitUntil to keep the service worker alive during notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => {
        console.log('[SW] Notification displayed successfully');
      })
      .catch((error) => {
        console.error('[SW] Error showing notification:', error);
      })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  // Close the notification
  event.notification.close();

  // If user clicked close, don't open anything
  if (event.action === 'close') {
    return;
  }

  // Get the URL to open (default to /agenda)
  const urlToOpen = event.notification.data?.url || '/agenda';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  console.log('[SW] Opening URL:', fullUrl);

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('[SW] Found existing window, focusing...');
            return client.focus().then((focusedClient) => {
              if (focusedClient && 'navigate' in focusedClient) {
                return focusedClient.navigate(urlToOpen);
              }
            });
          }
        }
        // Otherwise open new window
        console.log('[SW] Opening new window...');
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// Handle notification close (for analytics if needed)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed by user');
});

// Fetch event - for caching (optional, mainly for offline support)
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, try network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});
