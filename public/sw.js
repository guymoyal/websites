// Monetag Push Notification Service Worker
self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'New notification',
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        data: data.data || {},
        requireInteraction: false,
        silent: false
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', options)
      );
    } catch (e) {
      console.log('Push notification error:', e);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Clean up notifications
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event.notification.tag);
});