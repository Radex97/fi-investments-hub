
// This is a simplified service worker
const CACHE_NAME = 'fi-investments-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle background messages from FCM
self.addEventListener('push', function(event) {
  console.log('Push message received:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Notification data:', data);
      
      const title = data.notification.title || 'FI Investments';
      const options = {
        body: data.notification.body || '',
        icon: '/logo192.png',
        badge: '/favicon.ico',
        data: {
          url: data.data?.url || '/'
        }
      };
      
      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (e) {
      console.error('Error showing notification:', e);
    }
  }
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(function(clientList) {
      const url = event.notification.data?.url || '/';
      
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
