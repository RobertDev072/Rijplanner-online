// Service Worker for RijPlanner
// Version: 3.0.0 - Enhanced PWA auto-update system
// IMPORTANT: Increment CACHE_VERSION on each release!

const CACHE_VERSION = 'v3';
const CACHE_NAME = `rijplanner-${CACHE_VERSION}`;
const APP_VERSION = '3.0.0';

// Assets to pre-cache for offline support
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png'
];

// Install event - activate immediately
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${APP_VERSION}...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting to activate immediately');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${APP_VERSION}...`);
  
  event.waitUntil(
    Promise.all([
      // Delete ALL old caches (aggressive cleanup)
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      clients.claim().then(() => {
        console.log('[SW] Claimed all clients');
        // Notify all clients about the update
        return clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: APP_VERSION
            });
          });
        });
      })
    ])
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING, activating now...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: APP_VERSION });
  }
  
  // Force update check
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    self.registration.update();
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received!');

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
      try {
        const text = event.data.text();
        notificationData.body = text;
      } catch (textError) {
        console.error('[SW] Error getting push text:', textError);
      }
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: notificationData.data,
    actions: [
      { action: 'open', title: 'Bekijken', icon: '/logo.png' },
      { action: 'close', title: 'Sluiten' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/agenda';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then((focusedClient) => {
              if (focusedClient && 'navigate' in focusedClient) {
                return focusedClient.navigate(urlToOpen);
              }
            });
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, always try network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For other requests, try cache first then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
